#!/bin/bash
# =============================================================
# BBB Stalled Recording Rebuilder
# =============================================================
# Finds recordings that reached 'sanity' stage but haven't
# advanced to 'recorded'/'processed'/'published' within 30
# minutes, and triggers a rebuild. Runs hourly via cron.
#
# This is a safety net for when the rap-worker pipeline stalls
# silently — the heal HTTP service handles on-demand recovery
# for cases where an admin explicitly clicks Sync.
# =============================================================

LOG="/var/log/bigbluebutton/vacademy-heal-service.log"
STATUS_DIR="/var/bigbluebutton/recording/status"

# Only consider sanity .done files older than 30 minutes
find "$STATUS_DIR/sanity/" -name "*.done" -mmin +30 2>/dev/null | while read -r f; do
    mid=$(basename "$f" .done)

    # Skip if pipeline already progressed
    if [ -f "$STATUS_DIR/recorded/$mid.done" ]; then continue; fi
    if [ -f "$STATUS_DIR/processed/$mid.done" ]; then continue; fi
    if [ -f "$STATUS_DIR/published/$mid.done" ]; then continue; fi

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] cron auto-heal: rebuilding stalled recording $mid" >> "$LOG"
    bbb-record --rebuild "$mid" >> "$LOG" 2>&1
done
