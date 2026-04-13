#!/usr/bin/env python3
"""
BBB Heal Service — on-demand recovery for stalled BBB recording pipeline.

Listens on 127.0.0.1:9091 (exposed via nginx at /vacademy-heal/).
Authenticated via X-BBB-Secret header.

Problem this solves:
  BBB's getRecordings API only returns recordings that reached the 'published'
  stage. If the rap-worker pipeline stalls mid-processing (e.g. stuck at 'sanity'),
  BBB reports the recording as nonexistent even though the raw files are on disk.
  This service lets the Vacademy backend trigger 'bbb-record --rebuild' remotely
  to restart the pipeline, which eventually fires the post-publish hook that
  uploads the recording to S3.

Endpoints:
  GET /state?externalMeetingId=xxx
      Returns {externalMeetingId, internalMeetingId, state}
      state: sanity | recorded | processed | published | raw_only | not_found

  POST /heal?externalMeetingId=xxx
      If pipeline is stalled, runs 'bbb-record --rebuild'.
      Rate-limited: max 1 rebuild per meeting per 30 minutes.
      Returns {status, internalMeetingId, previousState, message}
      status: REBUILD_TRIGGERED | ALREADY_PUBLISHED | NOT_FOUND | RATE_LIMITED | ERROR
"""

import os
import glob
import json
import time
import hmac
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from threading import Lock

BBB_SECRET = os.environ.get('VACADEMY_BBB_SECRET', '') or os.environ.get('BBB_SECRET', '')
PORT = int(os.environ.get('BBB_HEAL_PORT', '9091'))
LOG_FILE = '/var/log/bigbluebutton/vacademy-heal-service.log'
RAW_DIR = '/var/bigbluebutton/recording/raw'
STATUS_DIR = '/var/bigbluebutton/recording/status'
PIPELINE_STAGES = ['published', 'processed', 'recorded', 'sanity']
RATE_LIMIT_SECONDS = 30 * 60  # 30 minutes

_rate_limit_lock = Lock()
_last_heal_at = {}  # {internal_id: timestamp}


def log(msg):
    try:
        with open(LOG_FILE, 'a') as f:
            f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
    except Exception:
        pass


def find_internal_id(external_id):
    """Find internal meeting ID by scanning events.xml files in raw/ for the external ID."""
    if not external_id or len(external_id) < 8:
        return None
    for events_file in glob.glob(f"{RAW_DIR}/*/events.xml"):
        try:
            with open(events_file, 'r', errors='ignore') as f:
                if external_id in f.read():
                    return os.path.basename(os.path.dirname(events_file))
        except Exception:
            continue
    return None


def get_pipeline_state(internal_id):
    """Return the furthest stage reached, or 'raw_only' / 'not_found'."""
    for stage in PIPELINE_STAGES:
        if os.path.exists(f"{STATUS_DIR}/{stage}/{internal_id}.done"):
            return stage
    if os.path.isdir(f"{RAW_DIR}/{internal_id}"):
        return 'raw_only'
    return 'not_found'


def check_rate_limit(internal_id):
    """Return True if allowed, False if rate-limited (< 30 min since last rebuild)."""
    now = time.time()
    with _rate_limit_lock:
        last = _last_heal_at.get(internal_id, 0)
        if now - last < RATE_LIMIT_SECONDS:
            return False
        _last_heal_at[internal_id] = now
    return True


def trigger_rebuild(internal_id):
    """Run 'bbb-record --rebuild'. Returns (success, stdout, stderr)."""
    try:
        result = subprocess.run(
            ['bbb-record', '--rebuild', internal_id],
            capture_output=True, text=True, timeout=30
        )
        return (result.returncode == 0, result.stdout, result.stderr)
    except subprocess.TimeoutExpired:
        return (False, '', 'timeout')
    except Exception as e:
        return (False, '', str(e))


class HealHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        log(f"{self.address_string()} {format % args}")

    def _auth_ok(self):
        secret = self.headers.get('X-BBB-Secret', '')
        return BBB_SECRET and hmac.compare_digest(secret, BBB_SECRET)

    def _respond(self, code, body):
        payload = json.dumps(body).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _parse(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        external_id = params.get('externalMeetingId', [None])[0]
        return parsed.path.rstrip('/'), external_id

    def do_GET(self):
        if not self._auth_ok():
            return self._respond(403, {"error": "forbidden"})
        path, external_id = self._parse()
        if path == '/state':
            if not external_id:
                return self._respond(400, {"error": "externalMeetingId required"})
            internal_id = find_internal_id(external_id)
            if not internal_id:
                return self._respond(200, {
                    "externalMeetingId": external_id,
                    "state": "not_found"
                })
            return self._respond(200, {
                "externalMeetingId": external_id,
                "internalMeetingId": internal_id,
                "state": get_pipeline_state(internal_id)
            })
        if path == '/health':
            return self._respond(200, {"status": "ok"})
        return self._respond(404, {"error": "not found"})

    def do_POST(self):
        if not self._auth_ok():
            return self._respond(403, {"error": "forbidden"})
        path, external_id = self._parse()
        if path != '/heal':
            return self._respond(404, {"error": "not found"})
        if not external_id:
            return self._respond(400, {"error": "externalMeetingId required"})

        internal_id = find_internal_id(external_id)
        if not internal_id:
            log(f"heal: not_found externalId={external_id}")
            return self._respond(200, {
                "status": "NOT_FOUND",
                "externalMeetingId": external_id,
                "message": "No raw recording found on this server"
            })

        state = get_pipeline_state(internal_id)
        if state == 'published':
            return self._respond(200, {
                "status": "ALREADY_PUBLISHED",
                "externalMeetingId": external_id,
                "internalMeetingId": internal_id,
                "previousState": state,
                "message": "Recording already published"
            })

        if not check_rate_limit(internal_id):
            # Return HTTP 200 (not 429) — WebClient.retrieve() treats 4xx as
            # errors and throws, which would make the backend silently fall
            # back to "Already up to date". Semantically this IS a recovering
            # state (a prior call already triggered the rebuild), so 200 is
            # correct; the status field in the JSON body carries the detail.
            return self._respond(200, {
                "status": "RATE_LIMITED",
                "externalMeetingId": external_id,
                "internalMeetingId": internal_id,
                "previousState": state,
                "message": "Rebuild already triggered recently. Pipeline still processing."
            })

        log(f"heal: rebuild externalId={external_id} internalId={internal_id} previousState={state}")
        ok, stdout, stderr = trigger_rebuild(internal_id)
        if not ok:
            log(f"heal: rebuild FAILED internalId={internal_id} stderr={stderr}")
            return self._respond(500, {
                "status": "ERROR",
                "externalMeetingId": external_id,
                "internalMeetingId": internal_id,
                "previousState": state,
                "message": f"bbb-record --rebuild failed: {stderr.strip()[:200]}"
            })
        return self._respond(200, {
            "status": "REBUILD_TRIGGERED",
            "externalMeetingId": external_id,
            "internalMeetingId": internal_id,
            "previousState": state,
            "message": "Pipeline restarted. Recording will be published in ~10 minutes."
        })


def main():
    if not BBB_SECRET:
        log("ERROR: BBB_SECRET not set in environment")
        raise SystemExit("BBB_SECRET not set (expected VACADEMY_BBB_SECRET or BBB_SECRET)")
    log(f"Starting BBB heal service on 127.0.0.1:{PORT}")
    HTTPServer(('127.0.0.1', PORT), HealHandler).serve_forever()


if __name__ == '__main__':
    main()
