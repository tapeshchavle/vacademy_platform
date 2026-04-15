"""
Sound Planner — derives per-shot sound cues from the finished Director plan,
skill composer output, and narration emphasis signals. No LLM calls.

Input: a list of shot entries (post-HTML-generation) + the raw word list + tier
config. Output: the same shot entries, each with an added `sound_cues` field.

The rule cascade (applied in order per shot):

  Rule 1 — Transition cue on shot boundaries (whoosh at t=0)
  Rule 2 — Shot-type signature cue (KINETIC_TITLE → impact, DATA_STORY → chime, ...)
  Rule 3 — Skill-derived cues (number_counter → data_reveal, ring_progress → chime, ...)
  Rule 4 — Emphasis map fallback for long shots with no prior cues
  Rule 5 — Tier cap (trim to max cues per shot / per video)
  Rule 6 — Dedup + suppression (no two cues within 0.3s, no adjacent repeats)

A shot can carry zero cues — silence is a valid design choice. The planner
favors under-cuing over over-cuing.

The Director does NOT see sound information. Everything is derived from
signals the Director already produced for visual reasons.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Set, Tuple

from sound_catalog import SoundCatalog, load_catalog


# ---------------------------------------------------------------------------
# Shot-type → signature cue table
# ---------------------------------------------------------------------------
# Each entry is (role, placement, volume_mul). Placement can be:
#   - a float       — fire at that many seconds into the shot
#   - "sync[0]"     — fire at the first sync_point time (shot-relative)
#   - "sync[*]"     — fire at every sync_point, capped by tier max
#   - None          — skip shot-type cue entirely (silence is intended)
# volume_mul multiplies the role's default volume.
_SIG = Tuple[str, Any, float]  # (role, placement, volume_mul)

SHOT_TYPE_CUE: Dict[str, Optional[_SIG]] = {
    "KINETIC_TITLE":   ("impact",            0.05,      1.00),
    "KINETIC_TEXT":    ("ui_click",          "sync[*]", 0.85),
    "VIDEO_HERO":      ("transition_whoosh", 0.00,      1.00),
    "IMAGE_HERO":      ("transition_whoosh", 0.00,      0.85),
    "IMAGE_SPLIT":     ("ui_chime",          0.10,      0.90),
    "DATA_STORY":      ("data_reveal",       "sync[0]", 1.00),
    "EQUATION_BUILD":  ("ui_chime",          "sync[*]", 0.90),
    "PROCESS_STEPS":   ("ui_click",          "sync[*]", 0.85),
    "INFOGRAPHIC_SVG": None,  # silence — SVG draw-on visuals carry themselves
    "TEXT_DIAGRAM":    ("ui_chime",          "sync[0]", 0.85),
    "LOWER_THIRD":     ("ui_chime",          0.10,      0.85),
    "ANNOTATION_MAP":  ("ui_click",          "sync[*]", 0.85),
    "PRODUCT_HERO":    ("transition_whoosh", 0.00,      0.95),
}

# Visual-family grouping for transition cues. Two adjacent shots in the SAME
# family do not get a transition whoosh between them (keeps pacing breathing).
_FAMILY: Dict[str, str] = {
    "KINETIC_TITLE":   "title",
    "KINETIC_TEXT":    "title",
    "VIDEO_HERO":      "hero",
    "IMAGE_HERO":      "hero",
    "IMAGE_SPLIT":     "split",
    "DATA_STORY":      "data",
    "EQUATION_BUILD":  "data",
    "PROCESS_STEPS":   "diagram",
    "INFOGRAPHIC_SVG": "svg",
    "TEXT_DIAGRAM":    "diagram",
    "LOWER_THIRD":     "overlay",
    "ANNOTATION_MAP":  "diagram",
    "PRODUCT_HERO":    "hero",
}

# Minimum shot duration (seconds) below which we never place more than 1 cue.
_SHORT_SHOT = 2.0

# Minimum gap between any two cues in the same shot to avoid audio clutter.
_MIN_CUE_GAP = 0.30

# Silence-gap threshold for Rule 4 emphasis fallback.
_SILENCE_GAP_MIN = 0.60

# Maximum sync points we'll sound per shot under "sync[*]" placement.
_MAX_SYNC_CUES = 3


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def plan_sounds(
    entries: List[Dict[str, Any]],
    shots: List[Dict[str, Any]],
    words: List[Dict[str, Any]],
    tier_config: Dict[str, Any],
    video_id: str = "",
    catalog: Optional[SoundCatalog] = None,
) -> None:
    """Mutate `entries` in place, adding `sound_cues` to each shot entry.

    Args:
        entries: per-shot entry dicts from _generate_html_per_shot — each
                 already has `start`, `end`, `id`, `index`, `_shot_type`,
                 and optionally `_skill_audio_events`.
        shots:   the Director plan's shot objects — we read `sync_points`,
                 `shot_type`, and `start_time`/`end_time` from these.
        words:   TTS word timings for Rule 4 emphasis fallback.
        tier_config: QUALITY_TIERS entry for the current run. Reads:
                     - sound_enabled (bool)
                     - sound_max_cues_per_shot (int)
                     - sound_max_cues_per_video (int)
        video_id: stable identifier so the same run produces the same sound
                  picks on regeneration.
        catalog:  test override; production code passes None so the module
                  loads the default metadata.
    """
    if not tier_config.get("sound_enabled"):
        # Tier-gated — zero out to avoid stale cues from older runs.
        for e in entries:
            e["sound_cues"] = []
        return

    cat = catalog if catalog is not None else load_catalog()
    if cat is None:
        for e in entries:
            e["sound_cues"] = []
        return

    # Match entries to their Director shot objects (by index). This is how we
    # read sync_points that the HTML generator stashed alongside each entry.
    shots_by_index: Dict[int, Dict[str, Any]] = {}
    for s in shots:
        try:
            idx = int(s.get("shot_index", 0))
        except (TypeError, ValueError):
            idx = 0
        shots_by_index[idx] = s

    max_per_shot: int = int(tier_config.get("sound_max_cues_per_shot", 2))
    max_per_video: int = int(tier_config.get("sound_max_cues_per_video", 20))

    used_file_ids: Set[str] = set()
    prev_shot_type: Optional[str] = None
    prev_transition_file_id: Optional[str] = None
    total_cues = 0

    # Work in start-time order so "previous shot type" and dedup apply naturally.
    ordered = sorted(entries, key=lambda e: float(e.get("start", 0)))

    for entry in ordered:
        entry["sound_cues"] = []  # always initialize
        if total_cues >= max_per_video:
            continue

        shot_type = str(entry.get("_shot_type", "") or "")
        shot_idx = int(entry.get("index", 0))
        director_shot = shots_by_index.get(shot_idx, {})
        start_time = float(entry.get("start", 0.0))
        end_time = float(entry.get("end", start_time + 1.0))
        duration = max(0.01, end_time - start_time)

        cues: List[Dict[str, Any]] = []

        # ── Rule 1: Transition cue between shots of different families ──
        if prev_shot_type is not None:
            prev_family = _FAMILY.get(prev_shot_type, "other")
            cur_family = _FAMILY.get(shot_type, "other")
            if prev_family != cur_family:
                # The resolver already avoids repeats via used_file_ids, but we
                # also keep track of the *last* transition file explicitly so two
                # back-to-back transitions never land on the same file even if
                # the pool was small and the resolver had to fall back.
                transition = _resolve_cue(
                    cat, "transition_whoosh",
                    used_file_ids, video_id, shot_idx, "transition",
                    t=0.00, volume_mul=1.0,
                )
                if transition and transition.get("file_id") != prev_transition_file_id:
                    cues.append(transition)
                    prev_transition_file_id = transition.get("file_id")

        # ── Rule 2: Shot-type signature cue ──
        sig = SHOT_TYPE_CUE.get(shot_type)
        if sig is not None:
            role, placement, volume_mul = sig
            cues.extend(
                _resolve_signature_cue(
                    cat=cat,
                    role=role,
                    placement=placement,
                    volume_mul=volume_mul,
                    shot=director_shot,
                    start_time=start_time,
                    duration=duration,
                    used_file_ids=used_file_ids,
                    video_id=video_id,
                    shot_idx=shot_idx,
                )
            )

        # ── Rule 3: Skill-derived audio events ──
        skill_events = entry.get("_skill_audio_events") or []
        for ev in skill_events:
            role = ev.get("role") or ""
            t = float(ev.get("t", 0.0))
            volume_mul = float(ev.get("volume_mul", 1.0))
            if not cat.has_role(role):
                continue
            if t < 0 or t > duration:
                continue
            cue = _resolve_cue(
                cat, role,
                used_file_ids, video_id, shot_idx, f"skill:{ev.get('skill_id','?')}",
                t=t, volume_mul=volume_mul,
            )
            if cue:
                cues.append(cue)

        # ── Rule 4: Emphasis fallback for long empty shots ──
        if not cues and duration >= 2.5:
            anchor_t = _find_emphasis_anchor(words, start_time, end_time)
            if anchor_t is not None:
                cue = _resolve_cue(
                    cat, "ui_chime",
                    used_file_ids, video_id, shot_idx, "emphasis",
                    t=anchor_t, volume_mul=0.80,
                )
                if cue:
                    cues.append(cue)

        # ── Rule 6: Dedup and suppression (runs BEFORE tier cap so duplicates
        # don't eat the budget and crowd out transition cues)
        cues = _dedup_and_space(cues, min_gap=_MIN_CUE_GAP)

        # ── Rule 5: Tier caps (per-shot + global) ──
        shot_cap = 1 if duration < _SHORT_SHOT else max_per_shot
        remaining_budget = max(0, max_per_video - total_cues)
        cap = min(shot_cap, remaining_budget)
        if len(cues) > cap:
            # Prefer transition cues (they sell the edit) + loudness tiebreak
            def _priority(c: Dict[str, Any]) -> Tuple[int, float]:
                is_transition = 1 if c.get("_source") == "transition" else 0
                return (is_transition, float(c.get("volume", 0)))
            cues.sort(key=_priority, reverse=True)
            cues = cues[:cap]

        # Sort by time (player consumes in chronological order)
        cues.sort(key=lambda c: float(c.get("t", 0)))

        # Strip internal file_id metadata from the payload the player sees —
        # keep id/t/url/volume/role only. file_id stays in used_file_ids.
        entry["sound_cues"] = [_public_cue(c) for c in cues]

        total_cues += len(cues)
        prev_shot_type = shot_type


# ---------------------------------------------------------------------------
# Resolution helpers
# ---------------------------------------------------------------------------

def _resolve_cue(
    cat: SoundCatalog,
    role: str,
    used_file_ids: Set[str],
    video_id: str,
    shot_idx: int,
    slot: str,
    *,
    t: float,
    volume_mul: float,
) -> Optional[Dict[str, Any]]:
    """Resolve a role → concrete cue dict, marking the file as used."""
    if not cat.has_role(role):
        return None
    seed_key = f"{video_id}:{shot_idx}:{slot}:{role}"
    picked = cat.resolve(role, used_ids=used_file_ids, seed_key=seed_key)
    if not picked:
        return None
    file_id = picked.get("file_id")
    if file_id:
        used_file_ids.add(file_id)
    volume = max(0.0, min(1.0, picked["volume_hint"] * volume_mul))
    return {
        "id": f"sfx_{shot_idx}_{slot}",
        "t": round(float(t), 3),
        "url": picked.get("url"),
        "volume": round(volume, 3),
        "role": role,
        "file_id": file_id,                          # stripped before serialization
        "duration": round(picked.get("duration", 0.0), 3),
        "_source": slot,
    }


def _resolve_signature_cue(
    cat: SoundCatalog,
    role: str,
    placement: Any,
    volume_mul: float,
    shot: Dict[str, Any],
    start_time: float,
    duration: float,
    used_file_ids: Set[str],
    video_id: str,
    shot_idx: int,
) -> List[Dict[str, Any]]:
    """Resolve a SHOT_TYPE_CUE entry to one or more concrete cues."""
    if not cat.has_role(role):
        return []

    # Fixed-time placement (e.g. 0.05)
    if isinstance(placement, (int, float)):
        t = float(placement)
        if t >= duration:
            return []
        cue = _resolve_cue(
            cat, role, used_file_ids, video_id, shot_idx, "signature",
            t=t, volume_mul=volume_mul,
        )
        return [cue] if cue else []

    # Sync-point placement
    if isinstance(placement, str) and placement.startswith("sync["):
        sync_points = shot.get("sync_points") or []
        rel_times = _shot_relative_sync_times(sync_points, start_time, duration)
        if not rel_times:
            return []
        if placement == "sync[0]":
            rel_times = rel_times[:1]
        elif placement == "sync[*]":
            rel_times = rel_times[:_MAX_SYNC_CUES]
        out: List[Dict[str, Any]] = []
        for i, t in enumerate(rel_times):
            cue = _resolve_cue(
                cat, role, used_file_ids, video_id, shot_idx,
                f"sync{i}", t=t, volume_mul=volume_mul,
            )
            if cue:
                out.append(cue)
        return out

    return []


def _shot_relative_sync_times(
    sync_points: List[Dict[str, Any]],
    start_time: float,
    duration: float,
) -> List[float]:
    """Extract shot-relative times from Director sync points."""
    out: List[float] = []
    for sp in sync_points:
        try:
            abs_t = float(sp.get("time", 0))
        except (TypeError, ValueError):
            continue
        rel = abs_t - start_time
        # Allow a tiny negative nudge (sync point slightly before shot boundary)
        if -0.05 <= rel <= duration - 0.05:
            out.append(max(0.0, rel))
    return sorted(out)


# ---------------------------------------------------------------------------
# Rule 4 — Emphasis fallback
# ---------------------------------------------------------------------------

def _find_emphasis_anchor(
    words: List[Dict[str, Any]],
    shot_start: float,
    shot_end: float,
) -> Optional[float]:
    """Pick a single emphasis anchor inside a shot's window.

    Strategy:
      1. Longest silence gap ≥ _SILENCE_GAP_MIN — place 80ms before speech resumes
      2. Otherwise, first stress-peak word (≥7 chars) in the window
      3. Otherwise, None
    """
    best_gap: Tuple[float, float] = (0.0, 0.0)  # (gap_duration, trigger_time)
    prev_end = shot_start
    first_peak_rel: Optional[float] = None

    for w in words:
        try:
            w_start = float(w.get("start", 0.0))
            w_end = float(w.get("end", w_start))
        except (TypeError, ValueError):
            continue
        if w_end < shot_start or w_start > shot_end:
            continue
        text = str(w.get("word", "")).strip()
        if not text:
            continue

        gap = w_start - prev_end
        if gap >= _SILENCE_GAP_MIN and gap > best_gap[0]:
            trigger_abs = max(shot_start, w_start - 0.08)
            best_gap = (gap, trigger_abs - shot_start)

        if first_peak_rel is None and len(text) >= 7:
            first_peak_rel = max(0.0, w_start - shot_start)

        prev_end = w_end

    if best_gap[0] > 0:
        return round(best_gap[1], 3)
    if first_peak_rel is not None:
        return round(first_peak_rel, 3)
    return None


# ---------------------------------------------------------------------------
# Rule 6 — Dedup + suppression
# ---------------------------------------------------------------------------

def _dedup_and_space(
    cues: List[Dict[str, Any]],
    min_gap: float,
) -> List[Dict[str, Any]]:
    """Enforce min gap between cues; drop lower-volume conflicts.

    Transition cues get a co-existence exemption: when a transition at t≈0
    lands near an impact/signature cue, they're treated as a single
    "whoosh + slam" cinematic gesture and both are kept. Clutter only
    arises when two non-transition cues collide within min_gap.

    Also dedups exact file_id repeats — two cues pointing at the same
    sound file within one shot would be noticed fast by listeners.
    """
    if not cues:
        return cues
    # Sort by time
    ordered = sorted(cues, key=lambda c: float(c.get("t", 0)))
    kept: List[Dict[str, Any]] = []
    seen_ids: Set[str] = set()

    def _is_transition(c: Dict[str, Any]) -> bool:
        return c.get("_source") == "transition"

    for cue in ordered:
        t = float(cue.get("t", 0))
        fid = cue.get("file_id") or ""
        # Same file in same shot → skip
        if fid and fid in seen_ids:
            continue
        if kept and (t - float(kept[-1].get("t", 0))) < min_gap:
            # Transition + non-transition pairing → keep both (cinematic
            # whoosh-and-land). Only non-transition collisions get dedup'd.
            prev = kept[-1]
            both_non_transition = not _is_transition(prev) and not _is_transition(cue)
            if both_non_transition:
                # Collision — keep louder cue
                if float(cue.get("volume", 0)) > float(prev.get("volume", 0)):
                    dropped = kept.pop()
                    seen_ids.discard(dropped.get("file_id") or "")
                else:
                    continue
        kept.append(cue)
        if fid:
            seen_ids.add(fid)
    return kept


# ---------------------------------------------------------------------------
# Payload cleanup
# ---------------------------------------------------------------------------

def _public_cue(cue: Dict[str, Any]) -> Dict[str, Any]:
    """Strip internal fields before the cue reaches the shot payload JSON."""
    return {
        "id": cue.get("id"),
        "t": cue.get("t"),
        "url": cue.get("url"),
        "volume": cue.get("volume"),
        "role": cue.get("role"),
        "duration": cue.get("duration"),
    }
