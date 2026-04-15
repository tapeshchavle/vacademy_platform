/**
 * useSoundScheduler — plays per-shot sound effect cues live during playback.
 *
 * Contract:
 *   1. The backend Sound Planner emits `sound_cues` on each timeline entry.
 *   2. Every cue carries `absolute_time` (global seconds on the master clock)
 *      and `url` (S3 public URL to the audio file).
 *   3. This hook preloads every unique URL via Howler once on mount/cue change,
 *      then fires cues as `masterClockSec` crosses their trigger times.
 *
 * Why Howler (not raw Web Audio):
 *   - Handles iOS/Android autoplay unlock transparently — the audio context
 *     resumes on the first user gesture (typically the play button) without
 *     custom unlock code.
 *   - Polyphony: a Howl instance can play the same source multiple times
 *     concurrently. Not needed for our one-shot cues today, but free.
 *   - Short stings (<10s) are decoded into memory for zero-latency playback;
 *     long ambient loops can be streamed via `html5: true` (future work).
 *
 * Seek semantics:
 *   When the user seeks the master timeline, the scheduler recomputes which
 *   cues are "already played" (any cue whose trigger is before the new time
 *   is marked played so it never fires again this session). Seeking forward
 *   skips cues; seeking backward does NOT replay past cues — one-shot only.
 *
 * Kill switch:
 *   When `enabled` is false or the cues array is empty, the hook does nothing
 *   (no network requests, no Howl instances).
 *
 * This file is kept in sync with the admin dashboard version. If you change
 * one, update the other.
 */

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';
import type { SoundCue } from '../types';

export interface UseSoundSchedulerOptions {
  /** All sound cues for the video, pre-merged across entries. Each cue MUST
   *  carry an `absolute_time` (global master-clock seconds). */
  cues: SoundCue[] | undefined;
  /** Master clock in seconds — same source the rest of the player uses. */
  masterClockSec: number;
  /** Whether playback is currently running. Pauses all sound on false. */
  isPlaying: boolean;
  /** Scheduler kill switch. When false, no sounds play regardless of cues. */
  enabled?: boolean;
  /** Multiplier applied to every cue's per-cue volume (0.0–1.0).
   *  Use this for a master SFX volume slider. Default 1.0. */
  masterVolume?: number;
}

/**
 * Time window around a cue's trigger during which it's considered "firing".
 * 150ms gives the onTimeUpdate tick (~250ms on most browsers) a chance to
 * catch cues even if the clock jumps by a full tick.
 */
const TRIGGER_WINDOW = 0.15;

export function useSoundScheduler({
  cues,
  masterClockSec,
  isPlaying,
  enabled = true,
  masterVolume = 1.0,
}: UseSoundSchedulerOptions): { resetPlayed: () => void } {
  // Map<url, Howl> — one Howl per unique cue URL, reused across cues.
  const howlsRef = useRef<Map<string, Howl>>(new Map());
  // Set<cue.id> of cues already fired this session. Reset on seek/reset.
  const playedRef = useRef<Set<string>>(new Set());
  // Track the last observed clock value so we can detect seeks (big jumps).
  const lastClockRef = useRef<number>(masterClockSec);

  // Stable list of unique cue URLs for preload diffing.
  const uniqueUrls = useMemo(() => {
    if (!enabled || !cues || cues.length === 0) return [] as string[];
    const s = new Set<string>();
    for (const c of cues) {
      if (c.url) s.add(c.url);
    }
    return Array.from(s);
  }, [cues, enabled]);

  // Preload every unique Howl once. Re-run only when the URL set changes.
  useEffect(() => {
    if (uniqueUrls.length === 0) return;

    const map = howlsRef.current;
    // Add Howls for new URLs
    for (const url of uniqueUrls) {
      if (!map.has(url)) {
        const howl = new Howl({
          src: [url],
          preload: true,
          volume: 1.0, // actual volume is set per .play() via cue.volume
        });
        map.set(url, howl);
      }
    }
    // Drop Howls for URLs no longer referenced (new video loaded)
    for (const url of Array.from(map.keys())) {
      if (!uniqueUrls.includes(url)) {
        const old = map.get(url);
        if (old) {
          try {
            old.unload();
          } catch {
            /* already unloaded */
          }
        }
        map.delete(url);
      }
    }
  }, [uniqueUrls]);

  // Cleanup on unmount — unload everything so no detached buffers leak.
  useEffect(() => {
    // Snapshot the ref to the effect's closure so the cleanup doesn't
    // read a stale .current at unmount time (react-hooks/exhaustive-deps).
    const howlsMap = howlsRef.current;
    const playedSet = playedRef.current;
    return () => {
      for (const h of howlsMap.values()) {
        try {
          h.unload();
        } catch {
          /* ok */
        }
      }
      howlsMap.clear();
      playedSet.clear();
    };
  }, []);

  // Reset played set when the cues list changes (new video loaded).
  useEffect(() => {
    playedRef.current.clear();
  }, [cues]);

  // Tick: detect seeks and fire cues as the master clock crosses triggers.
  // Seek detection runs unconditionally — even while paused — so that when
  // the user scrubs the progress bar during a pause and then hits play, the
  // played-set reflects the new position. Cue firing itself is still gated
  // on isPlaying.
  useEffect(() => {
    if (!enabled || !cues || cues.length === 0) {
      lastClockRef.current = masterClockSec;
      return;
    }

    const prev = lastClockRef.current;
    const now = masterClockSec;
    lastClockRef.current = now;

    // Detect a seek: if the clock jumped backwards OR forwards by >1s,
    // recompute the played-set based on the new time.
    const isSeek = Math.abs(now - prev) > 1.0 || now < prev;
    if (isSeek) {
      const fresh = new Set<string>();
      for (const c of cues) {
        const absT = c.absolute_time ?? 0;
        if (absT < now) fresh.add(c.id);
      }
      playedRef.current = fresh;
      return;
    }

    // No cue firing when paused — the clock isn't advancing normally, so
    // no cues should cross their triggers. (Seek-during-pause was already
    // handled above.)
    if (!isPlaying) return;

    // Normal tick: fire any cue whose trigger falls in (prev, now + window]
    // and hasn't fired yet.
    const from = prev;
    const to = now + TRIGGER_WINDOW;
    for (const c of cues) {
      const absT = c.absolute_time ?? 0;
      if (absT < from || absT > to) continue;
      if (playedRef.current.has(c.id)) continue;

      const howl = howlsRef.current.get(c.url);
      if (!howl) continue;

      // Howler automatically queues the play if the file isn't loaded
      // yet — no "not loaded" guard needed.
      try {
        const vol = Math.max(0, Math.min(1, c.volume * masterVolume));
        const soundId = howl.play();
        howl.volume(vol, soundId);
      } catch {
        /* swallow — individual cue failure must not break playback */
      }
      playedRef.current.add(c.id);
    }
  }, [masterClockSec, isPlaying, cues, enabled, masterVolume]);

  // When the player pauses, suspend everything. Howler's global mute is the
  // simplest way to stop all currently-ringing sounds without tracking each
  // sound ID individually. Resume on next play by un-muting.
  useEffect(() => {
    if (!enabled) return;
    if (!isPlaying) {
      // Stop any currently-playing Howls — one-shot cues should not
      // continue ringing into a paused state. Use `.stop()` per Howl
      // because Howler.mute(true) only mutes; short stings sound
      // inconsistent if they silently finish under a mute.
      for (const h of howlsRef.current.values()) {
        try {
          h.stop();
        } catch {
          /* ok */
        }
      }
    }
  }, [isPlaying, enabled]);

  // When the master volume goes to 0, also ensure Howler's global is sane.
  useEffect(() => {
    if (!enabled) return;
    // Clamp the global volume ceiling so masterVolume=0 means silence
    // even if a cue is mid-ring.
    Howler.volume(Math.max(0, Math.min(1, masterVolume)));
  }, [masterVolume, enabled]);

  // Exposed handle for the host player to reset the played-set on hard
  // resets (e.g. replay from start). Called imperatively.
  const resetPlayed = useCallback(() => {
    playedRef.current.clear();
    for (const h of howlsRef.current.values()) {
      try {
        h.stop();
      } catch {
        /* ok */
      }
    }
  }, []);

  return { resetPlayed };
}

/**
 * Flatten an `entries` array into a single cue list with `absolute_time`
 * populated. Prefers the backend-provided `absolute_time`; falls back to
 * computing it from the entry's `inTime + cue.t` if the backend predates
 * the field (older timelines).
 *
 * Hosted as a named export so both AIContentPlayer and AIVideoPlayer can
 * build their cue list the same way.
 */
export function collectCuesFromEntries<
  T extends {
    inTime?: number;
    start?: number;
    sound_cues?: SoundCue[];
  },
>(entries: T[]): SoundCue[] {
  const out: SoundCue[] = [];
  for (const entry of entries) {
    const entryStart = entry.inTime ?? entry.start ?? 0;
    const raw = entry.sound_cues;
    if (!raw || raw.length === 0) continue;
    for (const c of raw) {
      const absT = c.absolute_time ?? entryStart + (c.t ?? 0);
      out.push({
        ...c,
        absolute_time: absT,
      });
    }
  }
  return out;
}
