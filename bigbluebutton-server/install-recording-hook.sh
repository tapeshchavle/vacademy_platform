#!/bin/bash
# =============================================================
# Install BBB Recording Upload Hook
# =============================================================
# Run this script on the BBB server to install the post-publish
# hook that uploads recordings to S3 via the Vacademy backend.
#
# Prerequisites:
#   - BBB 3.0 installed and running
#   - ffmpeg installed (for WebM → MP4 conversion)
#   - python3 available (for JSON/XML parsing)
#
# Usage:
#   bash install-recording-hook.sh <BACKEND_URL> <BBB_SECRET>
#
# Example:
#   bash install-recording-hook.sh https://api.vacademy.io 8VhLHf3B2ouubT3nTJlUzD6m69oa8hC32GdWdpuvDU
# =============================================================

set -euo pipefail

BACKEND_URL="${1:?Usage: bash install-recording-hook.sh <BACKEND_URL> <BBB_SECRET>}"
BBB_SECRET="${2:?Usage: bash install-recording-hook.sh <BACKEND_URL> <BBB_SECRET>}"

HOOK_DIR="/usr/local/bigbluebutton/core/scripts/post_publish"
HOOK_SCRIPT="$HOOK_DIR/post-publish-s3-upload.sh"
CONF_FILE="/etc/bigbluebutton/vacademy-recording.conf"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_SCRIPT="$SCRIPT_DIR/post-publish-s3-upload.sh"

echo "Installing Vacademy BBB Recording Upload Hook"
echo "============================================="
echo "  Backend URL: $BACKEND_URL"
echo "  Hook dir:    $HOOK_DIR"
echo ""

# ── 1. Install ffmpeg if not present ─────────────────────────
if ! command -v ffmpeg &>/dev/null; then
    echo "[1/9] Installing ffmpeg..."
    apt-get update -qq && apt-get install -y -qq ffmpeg
else
    echo "[1/9] ffmpeg already installed ✓"
fi

# ── 2. Configure BBB to retain raw recordings ────────────────
# Raw recordings contain individual webcam streams per user, which we
# need to extract the presenter-only video. By default BBB deletes
# raw files after publishing — this keeps them.
BBB_YML="/usr/local/bigbluebutton/core/scripts/bigbluebutton.yml"
echo "[2/9] Configuring BBB to retain raw recordings..."
if [ -f "$BBB_YML" ]; then
    if grep -q "^delete_raw_after_publish:" "$BBB_YML"; then
        # Update existing setting
        sed -i 's/^delete_raw_after_publish:.*/delete_raw_after_publish: false/' "$BBB_YML"
        echo "  Updated delete_raw_after_publish: false in $BBB_YML"
    elif grep -q "^#.*delete_raw_after_publish:" "$BBB_YML"; then
        # Uncomment and set
        sed -i 's/^#.*delete_raw_after_publish:.*/delete_raw_after_publish: false/' "$BBB_YML"
        echo "  Uncommented and set delete_raw_after_publish: false in $BBB_YML"
    else
        # Append
        echo "" >> "$BBB_YML"
        echo "# Retain raw recordings for presenter-only video extraction (Vacademy)" >> "$BBB_YML"
        echo "delete_raw_after_publish: false" >> "$BBB_YML"
        echo "  Appended delete_raw_after_publish: false to $BBB_YML"
    fi
else
    echo "  WARN: $BBB_YML not found — BBB may not be installed yet."
    echo "  After installing BBB, add this to $BBB_YML:"
    echo "    delete_raw_after_publish: false"
fi

# ── 3. Create configuration file ─────────────────────────────
echo "[3/9] Writing config to $CONF_FILE..."
cat > "$CONF_FILE" <<EOF
# Vacademy BBB Recording Upload Configuration
# Generated on $(date)

# Backend API URL (no trailing slash)
VACADEMY_BACKEND_URL=$BACKEND_URL

# BBB shared secret (must match the secret in the Vacademy DB)
VACADEMY_BBB_SECRET=$BBB_SECRET
EOF

chmod 644 "$CONF_FILE"
echo "  Config written (permissions: 644 — readable by bigbluebutton rap worker)"

# ── 4. Install the post-publish script ────────────────────────
echo "[4/9] Installing post-publish hook..."

# Ensure hook directory exists
mkdir -p "$HOOK_DIR"

# Remove old-named hook files from previous installations
rm -f "$HOOK_DIR/a]_vacademy_s3_upload.sh" "$HOOK_DIR/a]_vacademy_s3_upload.rb"

if [ -f "$SOURCE_SCRIPT" ]; then
    cp "$SOURCE_SCRIPT" "$HOOK_SCRIPT"
else
    echo "  ERROR: Source script not found at $SOURCE_SCRIPT"
    echo "  Please copy post-publish-s3-upload.sh to $HOOK_SCRIPT manually"
    exit 1
fi

chmod +x "$HOOK_SCRIPT"
echo "  Installed: $HOOK_SCRIPT"

# Create Ruby wrapper — BBB's rap-worker only executes .rb files
RUBY_WRAPPER="${HOOK_SCRIPT%.sh}.rb"
cat > "$RUBY_WRAPPER" << 'RUBYSCRIPT'
#!/usr/bin/ruby
# Wrapper to call the Vacademy S3 upload bash script
# BBB rap-worker only runs .rb files in post_publish/

meeting_id = nil
ARGV.each_with_index do |arg, i|
  meeting_id = ARGV[i + 1] if arg == '-m'
end

exit 0 if meeting_id.nil? || meeting_id.empty?

script = File.join(__dir__, File.basename(__FILE__, '.rb') + '.sh')
system("bash", script, meeting_id)
exit $?.exitstatus
RUBYSCRIPT
chmod +x "$RUBY_WRAPPER"
echo "  Ruby wrapper: $RUBY_WRAPPER"

# ── 5. Create log file ───────────────────────────────────────
echo "[5/9] Setting up logging..."
LOG_FILE="/var/log/bigbluebutton/vacademy-recording-upload.log"
touch "$LOG_FILE"
chown bigbluebutton:bigbluebutton "$LOG_FILE" 2>/dev/null || true
HEAL_LOG="/var/log/bigbluebutton/vacademy-heal-service.log"
touch "$HEAL_LOG"
chown bigbluebutton:bigbluebutton "$HEAL_LOG" 2>/dev/null || true
echo "  Upload log:  $LOG_FILE"
echo "  Heal log:    $HEAL_LOG"

# ── 6. Install BBB heal service ──────────────────────────────
echo "[6/9] Installing BBB heal service (on-demand pipeline recovery)..."
HEAL_PY_SOURCE="$SCRIPT_DIR/bbb-heal-service.py"
HEAL_PY_DEST="/usr/local/bin/bbb-heal-service.py"
HEAL_UNIT_SOURCE="$SCRIPT_DIR/bbb-heal-service.service"
HEAL_UNIT_DEST="/etc/systemd/system/bbb-heal-service.service"

if [ ! -f "$HEAL_PY_SOURCE" ] || [ ! -f "$HEAL_UNIT_SOURCE" ]; then
    echo "  ERROR: Heal service files missing at $HEAL_PY_SOURCE / $HEAL_UNIT_SOURCE"
    exit 1
fi

cp "$HEAL_PY_SOURCE" "$HEAL_PY_DEST"
chmod +x "$HEAL_PY_DEST"
cp "$HEAL_UNIT_SOURCE" "$HEAL_UNIT_DEST"

systemctl daemon-reload
systemctl enable --now bbb-heal-service.service
sleep 1
if systemctl is-active --quiet bbb-heal-service.service; then
    echo "  Heal service running on 127.0.0.1:9091"
else
    echo "  WARN: Heal service failed to start — check: journalctl -u bbb-heal-service -n 50"
fi

# ── 7. Install nginx snippet for heal service ────────────────
echo "[7/9] Installing nginx snippet for heal service..."
NGINX_SNIPPET_SOURCE="$SCRIPT_DIR/vacademy-heal.nginx"
NGINX_SNIPPET_DEST="/etc/bigbluebutton/nginx/vacademy-heal.nginx"

if [ -d "/etc/bigbluebutton/nginx" ]; then
    cp "$NGINX_SNIPPET_SOURCE" "$NGINX_SNIPPET_DEST"
    if nginx -t 2>/dev/null; then
        systemctl reload nginx
        echo "  Nginx reloaded — heal service exposed at https://$(hostname -f 2>/dev/null || echo '<host>')/vacademy-heal/"
    else
        echo "  WARN: nginx -t failed, snippet installed but nginx NOT reloaded"
        echo "  Run 'nginx -t' to debug, then 'systemctl reload nginx'"
    fi
else
    echo "  WARN: /etc/bigbluebutton/nginx not found — BBB nginx layout unusual, manual install required"
fi

# ── 8. Clean up any prior rap-resque-worker COUNT override ────
# We tried COUNT=2 parallelism to unblock slow ffmpeg jobs, but forked
# children lose the Bundler environment and fail with:
#   "cannot load such file -- optimist (LoadError)"
# Until we find a systemd-level fix that propagates BUNDLE_GEMFILE/GEM_HOME
# into the forked resque children, stay on the default COUNT=1.
echo "[8/9] Ensuring rap-resque-worker uses default COUNT=1..."
WORKER_OVERRIDE_DIR="/etc/systemd/system/bbb-rap-resque-worker.service.d"
if [ -f "$WORKER_OVERRIDE_DIR/override.conf" ]; then
    rm -f "$WORKER_OVERRIDE_DIR/override.conf"
    rmdir "$WORKER_OVERRIDE_DIR" 2>/dev/null || true
    systemctl daemon-reload
    if systemctl is-active --quiet bbb-rap-resque-worker; then
        systemctl restart bbb-rap-resque-worker
    fi
    echo "  Removed stale COUNT=2 override (reverted to BBB default)"
else
    echo "  No override present — using BBB default"
fi

# ── 9. Install daily cleanup cron (recordings older than 14 days) ───
# Ensure any previous stalled-recording hourly cron is removed — we no longer
# auto-rebuild stalled recordings; healing is on-demand via the heal service.
rm -f /etc/cron.hourly/bbb-unstall-recordings 2>/dev/null || true

echo "[9/9] Installing cleanup cron job (recordings older than 14 days)..."
CRON_JOB="0 3 * * * find /var/bigbluebutton/published/presentation/ -maxdepth 1 -mindepth 1 -type d -mtime +14 -exec rm -rf {} + ; find /var/bigbluebutton/recording/raw/ -maxdepth 1 -mindepth 1 -type d -mtime +14 -exec rm -rf {} + ; find /var/bigbluebutton/recording/status/sanity/ -name '*.done' -mtime +14 -delete ; find /var/bigbluebutton/recording/status/archived/ -name '*.done' -mtime +14 -delete ; find /var/bigbluebutton/recording/status/recorded/ -name '*.done' -mtime +14 -delete ; find /var/bigbluebutton/recording/status/processed/ -name '*.done' -mtime +14 -delete ; find /var/bigbluebutton/recording/status/published/ -name '*.done' -mtime +14 -delete"
CRON_MARKER="# vacademy-bbb-cleanup"

# Remove any previous version of this cron entry, then add fresh
( crontab -l 2>/dev/null | grep -v "$CRON_MARKER" ; echo "$CRON_MARKER" ; echo "$CRON_JOB" ) | crontab -
echo "  Daily cleanup cron installed — runs 03:00, deletes recordings older than 14 days"

# ── Done ──────────────────────────────────────────────────────
echo ""
echo "============================================="
echo "  Installation complete!"
echo "============================================="
echo ""
echo "The recording upload hook will run automatically"
echo "after each BBB recording is processed."
echo ""
echo "Deployed components:"
echo "  - Post-publish hook  → $HOOK_SCRIPT"
echo "  - Heal service       → $HEAL_PY_DEST (systemd: bbb-heal-service)"
echo "  - Nginx proxy        → /vacademy-heal/ → 127.0.0.1:9091"
echo "  - Worker parallelism → COUNT=2 (systemd override)"
echo "  - Daily 14d cleanup  → crontab (03:00)"
echo ""
echo "To test:"
echo "  1. Start a BBB meeting with recording enabled"
echo "  2. Record for a few minutes, then end the meeting"
echo "  3. Wait for BBB to process the recording (~5-15 min)"
echo "  4. Check the log: tail -f $LOG_FILE"
echo ""
echo "To manually heal a stalled recording:"
echo "  curl -X POST -H \"X-BBB-Secret: \$VACADEMY_BBB_SECRET\" \\"
echo "    'https://$(hostname -f 2>/dev/null || echo '<host>')/vacademy-heal/heal?externalMeetingId=<meetingId>'"
echo ""
echo "To uninstall:"
echo "  systemctl disable --now bbb-heal-service"
echo "  rm $HOOK_SCRIPT $RUBY_WRAPPER $HEAL_PY_DEST $HEAL_UNIT_DEST $NGINX_SNIPPET_DEST $CONF_FILE"
echo "  crontab -l | grep -v 'vacademy-bbb-cleanup' | crontab -"
echo "  systemctl daemon-reload && systemctl reload nginx"
echo ""
