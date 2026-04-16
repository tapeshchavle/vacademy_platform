"""
Sound Catalog — loads sounds_metadata.json and classifies the library into
semantic role buckets the Sound Planner can query.

Design goals:
- The pipeline never speaks in file IDs. It asks for ROLES ("ui_chime",
  "transition_whoosh", ...) and the catalog resolves to a concrete file.
- Classification is pure rules — category match + description keyword match
  + duration gate. No ML, no LLM, deterministic.
- A single sound may live in multiple role buckets (a "Whoosh" file is both
  transition_whoosh AND impact when it's short and punchy enough). That's
  fine — variety is a feature.
- Resolution is dedup-aware: the caller passes a `used_set` of file IDs
  already chosen for this video and the catalog picks the least-used option.

Adding a new role = edit ROLE_RULES and restart. Adding a new sound to the
library = drop it into sounds_metadata.json and restart.
"""
from __future__ import annotations

import hashlib
import json
import random
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

_CATALOG_CACHE: Optional["SoundCatalog"] = None


# ---------------------------------------------------------------------------
# Role classification rules
# ---------------------------------------------------------------------------
# Each rule defines:
#   categories    — exact matches against the `category` field in metadata
#   keywords      — case-insensitive substrings checked against `description`
#   min_duration  — sound must be at least this long (seconds)
#   max_duration  — sound must be at most this long (seconds)
# A sound matches a role if it satisfies (categories OR keywords) AND the
# duration gate. A sound can match multiple roles.
ROLE_RULES: Dict[str, Dict[str, Any]] = {
    "transition_whoosh": {
        # Category-only — "transition" as a keyword is too loose (matches
        # musical stings tagged as "transition elements").
        "categories": {"Whoosh", "Whooshes", "Film Burn"},
        "keywords": [],
        "min_duration": 0.15,
        "max_duration": 3.0,
    },
    "transition_riser": {
        "categories": {"Cinematic Riser", "Risers", "Riser", "CORPORATE RISER", "Rise"},
        "keywords": [],
        "min_duration": 0.8,
        "max_duration": 8.0,
    },
    "ui_chime": {
        "categories": {"Chime", "Notifications", "Musical", "Musical Chime", "Bell",
                       "Alarm & Chime"},
        "keywords": ["chime", "bell", "ding", "notification", "twinkle", "sparkle"],
        "min_duration": 0.2,
        "max_duration": 4.0,
    },
    "ui_positive": {
        "categories": {"Positive", "PowerUp"},
        "keywords": ["positive", "success", "power up", "powerup", "win", "complete",
                     "achievement", "unlock"],
        "min_duration": 0.2,
        "max_duration": 3.0,
    },
    "ui_negative": {
        "categories": {"Negative", "Error", "Alarm", "PowerDown"},
        "keywords": ["negative", "error", "fail", "wrong", "power down", "powerdown",
                     "denied", "buzzer"],
        "min_duration": 0.2,
        "max_duration": 3.0,
    },
    "ui_click": {
        "categories": {"Button", "Click", "Switch", "Pop", "Keyboard & Mouse", "PC Mouse"},
        "keywords": ["click", "button", "switch", "pop", "tap", "tick"],
        "min_duration": 0.02,
        "max_duration": 1.5,
    },
    "data_reveal": {
        "categories": {"Counter", "DATA", "Beep", "Digital"},
        "keywords": ["counter", "data", "beep", "tick", "digital", "readout"],
        "min_duration": 0.1,
        "max_duration": 3.0,
    },
    "impact": {
        "categories": {"Hits", "Percussion", "Metal", "Explosions", "Metal Slices"},
        "keywords": ["hit", "impact", "slam", "punch", "boom", "thud", "smash"],
        "min_duration": 0.1,
        "max_duration": 3.0,
    },
    "ambient_loop": {
        # Category-only by design — keyword matches like "loop" pull in
        # vehicle-engine-loop files that don't work as background.
        # Duration gate is off because Ambience files in our metadata
        # file all have duration_seconds=0 (metadata generation gap).
        "categories": {"Ambience"},
        "keywords": [],
        "min_duration": 0.0,
        "max_duration": 999.0,
    },
}


# Volume hints per role (0.0 – 1.0). The Sound Planner can override per-cue
# but these are the sane defaults a non-domain-expert would pick.
ROLE_VOLUME_DEFAULTS: Dict[str, float] = {
    "transition_whoosh": 0.45,
    "transition_riser":  0.50,
    "ui_chime":          0.55,
    "ui_positive":       0.60,
    "ui_negative":       0.55,
    "ui_click":          0.50,
    "data_reveal":       0.55,
    "impact":            0.70,
    "ambient_loop":      0.25,
}


def _default_metadata_path() -> Path:
    """The ai_service root holds sounds_metadata.json.

    This module lives at app/ai-video-gen-main/sound_catalog.py, so the
    metadata file is two levels up.
    """
    here = Path(__file__).resolve().parent
    candidates = [
        here.parent.parent / "sounds_metadata.json",  # ai_service/sounds_metadata.json
        here / "sounds_metadata.json",                # colocated fallback
        here.parent / "sounds_metadata.json",
    ]
    for c in candidates:
        if c.exists():
            return c
    return candidates[0]  # return first even if missing; loader reports error


class SoundCatalog:
    """Classified, indexed view of sounds_metadata.json."""

    def __init__(self, sounds: List[Dict[str, Any]]):
        self.sounds: List[Dict[str, Any]] = sounds
        # role -> list of indices into self.sounds
        self._by_role: Dict[str, List[int]] = {role: [] for role in ROLE_RULES}
        self._by_id: Dict[str, int] = {}
        self._classify()

    def _classify(self) -> None:
        for idx, entry in enumerate(self.sounds):
            fid = entry.get("file_id")
            if fid:
                self._by_id[fid] = idx
            category = str(entry.get("category", "") or "")
            description = str(entry.get("description", "") or "").lower()
            try:
                duration = float(entry.get("duration_seconds", 0) or 0)
            except (TypeError, ValueError):
                duration = 0.0

            for role, rule in ROLE_RULES.items():
                # Duration gate first — fastest reject
                if duration < rule.get("min_duration", 0.0):
                    continue
                if duration > rule.get("max_duration", 9999.0):
                    continue
                # Match by category OR by keyword
                cat_match = category in rule.get("categories", set())
                kw_match = False
                if not cat_match:
                    for kw in rule.get("keywords", []):
                        if kw.lower() in description:
                            kw_match = True
                            break
                if cat_match or kw_match:
                    self._by_role[role].append(idx)

    # ----- inspection ------------------------------------------------------

    def stats(self) -> Dict[str, int]:
        """Count of sounds per role — useful for debugging classification."""
        return {role: len(idxs) for role, idxs in self._by_role.items()}

    def roles_available(self) -> List[str]:
        """Roles with at least one classified sound."""
        return [r for r, idxs in self._by_role.items() if idxs]

    def has_role(self, role: str) -> bool:
        return role in self._by_role and bool(self._by_role[role])

    def get_by_id(self, file_id: str) -> Optional[Dict[str, Any]]:
        idx = self._by_id.get(file_id)
        if idx is None:
            return None
        return self.sounds[idx]

    # ----- resolution ------------------------------------------------------

    def resolve(
        self,
        role: str,
        used_ids: Optional[Set[str]] = None,
        seed_key: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Pick a concrete sound file for a role.

        Args:
            role: role bucket to sample from
            used_ids: set of file_ids already chosen in the current video —
                      the resolver will avoid repeats within the same video.
                      The caller is responsible for adding the returned id
                      to this set.
            seed_key: optional stable key (e.g. "{video_id}:{shot_idx}:{role}")
                      — if provided, picks are deterministic for the same key.
                      If None, picks are random.

        Returns:
            dict with {file_id, url, duration, category, description, role,
                       volume_hint} or None if the role bucket is empty.
        """
        indices = self._by_role.get(role, [])
        if not indices:
            return None

        used_ids = used_ids or set()

        # Prefer unused files from this bucket; fall back to any file if all
        # have been used.
        unused = [i for i in indices if self.sounds[i].get("file_id") not in used_ids]
        pool = unused if unused else indices

        if seed_key:
            # Deterministic pick — same key always resolves to the same file
            # so regenerating a video gives identical sound effects.
            h = hashlib.md5(seed_key.encode("utf-8")).hexdigest()
            pick = pool[int(h, 16) % len(pool)]
        else:
            pick = random.choice(pool)

        entry = self.sounds[pick]
        return {
            "file_id": entry.get("file_id"),
            "url": entry.get("public_url"),
            "duration": float(entry.get("duration_seconds", 0) or 0),
            "category": entry.get("category", ""),
            "description": entry.get("description", ""),
            "role": role,
            "volume_hint": ROLE_VOLUME_DEFAULTS.get(role, 0.5),
        }


    def resolve_for_topic(
        self,
        role: str,
        topic_keywords: List[str],
        seed_key: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Pick a sound file biased toward topic keywords.

        Scores every file in the role bucket by how many topic keywords
        appear in its description. The top-scoring files form a shortlist;
        the deterministic seed picks from the shortlist so the same video
        always gets the same palette entry.

        If no keywords match any file (topic is unrelated to the library),
        falls back to a plain deterministic pick from the full bucket —
        identical to resolve().
        """
        indices = self._by_role.get(role, [])
        if not indices:
            return None

        if not topic_keywords:
            return self.resolve(role, seed_key=seed_key)

        lowered = [kw.lower() for kw in topic_keywords]
        scored: List[tuple] = []  # (score, idx)
        for idx in indices:
            desc = str(self.sounds[idx].get("description", "") or "").lower()
            score = sum(1 for kw in lowered if kw in desc)
            scored.append((score, idx))

        # Sort by score descending, then by index for stability.
        scored.sort(key=lambda x: (-x[0], x[1]))

        best_score = scored[0][0]
        if best_score == 0:
            # No topic overlap — fall back to generic pick.
            return self.resolve(role, seed_key=seed_key)

        # Shortlist = all files sharing the top score (usually 1-5 files).
        shortlist = [idx for sc, idx in scored if sc == best_score]

        if seed_key:
            h = hashlib.md5(seed_key.encode("utf-8")).hexdigest()
            pick = shortlist[int(h, 16) % len(shortlist)]
        else:
            pick = shortlist[0]

        entry = self.sounds[pick]
        return {
            "file_id": entry.get("file_id"),
            "url": entry.get("public_url"),
            "duration": float(entry.get("duration_seconds", 0) or 0),
            "category": entry.get("category", ""),
            "description": entry.get("description", ""),
            "role": role,
            "volume_hint": ROLE_VOLUME_DEFAULTS.get(role, 0.5),
        }


def load_catalog(metadata_path: Optional[Path] = None) -> Optional[SoundCatalog]:
    """Load and classify sounds_metadata.json once per process."""
    global _CATALOG_CACHE
    if _CATALOG_CACHE is not None:
        return _CATALOG_CACHE

    path = metadata_path or _default_metadata_path()
    if not path.exists():
        print(f"[sound_catalog] metadata file not found at {path} — sound effects disabled")
        return None

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        print(f"[sound_catalog] failed to load {path}: {e}")
        return None

    if not isinstance(data, list):
        print(f"[sound_catalog] expected a list at root of {path}, got {type(data).__name__}")
        return None

    catalog = SoundCatalog(data)
    stats = catalog.stats()
    total = len(data)
    classified_roles = sum(1 for n in stats.values() if n > 0)
    print(
        f"[sound_catalog] loaded {total} sounds, {classified_roles}/{len(ROLE_RULES)} roles populated: "
        + ", ".join(f"{r}={n}" for r, n in stats.items() if n > 0)
    )
    _CATALOG_CACHE = catalog
    return catalog


def reset_cache() -> None:
    """Test helper — reset the module-level cache so tests can reload."""
    global _CATALOG_CACHE
    _CATALOG_CACHE = None
