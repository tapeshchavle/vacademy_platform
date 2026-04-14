# AI Video Generation — End-to-End Architecture

**Status**: Living document. Last updated 2026-04-14.
**Audience**: Engineers working on the `ai_service` pipeline, admin/learner frontends, or the render server.
**Scope**: The full "prompt → MP4" flow for VIDEO content, plus related content types (QUIZ, STORYBOOK, SLIDES, etc.) that share the same pipeline.

---

## 0. Quick mental model

```
                     ┌────────────────────────────────────────────────────────┐
                     │              External HTTP (gateway)                    │
                     └─────────────────────┬──────────────────────────────────┘
                                           │
                                           ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │  ai_service  (FastAPI, Python)                                               │
 │  ──────────────────────────────                                               │
 │  routers/external_video_generation.py   ◄── all external calls enter here    │
 │    │                                                                         │
 │    ▼                                                                         │
 │  services/video_generation_service.py   ◄── business logic, credits, DB       │
 │    │                                                                         │
 │    ▼                                                                         │
 │  ai-video-gen-main/automation_pipeline.py   ◄── the pipeline orchestrator    │
 │    │                                                                         │
 │    ├── prompts.py                  → script/image-style prompts              │
 │    ├── shot_type_cards.py          → per-shot-type HTML/CSS/JS patterns      │
 │    ├── director_prompts.py         → shot-planning prompt                    │
 │    ├── _generate_script_plan       → LLM call #1: narration + beat outline   │
 │    ├── TTS (ElevenLabs/Sarvam/Edge)→ audio + word timestamps                 │
 │    ├── _generate_style_guide       → LLM call #2: palette, background        │
 │    ├── _run_director               → LLM call #3: shot-by-shot plan          │
 │    ├── _shot_task (parallel)       → LLM call #4…N: one per shot             │
 │    ├── _process_generated_images   → Gemini / Pexels for images              │
 │    ├── _process_stock_videos       → Pexels stock video                      │
 │    └── _ensure_fonts               → inject CSS + SVG defs                   │
 │    │                                                                         │
 │    ▼                                                                         │
 │  timeline.json  +  narration.mp3  +  words.json  →  stored in S3              │
 │                                                                               │
 └──────────────────────────────────────────────────────────────────────────────┘
                                 │
           ┌─────────────────────┼─────────────────────────┐
           │                     │                         │
           ▼                     ▼                         ▼
    ┌──────────────┐      ┌──────────────┐        ┌──────────────┐
    │ Admin FE     │      │ Learner FE   │        │ Render Server│
    │ AIVideoPlayer│      │ AIVideoPlayer│        │ generate_video.py │
    │ (iframes)    │      │ (iframes)    │        │ (Playwright) │
    └──────────────┘      └──────────────┘        └──────┬───────┘
                                                          │
                                                          ▼
                                                  ┌──────────────┐
                                                  │  MP4 in S3   │
                                                  └──────────────┘
```

Two playback paths:
- **Browser player** (admin/learner): loads the timeline JSON, renders each shot's HTML in an iframe, plays the audio in sync. Real-time, not seekable at frame level.
- **Render server**: same HTML, but rendered in a headless Playwright browser that advances `gsap.globalTimeline.totalTime(t)` frame-by-frame and screenshots each frame. Outputs an MP4.

Both playback paths consume **identical** HTML/CSS/JS. The pipeline generates once, both contexts render from the same source of truth.

---

## 1. Repository layout — files that matter

### 1.1 Backend (Python, `vacademy_platform/ai_service/`)

| File | What it does |
|------|---------------|
| `app/routers/external_video_generation.py` | FastAPI routes under `/external/video/v1/*` — generate, status, urls, history, render, frame ops, audio tracks, TTS voices. |
| `app/schemas/video_generation.py` | Pydantic request/response models. `VideoGenerationRequest` is the canonical input contract. |
| `app/services/video_generation_service.py` | Business logic: credits, persistence, stage dispatch, background task management. Two overloads of `generate_till_stage()`. |
| `app/services/token_usage_service.py` | Credit charges and refund-on-failure. |
| `app/services/render_service.py` | Thin HTTP client for the external render server. |
| `app/ai-video-gen-main/automation_pipeline.py` | The pipeline orchestrator. **`run()`** is the main entry point. ~6000 lines — it owns the full script→audio→HTML→timeline lifecycle. |
| `app/ai-video-gen-main/prompts.py` | Script-generation system & user prompts, `TOPIC_SHOT_PROFILES`, image-style classification. |
| `app/ai-video-gen-main/shot_type_cards.py` | Per-shot-type reference cards (HTML templates, script blocks, guidelines). `CORE_PREAMBLE` documents all CSS utilities. `DOMAIN_SHOT_TYPES` maps subject domains → shot types. |
| `app/ai-video-gen-main/director_prompts.py` | Director LLM prompts (shot planning). Builds user prompt from beat outline + word timestamps. |
| `app/ai-video-gen-main/generate_video.py` | The Playwright render engine. Loads HTML, advances GSAP timeline, screenshots each frame, emits MP4. Not actually called from `ai_service` — runs as its own render server. |
| `app/ai-video-gen-main/content_type_prompts.py` | Per-content-type prompt overrides (QUIZ, STORYBOOK, SIMULATION, etc.). |
| `app/ai-video-gen-main/map_assets.py` | Pre-built SVG maps (world, countries, regions) the LLM can reference. |
| `app/repositories/ai_video_repository.py` | DB persistence. |

### 1.2 Frontend — Admin dashboard (`vacademy_platform/frontend-admin-dashboard/`)

| File | What it does |
|------|---------------|
| `src/routes/video-api-studio/index.tsx` | Video API studio landing page. |
| `src/routes/video-api-studio/console/index.tsx` | Generation console — prompt input + live SSE progress + result. |
| `src/routes/video-api-studio/-components/PromptInput.tsx` | The big prompt+options composer. Houses the VisualStyle selector, Quality tier, language, voice, reference files, etc. |
| `src/routes/video-api-studio/-components/ContentSelector.tsx` | Content type picker (VIDEO/QUIZ/STORYBOOK/...). |
| `src/routes/video-api-studio/-components/VideoResult.tsx` | Shows the generated result (AIVideoPlayer). |
| `src/routes/video-api-studio/-components/HistorySidebar.tsx` | Past generations list. |
| `src/routes/video-api-studio/-components/GenerationProgress.tsx` | SSE progress bar. |
| `src/routes/video-api-studio/-components/RenderSettingsDialog.tsx` | Resolution/fps/caption/watermark options for the render request. |
| `src/routes/video-api-studio/-services/video-generation.ts` | Types + API client (`generateVideo`, `getRemoteHistory`, `regenerateFrame`, `requestVideoRender`, etc.). The canonical frontend contract. |
| `src/components/ai-video-player/AIVideoPlayer.tsx` | Plays legacy VIDEO timelines. |
| `src/components/ai-video-player/AIContentPlayer.tsx` | Modern player that dispatches on `content_type` (VIDEO/QUIZ/STORYBOOK/...). Calls `initializeLibraries()`. |
| `src/components/ai-video-player/library-loader.ts` | Maps `ContentType → []string` of CDN libraries to load into the host page. |
| `src/components/ai-video-player/html-processor.ts` | Composes the iframe srcdoc: common libraries + base styles + shot HTML. Source of truth for browser-iframe playback. |
| `src/components/ai-video-player/navigation-controller.ts` | Time-driven / user-driven / self-contained playback modes. |
| `src/components/ai-video-editor/VideoEditorPage.tsx` | Timeline-level editor (non-regen). |

### 1.3 Frontend — Learner dashboard (`vacademy_platform/frontend-learner-dashboard-app/`)

Same AIVideoPlayer module (copy-pasted — no shared package):

| File | What it does |
|------|---------------|
| `src/components/ai-video-player/AIVideoPlayer.tsx` | Plays VIDEO/QUIZ/STORYBOOK content. |
| `src/components/ai-video-player/library-loader.ts` | CDN library config. |
| `src/components/ai-video-player/html-processor.ts` | Iframe srcdoc composer. |
| `src/components/ai-video-player/navigation-controller.ts` | Playback mode controller. |

**No generation UI on the learner side.** The learner only *consumes* — videos are served as pre-rendered MP4s or interactive HTML timelines from S3.

---

## 2. External HTTP API

**Base prefix**: `{AI_SERVICE_BASE_URL}/external/video/v1` where `AI_SERVICE_BASE_URL` comes from `settings.api_base_path` (typically `/ai-service`).

**Auth**: Every route requires header `X-Institute-Key: <institute-api-key>`. Credits-gated routes also run `require_credits("video", ...)`.

### 2.1 Generate

`POST /external/video/v1/generate`

```json
{
  "prompt": "Explain quantum entanglement to a 5-year-old",
  "content_type": "VIDEO",
  "language": "English",
  "captions_enabled": true,
  "html_quality": "advanced",
  "target_audience": "Class 3 (Ages 7-8)",
  "target_duration": "2-3 minutes",
  "quality_tier": "ultra",
  "voice_gender": "female",
  "tts_provider": "standard",
  "voice_id": null,
  "orientation": "landscape",
  "visual_style": "standard",
  "model": "openai/gpt-4o",
  "video_id": null,
  "reference_files": [
    {"url": "https://...", "name": "diagram.png", "type": "image"}
  ]
}
```

**Response**: `StreamingResponse` (Server-Sent Events). The route starts a background task and streams progress events:

```
data: {"type": "progress", "stage": "SCRIPT", "message": "Generating narration...", "percentage": 10, "video_id": "vid_..."}
data: {"type": "progress", "stage": "TTS", "percentage": 30, ...}
data: {"type": "progress", "stage": "WORDS", "percentage": 45, ...}
data: {"type": "progress", "stage": "HTML", "percentage": 60, ...}
data: {"type": "completed", "video_id": "vid_...", "files": {"video": null, "script": "https://...", "audio": "https://...", "timeline": "https://...", "words": "https://..."}}
```

Important semantics:
- The background task **outlives** the HTTP connection. If the browser disconnects, the task keeps running and writes to DB. The frontend can reconnect via `GET /status` or `GET /urls` polling.
- If re-connecting while the task is still running, the server reuses the same queue so both connections share the stream.
- On failure, credits are **refunded automatically** via `TokenUsageService.refund_video_credits`.
- `target_stage` query param controls how far the pipeline runs (default `HTML`). Set to `SCRIPT` to get narration only, `TTS` to get audio only, etc.
- `video_id` is optional — if absent, the server generates one. The frontend's `X-Video-ID` response header returns the actual ID used.

### 2.2 Status & URLs

- `GET /external/video/v1/status/{video_id}` → `VideoStatusResponse` (stage, s3_urls, metadata, timestamps, error_message).
- `GET /external/video/v1/urls/{video_id}` → `VideoUrlsResponse` (html_url, audio_url, words_url, video_url, render_job_id, audio_tracks).
- `GET /external/video/v1/history?limit=N` → list of past generations for the institute (used to build admin history sidebar).

### 2.3 Render (MP4 export)

- `POST /external/video/v1/render/{video_id}` — request MP4 render. Body (optional):
  ```json
  {
    "resolution": "1080p",
    "fps": 25,
    "show_captions": true,
    "show_branding": true,
    "caption_position": "bottom",
    "caption_text_color": "#ffffff",
    "caption_bg_color": "#000000",
    "caption_bg_opacity": 60,
    "caption_size": "M"
  }
  ```
  Returns `{ "job_id": "rjob_...", "status": "queued" }`. The backend fires a callback URL to `POST /render-callback/{video_id}` when the render completes.
- `GET /external/video/v1/render/status/{job_id}` → poll render progress.
- `DELETE /external/video/v1/render/{video_id}` → clear cached MP4 so a fresh render can be requested.

Resolution × orientation → dimension lookup:

| orientation | 720p | 1080p |
|-------------|------|-------|
| landscape | 1280×720 | 1920×1080 |
| portrait | 720×1280 | 1080×1920 |

### 2.4 Frame operations

- `POST /external/video/v1/frame/regenerate` — `{video_id, timestamp, user_prompt}` → LLM rewrites a single frame's HTML based on the instruction. Returns `{original_html, new_html}` for preview.
- `POST /external/video/v1/frame/update` — persist `{video_id, frame_index, new_html}` back to the timeline JSON in S3.
- `POST /external/video/v1/frame/add` — insert a new frame at a time or user-driven index.

### 2.5 Audio tracks (background music, SFX)

- `POST /external/video/v1/audio-track/add` — attach an extra audio layer (`{label, url, volume, delay, fade_in, fade_out}`). Stored in `meta.audio_tracks[]` inside the timeline JSON.
- `PATCH /external/video/v1/audio-track/update`
- `POST /external/video/v1/audio-track/delete`

The browser player mixes these via `useWebAudioMixer` (Web Audio API). The render server mixes them via ffmpeg post-processing.

### 2.6 TTS voices

- `GET /external/video/v1/tts/voices?language=English&gender=female&tier=premium` — returns available voices (provider varies by language: Sarvam for Indian languages, Google Cloud for global, Microsoft Edge for free tier).

---

## 3. The pipeline — `automation_pipeline.py`

This is the single most important file. All generation flows through `AutomationPipeline.run()`.

### 3.1 Entry point — `run()`

Signature (simplified):
```python
def run(
    self,
    prompt: str,
    *,
    content_type: str = "VIDEO",
    language: str = "English",
    target_audience: str = "General/Adult",
    target_duration: str = "2-3 minutes",
    voice_gender: str = "female",
    tts_provider: str = "standard",
    voice_id: Optional[str] = None,
    stop_after: Optional[str] = None,
    resume_run: Optional[Path] = None,
    reference_context: Optional[Dict] = None,
    video_width: int = 1920,
    video_height: int = 1080,
    visual_style: str = "standard",
) -> Dict[str, Any]:
    ...
    self._current_visual_style = visual_style  # pipeline mode (NOT image style)
    ...
```

**Critical invariant**: `self._current_visual_style` holds the **pipeline MODE** (`standard` / `illustrated_svg` / `product_showcase`). It is **not** the image style (`realistic cinematic photograph` / `flat vector illustration` etc.), which is stored separately in `self._current_image_style` (set at line ~1359 from the LLM's script plan).

**Do not collapse the two.** Overwriting `_current_visual_style` with the image-style string silently breaks mode dispatch in `_run_director` and `_shot_task`. An inline comment at [automation_pipeline.py:1352](../../ai_service/app/ai-video-gen-main/automation_pipeline.py#L1352) documents this rule.

### 3.2 Pipeline stages

`run()` executes sequentially, with checkpoints at each stage so `resume=True` can skip ahead:

| Stage | What runs | LLM calls | Output |
|-------|-----------|-----------|--------|
| **PENDING** | DB record created | — | `video_id` reserved |
| **SCRIPT** | `_generate_script_plan()` | 1 × script LLM (+ optional review pass on Premium/Ultra) | `script_plan.json` + `narration_raw.txt` |
| **TTS** | `_synthesize_tts()` (ElevenLabs/Sarvam/Google/Edge) | 0 | `narration.mp3` |
| **WORDS** | `_parse_timestamps()` (Whisper) | 0 | `narration.words.json` + `narration.words.csv` |
| **HTML** | `_generate_style_guide()` → `_run_director()` → `_shot_task()` × N (parallel) | 1 style + 1 director + N per-shot + M image generations | `time_based_frame.json` (the timeline) |

Each stage yields progress events via callback → SSE → frontend.

### 3.3 `QUALITY_TIERS`

Defined at [automation_pipeline.py:268](../../ai_service/app/ai-video-gen-main/automation_pipeline.py#L268). Controls per-tier feature gates:

| Tier | Temperature | Two-pass script review | HTML validation | Image prompt enhancement | Director | Kinetic text | Motion bias |
|------|------------|------------------------|-----------------|--------------------------|----------|--------------|-------------|
| `free` | 0.5/0.7 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `standard` | 0.5/0.7 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `premium` | 0.6/0.7 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `ultra` | 0.6/0.7 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `super_ultra` | 0.6/0.82 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

- **`use_director`**: enables the three-stage LLM flow (script → director plan → per-shot HTML) vs the legacy single-stage flow. `premium` and above use the director.
- **`kinetic_text_shots`**: pipeline builds `KINETIC_TEXT` shots deterministically (word-by-word sync) instead of asking the LLM. `super_ultra` only.
- **`director_motion_bias`**: director is instructed to target reel-pace (2–4s shots, 50%+ motion-graphics types). `super_ultra` only.
- **`crossfade_duration`**: pipeline inserts 0.35s crossfade transitions between shots on `premium`+.

### 3.4 `visual_style` — pipeline modes

Three modes, all independent of `quality_tier`:

#### 3.4.1 `standard`

Default. Mixed photos + stock video + motion graphics. No mode overrides. The Director picks from the full shot-type catalog based on `subject_domain`.

#### 3.4.2 `illustrated_svg`

Pure SVG infographic mode. Think "How to Play Volleyball" explainer or MacBook Neo blueprint.

**Style guide overrides** ([automation_pipeline.py:2836](../../ai_service/app/ai-video-gen-main/automation_pipeline.py#L2836)):
- Background → `#f5f0e8` (cream)
- `grid_pattern` → `True`
- `no_photos` → `True`
- `background_type` → `"white"` (closest preset for CSS defaults)

**Director override** ([automation_pipeline.py:3290](../../ai_service/app/ai-video-gen-main/automation_pipeline.py#L3290)):
- Restricted shot types: `INFOGRAPHIC_SVG`, `KINETIC_TITLE`, `KINETIC_TEXT` only
- `image_prompt: null`, `video_query: null` on every shot
- First shot must be `KINETIC_TITLE`

**Per-shot HTML constraints** ([automation_pipeline.py:3638](../../ai_service/app/ai-video-gen-main/automation_pipeline.py#L3638)):
- Root: `<div class='svg-canvas paper-texture'><div class='stage-drift'>...</div></div>`
- No `<img>`, `<video>`, or external URLs
- Palette: `var(--brand-primary)`, `var(--brand-accent)` only (plus red `.tech-annotation` as utility color)
- All line art wrapped in `<g filter='url(#roughen)'>`
- Multi-node diagrams must use the **blueprint-draft two-phase pattern** (dashed guide → solid overlay)
- Mandatory `.stage-drift` hold-drift tween (12s loop)
- Scene exit must use zoom-through OR vignette pattern — never static

**CSS utilities available** (injected by `_ensure_fonts`):
`.svg-canvas`, `.paper-texture` (+`.strong`), `.flat-badge` (+`.light`/`.dark`), `.slam-wrapper`, `.slam-text`, `.tracking-label`, `.display-xl`, `.display-lg`, `.accent-word`, `.bg-watermark`, `.stage-drift`, `.draft-guide`, `.solid-overlay`, `.tech-annotation` (+`-label`/`-caption`), `.vignette-overlay`, `.halftone` (+`-light`), `.product-stage`.

**SVG filters** (in global defs block prepended by `_ensure_fonts`): `#roughen`, `#roughen-strong`.

**Fonts**: Bebas Neue is conditionally loaded when `style_guide.visual_style == "illustrated_svg"`.

#### 3.4.3 `product_showcase`

Single hero product/subject stays fixed center-stage while background layers crossfade behind. Think Converse Chuck Taylor brand reel.

**Style guide overrides** ([automation_pipeline.py:2820](../../ai_service/app/ai-video-gen-main/automation_pipeline.py#L2820)):
- Background → `#f2f0ec` (warm off-white stage)
- Enforces brand palette

**Director override**: Primary shot type is `PRODUCT_HERO`. Never uses `VIDEO_HERO` / `IMAGE_HERO` / `IMAGE_SPLIT` / `ANNOTATION_MAP`. Mix in `KINETIC_TITLE`, `DATA_STORY`, `LOWER_THIRD` for variety. All shots share the same hero subject image.

**Per-shot HTML constraints** ([automation_pipeline.py:3618](../../ai_service/app/ai-video-gen-main/automation_pipeline.py#L3618)):
- Root: `<div class='product-stage'>` containing stacked z-indexed layers
- Subject image: `data-cutout='true'`, centered, bottom 22%, z-index 10
- 3 background layers at z-index 0/1/2, crossfading via GSAP opacity tweens
- Text group wrapped in `.stage-drift` for subtle parallax (subject stays anchored)
- Badge: `<div class='flat-badge'>` with Bebas Neue, zero border-radius
- Bottom tagline: `<div class='slam-wrapper'><div class='slam-text'>` with `translateY:100%→0%` + `expo.out`

### 3.5 Script generation — `_generate_script_plan()`

- Uses `prompts.py::get_script_system_prompt()` and `SCRIPT_USER_PROMPT_TEMPLATE`.
- Returns structured JSON: `title`, `audience`, `target_grade`, `subject_domain`, `visual_style` (LLM-picked image style — not mode), `script`, `key_takeaway`, `common_mistake`, `beat_outline[]`, `cta`, `questions[]`.
- Each beat carries: `label`, `narration`, `summary`, `visual_type`, `visual_idea`, `image_prompt_hint`, `key_terms[]`, `emotion`, `pacing`, `transition_hint`, `complexity_level`, `needs_recap`.
- The pipeline appends a **narrative-tone hint** to the user prompt when `_current_visual_style != "standard"` ([automation_pipeline.py:1697](../../ai_service/app/ai-video-gen-main/automation_pipeline.py#L1697)) so the LLM writes a script that matches the chosen mode (e.g. step-based/drawable for illustrated, hero-subject-orbit for product_showcase).
- On `premium`+, a second LLM call (`SCRIPT_REVIEW_SYSTEM_PROMPT`) reviews and improves the draft.
- MCQ questions are generated for each substantive beat (skipping Hook and CTA).

### 3.6 Style guide — `_generate_style_guide()`

LLM call that designs a palette, background type, font pairing, and motion strategy for the entire video based on the script text. Returns a `style_guide` dict:

```python
{
  "palette": {
    "background": "#0a0e27",
    "primary": "#3b82f6",
    "accent": "#fbbf24",
    "text": "#f1f5f9",
    "text_secondary": "#94a3b8",
    "svg_stroke": "...",
    "svg_fill": "...",
    "annotation_color": "...",
    "grid_pattern": False
  },
  "background_type": "dark",  # or "white", "whiteboard", "chalkboard", "glamour", "diorama", "neon", "blueprint", "minimal", "cerulean"
  "layout_theme": "...",
  "motion_strategy": "...",
  "visual_style": "illustrated_svg",  # injected by pipeline if mode is illustrated_svg
  "no_photos": True,  # injected by pipeline if mode is illustrated_svg
}
```

The palette is resolved to CSS custom properties in `_ensure_fonts`:
- `--brand-primary`, `--brand-accent`, `--brand-text`, `--brand-text-secondary`, `--brand-bg`, `--brand-svg-stroke`, `--brand-svg-fill`, `--brand-annotation`
- Legacy aliases: `--primary-color`, `--accent-color`, `--text-color`

Institute-level brand overrides (from Institute Settings → AI Style) take precedence — see `_current_style_config` and `_current_style_guide`.

### 3.7 Director — `_run_director()`

LLM call that takes the script + beat outline + word timestamps and produces a **shot-by-shot plan**. This is the "film director" stage.

Input: full script + beat outline + key word timestamps + subject domain + style guide + audio duration + visual_style.
Output: JSON with `shots[]`, each carrying:
```json
{
  "shot_index": 0,
  "shot_type": "VIDEO_HERO",
  "beat_index": 0,
  "start_time": 0.0,
  "end_time": 4.2,
  "start_word": "The ancient city of",
  "narration_excerpt": "...",
  "visual_description": "...",
  "image_prompt": null,
  "video_query": "aerial ancient rome ruins golden hour",
  "text_elements": ["..."],
  "animation_strategy": "splitReveal at 0.5s, fadeIn at 1.2s",
  "sync_points": [{"word": "Rome", "time": 1.4, "action": "underline"}],
  "complexity_level": "simple",
  "transition_in": "cut",
  "overlay": false,
  "notes": "..."
}
```

**Validation** ([automation_pipeline.py:3319](../../ai_service/app/ai-video-gen-main/automation_pipeline.py#L3319)):
- `shot_type` must be in the valid_types whitelist
- Shots must cover 100% of the narration with no gaps (shot N's `end_time` == shot N+1's `start_time`)
- First shot starts at 0.0, last shot ends at `audio_duration`

**Mode overrides**: `illustrated_svg` restricts to `INFOGRAPHIC_SVG` / `KINETIC_TITLE` / `KINETIC_TEXT`. `product_showcase` primary is `PRODUCT_HERO`. `super_ultra` adds reel-pace + motion-density bias.

### 3.8 Per-shot HTML — `_shot_task()`

For each shot in the director plan, run a parallel LLM call that produces the HTML/CSS/JS for that single shot. The prompt contains only the shot-type card relevant to `shot.shot_type` (not the whole catalog), which keeps token counts manageable.

**`_shot_task()` flow**:
1. Build a focused system prompt via `build_filtered_system_prompt()` — includes `CORE_PREAMBLE` + only the cards for shot types used in this shot
2. Build a user prompt with narration excerpt, duration, animation strategy, sync points, visual description
3. Append mode-specific constraints if `_current_visual_style` is not `standard`
4. Call the HTML LLM
5. Post-process the result: `_ensure_fonts()` (CSS + SVG defs injection), stock video fetch, image generation
6. Return the entry (start, end, html, box, z-index)

**Shot-type catalog** (`shot_type_cards.py::SHOT_TYPE_CARDS`):

| Type | Category | Use for |
|------|----------|---------|
| `IMAGE_HERO` | hero | Full-screen image with Ken Burns + text overlay |
| `VIDEO_HERO` | hero | Full-screen stock video + text overlay (preferred over IMAGE_HERO for real-world topics) |
| `IMAGE_SPLIT` | hero | Image on one side, text on other |
| `TEXT_DIAGRAM` | default | Text + SVG/Mermaid diagram on clean bg |
| `LOWER_THIRD` | overlay | Vocabulary banner at bottom |
| `ANNOTATION_MAP` | illustration | Full-screen image + animated SVG arrows (anatomy, geography) |
| `DATA_STORY` | data | Animated bar/line chart with ONE accent bar + stat callout |
| `PROCESS_STEPS` | data | Sequential numbered nodes with animated connectors |
| `EQUATION_BUILD` | data | KaTeX formula revealing term-by-term |
| `ANIMATED_ASSET` | illustration | Cutout images with GSAP animation |
| `KINETIC_TEXT` | text | Word-by-word sync (pipeline-built in `super_ultra`, 100% sync accuracy) |
| `PRODUCT_HERO` | product | Fixed hero subject with crossfading background layers |
| `INFOGRAPHIC_SVG` | illustration | Pure SVG with hand-drawn wobble, paper texture, blueprint-draft pattern |
| `KINETIC_TITLE` | text | Full-screen bold typography, word-wipe reveal |

**`DOMAIN_SHOT_TYPES`** maps subject domains to preferred types. Entries like `"illustrated_svg": ["KINETIC_TITLE", "INFOGRAPHIC_SVG", "KINETIC_TEXT"]` and `"product_showcase": ["PRODUCT_HERO", "KINETIC_TITLE", "DATA_STORY", "LOWER_THIRD"]` whitelist the allowed shot types per mode.

### 3.9 Image generation — `_process_generated_images()`

Scans every shot's HTML for `<img data-img-prompt="...">` tags and generates the images via Gemini (or fetches from Pexels if `data-img-source='stock'`).

**Cutout handling**: If `data-cutout='true'`, the image is run through `rembg` (u2netp model, singleton session) to remove the background, producing a transparent PNG.

**Image style prefix**: The LLM-picked `_current_image_style` (e.g., "realistic cinematic photograph") is prepended to every image prompt to maintain visual consistency across the video. This is **separate** from the pipeline mode.

**In `illustrated_svg` mode**, this stage is effectively a no-op because `style_guide.no_photos == True` and the Director emits zero shots with image_prompts.

### 3.10 Stock videos — `_process_stock_videos()`

For each shot with `data-video-query="...search terms"`, calls Pexels API to find a matching stock video, downloads it, stores in S3, and rewrites the shot HTML to reference the S3 URL.

Supports multiple Pexels API keys (round-robin with rate-limit detection).

### 3.11 `_ensure_fonts()` — the CSS injection stage

**Post-processes every shot's HTML** before storing in the timeline. Prepends:

1. A hidden `<svg width="0" height="0">` element with `<defs>` containing `#roughen` and `#roughen-strong` filters (SVG filter URL references resolve within the same shadow-root / iframe, so every shot carries its own copy).
2. A single `<style>` block with:
   - `@import` for Google Fonts (Montserrat + Inter + Fira Code, plus Bebas Neue if `illustrated_svg`)
   - CSS custom properties (`--brand-*`)
   - Layout utilities (`.full-screen-center`, `.layout-split`, `.layout-bento`, `.highlight`, `.emphasis`)
   - Typography (`.text-display`, `.text-h2`, `.text-body`, `.text-label`, `.display-xl`, `.display-lg`, `.tracking-label`)
   - Professional utilities (`.product-stage`, `.halftone`, `.halftone-light`, `.flat-badge`, `.slam-wrapper`/`.slam-text`, `.bg-watermark`, `.stage-drift`, `.draft-guide`, `.solid-overlay`)
   - Paper texture (`.paper-texture` + `.strong` variant, using inline SVG noise data-URI)
   - Technical annotations (`.tech-annotation`, `.tech-annotation-label`, `.tech-annotation-caption`)
   - Scene transitions (`.vignette-overlay`)
   - Conditional `.svg-canvas` cream + grid background (only when `illustrated_svg`)

The `_ensure_fonts` call is what makes the **same HTML renderable in both the server renderer (shadow DOM in Playwright) and the browser player (iframe srcdoc)**. All CSS and SVG filters are baked in at generation time — no per-playback library loading is required for these utilities.

### 3.12 Timeline JSON output

Final `time_based_frame.json` shape (varies slightly by content type):

```json
{
  "meta": {
    "content_type": "VIDEO",
    "navigation": "time_driven",
    "entry_label": "segment",
    "audio_start_at": 0,
    "total_duration": 142.3,
    "dimensions": {"width": 1920, "height": 1080},
    "audio_tracks": [{"id":"track-1","label":"BG Music","url":"..."}],
    "palette": {...},  // from style_guide
    "visual_style": "illustrated_svg"  // pipeline mode
  },
  "entries": [
    {
      "id": "shot-0",
      "index": 0,
      "start": 0.0,
      "end": 4.2,
      "htmlStartX": 0, "htmlStartY": 0,
      "htmlEndX": 1920, "htmlEndY": 1080,
      "z": 10,
      "html": "<svg width='0' ...><defs>...</defs></svg><style>...</style><div class='svg-canvas paper-texture'>...</div>"
    },
    ...
  ]
}
```

This is the single artifact consumed by both the render server and the browser player.

---

## 4. Render server — `generate_video.py`

Runs as a **separate process**, not inside `ai_service`. Triggered via `RenderService` HTTP client when the frontend calls `POST /external/video/v1/render/{video_id}`.

### 4.1 Responsibilities

1. Pull `time_based_frame.json` + `narration.mp3` + `words.json` from S3
2. Launch headless Chromium (Playwright)
3. Load a base HTML page that:
   - Imports GSAP + MotionPathPlugin + Anime.js + Mermaid + Vivus + RoughNotation + KaTeX + Prism + D3 + Iconify (all via CDN)
   - Defines `window.__SHADOW_CSS`, `window.__updateSnippets`, `window.__updateCaption`, `window.__batchRenderFrame`
4. Call `__updateSnippets(entries)` to inject each shot into its own shadow-root-wrapped `<div>` — at most K snippets visible at any time (overlaps for transitions)
5. For each output frame at time `t` (every `1/fps` seconds):
   - Call `gsap.globalTimeline.totalTime(t)` to advance GSAP to that moment
   - Call `window._animeSeek(t)` to advance all registered Anime.js instances
   - Seek stock videos via `videoEl.currentTime = ...`
   - Take a screenshot via `page.screenshot()`
6. Feed screenshots + audio into ffmpeg → MP4
7. Upload MP4 to S3
8. Call the callback URL `POST /render-callback/{video_id}` with the result

### 4.2 Shadow DOM scoping

Each shot is wrapped in `<div>` with `attachShadow({mode:'open'})`. This isolates CSS between shots so one shot's `h1 { font-size: 8rem }` doesn't leak into the next.

**Why it matters**: the LLM often writes `:root { --primary-color: ... }` which doesn't work inside shadow DOM. The renderer does a find-replace `:root → :host` before injection.

Scripts inside each shot are rewritten to replace `document.querySelector` with a shadow-root-aware helper (`__sd_querySelector`), so LLM code like `gsap.to('#title', ...)` resolves to the element in the current shadow root.

### 4.3 Anime.js bridge

LLM code uses `anime({autoplay:false, ...})` and registers with `_animeR({instance, startMs})`. The renderer:

1. Declares `window._animeTimelines = []` and `window._animeR = (entry) => window._animeTimelines.push(entry)` at init
2. At each frame: `window._animeSeek(tSec)` iterates all registered entries and calls `instance.seek((tSec*1000) - startMs)` for those whose start has passed
3. Scoped `anime` proxy in the shadow-DOM IIFE resolves string target selectors via `scope.querySelectorAll(...)` so LLM code doesn't need to know about shadow roots

See the `_animeR` / `_animeSeek` glue in [generate_video.py:195-210](../../ai_service/app/ai-video-gen-main/generate_video.py#L195).

### 4.4 Frame-seekable libraries

The following libraries are loaded globally and are seekable via `gsap.globalTimeline.totalTime(t)`:

- **GSAP** core timeline (every `gsap.to`/`from`/`fromTo`/`delayedCall`/`fromTo` lives on the global timeline by default)
- **GSAP MotionPathPlugin** (ball arcs, trajectories)
- **Anime.js** via the registration bridge above
- **Vivus** (SVG path draw animations — wrapped for shadow DOM)
- **Rough Notation** (hand-drawn annotations — wrapped for shadow DOM)
- **Stock videos** (seeked via `videoEl.currentTime = t - videoStartTime`)

Libraries that are **not** frame-seekable (they run in real-time and behave the same for browser player and renderer):
- Anime.js loops with `autoplay:true` (ambient effects only — no sync to narration)
- Mermaid chart build (one-shot layout, no animation)
- KaTeX math rendering (one-shot layout)

### 4.5 Settings controlled by the render request body

| Field | Effect |
|-------|--------|
| `resolution` | `720p` → 1280×720 or 720×1280. `1080p` → 1920×1080 or 1080×1920. Based on `orientation` from video metadata. |
| `fps` | 15/20/25/30. Default 20. Higher fps = smoother motion + longer render time. |
| `show_captions` | Render captions from `narration.words.json` onto the frames. |
| `show_branding` | Add watermark/logo overlay (from `branding.json`). |
| `caption_position` | `top` or `bottom`. |
| `caption_text_color`, `caption_bg_color`, `caption_bg_opacity` | Colors for the caption box. |
| `caption_size` | `S` / `M` / `L`. |

---

## 5. Admin frontend — Video API Studio

### 5.1 Flow

```
User opens /video-api-studio
  → PromptInput renders (big composer)
  → User picks content_type=VIDEO, quality_tier=ultra, visual_style=illustrated_svg, language=English, etc.
  → User types prompt, optionally attaches reference files (auto-uploaded to S3)
  → User hits send
  → generateVideo() streams SSE events
  → GenerationProgress shows stage + percentage
  → On "completed" event, VideoResult mounts an AIContentPlayer with the timeline URL
  → User can inspect, re-render as MP4, edit individual frames, or save to history
```

### 5.2 Key types — `video-generation.ts`

```typescript
export type ContentType = 'VIDEO' | 'QUIZ' | 'STORYBOOK' | 'INTERACTIVE_GAME' | 'PUZZLE_BOOK'
  | 'SIMULATION' | 'FLASHCARDS' | 'MAP_EXPLORATION' | 'WORKSHEET' | 'CODE_PLAYGROUND'
  | 'TIMELINE' | 'CONVERSATION' | 'SLIDES';

export type QualityTier = 'free' | 'standard' | 'premium' | 'ultra' | 'super_ultra';
export type VisualStyle = 'standard' | 'illustrated_svg' | 'product_showcase';
export type VideoOrientation = 'landscape' | 'portrait';

export interface GenerateVideoRequest {
  prompt: string;
  content_type?: ContentType;
  language: string;
  voice_gender: VoiceGender;
  tts_provider: TtsProvider;
  voice_id?: string;
  captions_enabled: boolean;
  html_quality: 'classic' | 'advanced';
  target_audience: string;
  target_duration: string;
  model: string;
  quality_tier: QualityTier;
  video_id?: string;
  reference_files?: ReferenceFile[];
  orientation?: VideoOrientation;
  visual_style?: VisualStyle;
}
```

### 5.3 PromptInput.tsx structure

- Textarea with auto-resize
- "OptionBubble" popover row:
  - Content type (`ContentSelector`)
  - Quality tier (Free / Standard / Premium / Ultra / Super Ultra badges)
  - **Visual Style** (Standard / Illustrated / Product Showcase) — VIDEO-only
  - Language (grouped: Global / Indian)
  - Voice gender + TTS provider + voice ID (with sample playback)
  - Target audience (grade level)
  - Target duration
  - Orientation (landscape/portrait)
  - Captions on/off
  - Reference file attachments (image or PDF — PDFs are converted to HTML via `handleConvertPDFToHTML` and stitched into the prompt)
  - Model picker (filtered to tier-appropriate models)
- Style preview chip shows institute-level branding (palette + layout_theme) from `GET /institute-settings/video-style`
- Credit balance indicator

### 5.4 History reconstruction

`getRemoteHistory()` calls `GET /external/video/v1/history?limit=20`. The backend returns `RemoteHistoryItem[]` which the frontend maps to `HistoryItem[]`.

**Important**: The backend's `history` endpoint returns only what's stored in the DB — it doesn't re-serialize the full request. To get the original `visual_style`, `orientation`, and `quality_tier` back, the frontend reads them from `item.metadata` (stored at generation time by `VideoGenerationService.generate_till_stage`):

```typescript
const meta = (item.metadata || {}) as Record<string, unknown>;
const metaVisualStyle = typeof meta.visual_style === 'string' ? meta.visual_style as VisualStyle : 'standard';
const metaOrientation = typeof meta.orientation === 'string' ? meta.orientation as VideoOrientation : 'landscape';
const metaQualityTier = typeof meta.quality_tier === 'string' ? meta.quality_tier as QualityTier : 'ultra';
```

If metadata is missing, it falls back to the default values. This means **old videos (pre-metadata) will show as "standard" mode in history** — not a bug, just the honest default.

### 5.5 AIVideoPlayer / AIContentPlayer

Two players exist in the admin dashboard:
- `AIVideoPlayer.tsx` — legacy, VIDEO-only
- `AIContentPlayer.tsx` — modern, dispatches on `content_type` (VIDEO uses `AIVideoPlayer` under the hood; QUIZ/STORYBOOK/etc. use dedicated navigation)

**Initialization** ([AIContentPlayer.tsx:376](../../frontend-admin-dashboard/src/components/ai-video-player/AIContentPlayer.tsx#L376)):
```typescript
await initializeLibraries(loadedMeta.content_type);
```

This fetches the CDN libraries from `LIBRARY_CONFIG[content_type]`:

```typescript
VIDEO: [
  'gsap.min.js',
  'MotionPathPlugin.min.js',
  'animejs@3.2.1/anime.min.js',   // ← added for INFOGRAPHIC_SVG patterns
  'mermaid.min.js',
  'rough-notation.iife.js',
  'vivus.min.js',
  'katex.min.js',
  'auto-render.min.js',
  'prism.min.js',
  'd3.min.js',
  'iconify-icon.min.js',
]
```

**Rendering** is via `html-processor.ts`:
- `getCommonLibraries()` returns the `<script>`/`<link>` tags for libs
- `getBaseStyles()` returns the iframe base CSS (Montserrat/Inter fonts, palette vars, `.full-screen-center`, etc.)
- The full iframe srcdoc = `getCommonLibraries() + getBaseStyles() + entry.html`

The `entry.html` already contains the `_ensure_fonts`-injected SVG defs + CSS utilities baked in by the backend, so iframe playback gets all the same classes as the MP4 render.

**Anime.js browser-mode bridge**: Because browser playback is real-time (not frame-seeked), `_animeR` can't call `instance.seek(t)` per frame. Instead, it schedules the animation via `gsap.delayedCall(startMs/1000, () => instance.play())`, which lives on the iframe's GSAP timeline. `_animeSeek` is a no-op.

See [html-processor.ts:25-46](../../frontend-admin-dashboard/src/components/ai-video-player/html-processor.ts#L25) (admin) and [html-processor.ts:24-46](../../frontend-learner-dashboard-app/src/components/ai-video-player/html-processor.ts#L24) (learner).

### 5.6 Frame regeneration UI

The admin video editor (`VideoEditorPage.tsx`) lets users click a frame and request a regeneration:
1. Frontend calls `POST /external/video/v1/frame/regenerate` with `{timestamp, user_prompt}`
2. Backend fetches the frame HTML from the timeline JSON, sends it to an LLM along with the user's instruction
3. Backend returns `{original_html, new_html}` for preview
4. User accepts → frontend calls `POST /external/video/v1/frame/update` to persist the change

**Known limitation**: The regen LLM call doesn't know about the pipeline mode. If a user regens a frame in `illustrated_svg` mode and asks "add a stock photo", the LLM will comply and break mode constraints. A future improvement is to read `metadata.visual_style` from the video record and inject mode constraints into the regen system prompt.

### 5.7 Render flow

After generation, the user clicks "Render MP4":
1. Frontend opens `RenderSettingsDialog` (resolution, fps, captions, watermark)
2. `requestVideoRender(videoId, settings)` calls `POST /external/video/v1/render/{video_id}`
3. Backend forwards to external render server via `RenderService`
4. Frontend polls `GET /external/video/v1/render/status/{job_id}` until status is `completed`
5. `getVideoUrls(videoId)` returns the final `video_url`

---

## 6. Learner frontend — AIVideoPlayer (playback only)

The learner dashboard has **no generation UI**. Learners consume videos that were generated via the admin dashboard (or via direct API calls from course-creator tooling).

### 6.1 Rendering

Same `AIVideoPlayer.tsx` module as admin, with minor stylistic differences. Key files:

- `src/components/ai-video-player/AIVideoPlayer.tsx` — the player component
- `src/components/ai-video-player/library-loader.ts` — CDN library list (identical to admin's)
- `src/components/ai-video-player/html-processor.ts` — iframe srcdoc composer (identical to admin's)
- `src/components/ai-video-player/navigation-controller.ts` — time_driven / user_driven / self_contained playback
- `src/components/ai-video-player/hooks/useWebAudioMixer.ts` — mixes `meta.audio_tracks[]` over the primary narration

### 6.2 Content types

The player dispatches on `meta.content_type`:

| Content type | Navigation | What the learner sees |
|--------------|-----------|----------------------|
| `VIDEO` | `time_driven` | Shots play in sync with audio, advance automatically. Play/pause/seek works. |
| `QUIZ` | `user_driven` | One question at a time, user clicks Next. |
| `STORYBOOK` | `user_driven` | Page flip navigation. |
| `SLIDES` | `user_driven` | PPT-style deck. |
| `INTERACTIVE_GAME` | `self_contained` | HTML game runs on its own; no external navigation. |
| `FLASHCARDS` | `user_driven` | Spaced-repetition card stack. |
| `MAP_EXPLORATION` | `user_driven` | Interactive SVG map. |
| `TIMELINE` | `user_driven` | Scrollable events. |
| `CONVERSATION` | `user_driven` | Dialogue bubbles. |

### 6.3 Audio + MCQ overlay

For VIDEO content, the player supports inline MCQ overlays: if `frame.question` is present, playback pauses and shows the question. On submit, playback resumes. Results are posted via `add-video-activity.ts` → backend tracking endpoints.

### 6.4 Playback performance

Because the HTML is pre-generated with all CSS/SVG-defs inline, the browser player doesn't need to load any custom assets per-shot. It just:
1. Loads the iframe with common libraries (GSAP, Anime.js, etc. — once per player instance)
2. For each active shot, sets iframe srcdoc to the shot HTML
3. Plays the narration audio and lets the shot's GSAP timeline run in real-time

---

## 7. Visual style modes — deep reference

### 7.1 Mode comparison table

| Feature | `standard` | `illustrated_svg` | `product_showcase` |
|---------|-----------|------------------|-------------------|
| Background | Palette-driven (dark/white/whiteboard/etc.) | Cream `#f5f0e8` + CSS grid + paper grain | Warm off-white `#f2f0ec` stage |
| Photos | ✅ (stock + generated) | ❌ Zero photos | ✅ One hero subject, reused everywhere |
| Videos | ✅ (Pexels stock) | ❌ | ❌ |
| Palette | 2-color brand + text/bg | 2-color brand + red utility | 2-color brand + texture layers |
| Typography | Montserrat + Inter | Bebas Neue + Inter + italic serif captions | Bebas Neue + Inter tracking labels |
| Shot types | All | `INFOGRAPHIC_SVG`, `KINETIC_TITLE`, `KINETIC_TEXT` | `PRODUCT_HERO` (primary), `KINETIC_TITLE`, `DATA_STORY`, `LOWER_THIRD` |
| Animation character | Varies | Hand-drawn wobble via `#roughen` filter, stroke-dashoffset draw-on, blueprint-draft | Fixed-subject + crossfading bg layers + slam text outros |
| Continuous motion | Per-shot | `.stage-drift` (mandatory) | `.stage-drift` on text group only |
| Scene transitions | Cut / crossfade | Zoom-through OR vignette exit (mandatory at shot end) | Background layer crossfades |
| Director rules | Balanced mix | Restricted + first shot must be `KINETIC_TITLE` | Restricted + first shot must be `PRODUCT_HERO` |
| Use case | General explainers | Diagrams, sports, anatomy, blueprints, infographics | Brand reels, product stories, origin stories |
| Reference video | — | "How to Play Volleyball" / MacBook Neo blueprint | Converse Chuck Taylor origin reel |

### 7.2 Professional CSS utilities reference

All injected by `_ensure_fonts`. Available in every generated shot HTML regardless of mode (conditional loading only gates `.svg-canvas` and Bebas Neue).

| Class | Purpose | Documented in |
|-------|---------|---------------|
| `.full-screen-center` | Flex center full-screen container | `CORE_PREAMBLE` |
| `.layout-split` | 2-col grid 60px gap | `CORE_PREAMBLE` |
| `.layout-bento` | Bento-grid layout | `CORE_PREAMBLE` |
| `.product-stage` | Full-screen relative container for PRODUCT_HERO | PRODUCT_HERO card |
| `.halftone` / `.halftone-light` | Dot-pattern texture overlays | PRODUCT_HERO / CORE_PREAMBLE |
| `.flat-badge` (+`.light`/`.dark`) | Zero-border-radius colored badge with Bebas Neue | CORE_PREAMBLE |
| `.slam-wrapper` + `.slam-text` | Overflow-hidden container for `translateY(100%→0%)` reveals | CORE_PREAMBLE |
| `.tracking-label` | Small ALL-CAPS Inter label with letter-spacing | CORE_PREAMBLE |
| `.display-xl` / `.display-lg` | Bebas Neue display headlines (≥4rem / ≥3rem) | CORE_PREAMBLE |
| `.accent-word` | Color swap to `var(--brand-accent)` | CORE_PREAMBLE |
| `.bg-watermark` | Position-absolute watermark slot | CORE_PREAMBLE |
| `.stage-drift` | Continuous-motion wrapper for holds ≥4s | CORE_PREAMBLE |
| `.svg-canvas` | Cream + grid canvas (illustrated_svg only) | INFOGRAPHIC_SVG card |
| `.paper-texture` (+`.strong`) | Parchment grain overlay via SVG-noise data-URI | INFOGRAPHIC_SVG / CORE_PREAMBLE |
| `.draft-guide` / `.solid-overlay` | Two-phase blueprint reveal (dashed → solid) | INFOGRAPHIC_SVG card |
| `.tech-annotation` (+`-label`/`-caption`) | Red dashed dimension lines, caps label, italic serif caption | INFOGRAPHIC_SVG / CORE_PREAMBLE |
| `.vignette-overlay` | Full-screen radial darkening (scene exit) | INFOGRAPHIC_SVG / CORE_PREAMBLE |

### 7.3 SVG filters

Available in every shot via pre-registered `<defs>` block:

| Filter ID | Effect |
|-----------|--------|
| `#roughen` | Subtle hand-drawn wobble (baseFrequency 0.018, scale 2.6) — architect sketch feel |
| `#roughen-strong` | Bolder sketchbook wobble (baseFrequency 0.025, scale 4.2) — more aggressive |

Usage: `<g filter="url(#roughen)">...</g>` wraps any SVG elements that should look hand-drawn. **Preserves `stroke-dashoffset` animation** — the filter is applied post-process as a displacement map, so clean bezier paths still draw in normally.

---

## 8. Key invariants & gotchas

### 8.1 `_current_visual_style` vs `_current_image_style`

**They are not the same.** The pipeline **mode** lives in `_current_visual_style`. The LLM-picked **image style** lives in `_current_image_style`. Do not collapse them.

- `_current_visual_style`: `standard` / `illustrated_svg` / `product_showcase`. Set once at `run()` from the user API request. Read by mode dispatch in `_generate_style_guide`, `_run_director`, `_shot_task`.
- `_current_image_style`: `"realistic cinematic photograph"` / `"flat vector illustration"` / `"watercolor painting"` / etc. Set after script generation from `plan_data.get("visual_style")`. Read by image-generation prompt prefixing (`_process_generated_images`, `_enhance_image_prompt`, `_generate_image`).

History: these were the same attribute until [this fix](https://github.com/...) — the collision silently broke `illustrated_svg` and `product_showcase` modes after the script stage ran. Do not re-introduce.

### 8.2 SVG filter scoping in shadow DOM

SVG filter URL references (`filter="url(#roughen)"`) resolve within the containing tree scope. In shadow DOM, that's the containing shadow root. In an iframe, that's the iframe's document.

`_ensure_fonts` prepends the `<svg><defs>...</defs></svg>` block to every shot's HTML. This means:
- In the render server: each shot's shadow root has its own copy → filter references work ✓
- In the browser player: the shot HTML goes into the iframe body → filter references work ✓

Do **not** try to move the defs to a top-level document — shadow-DOM-scoped SVG elements can't reach outside their scope.

### 8.3 GSAP `:root` vs `:host` in shadow DOM

LLM code often writes `:root { --primary-color: ... }`. This doesn't apply inside shadow DOM (no document root). The renderer does a mechanical find-replace `:root → :host` before injection. Custom properties defined on `:host` cascade into the shadow tree.

The browser player renders shots in iframes (not shadow DOM), so `:root` works there natively. No rewrite needed.

### 8.4 `setTimeout` is forbidden in shot scripts

Because the render server advances `gsap.globalTimeline.totalTime(t)` in a loop, `setTimeout` callbacks never fire at the right moment — they fire in wall-clock time, not timeline time. All delayed actions must use:

- `gsap.to('#el', {delay: 1.4, ...})` — on timeline
- `gsap.delayedCall(1.4, fn)` — on timeline
- For Anime.js: `_animeR({instance: anime({autoplay:false,...}), startMs: 1400})` — registered with the pipeline's seek bridge

Documented in `CORE_PREAMBLE` as a hard rule.

### 8.5 Shadow DOM-scoped libraries

The LLM expects `document.querySelector`, `window.RoughNotation`, `window.Vivus`, etc. to work globally. In shadow DOM, they don't — elements are scoped to the shadow root.

The renderer rewrites shot scripts in place:
- `document.querySelector(...)` → `__sd_querySelector(...)` (shadow-root-aware)
- `document.querySelectorAll(...)` → `__sd_querySelectorAll(...)`
- `document.getElementById(...)` → `__sd_getElementById(...)`
- `window.RoughNotation` → `__sd_RoughNotation` (scoped version)
- `new Vivus(...)` → `new __sd_Vivus(...)`
- A scoped `anime` proxy wraps Anime.js calls to resolve string selectors within the shadow scope

This rewriting is the single largest source of render-server surprise. When LLM-generated code works in the browser player but not the render server, the first thing to check is whether it's using an API that the renderer's scope helpers don't support.

### 8.6 Continuous motion rule

`CORE_PREAMBLE` mandates that every shot ≥4s must have at least one element in motion at any given frame. The pattern is: wrap content in `<div class='stage-drift'>` and tween the whole composition with a 12-second loop:

```javascript
gsap.fromTo('.stage-drift',
  {x:0, y:0, scale:1},
  {x:20, y:-10, scale:1.04, duration:12, ease:'none'});
```

Individual foreground elements can add their own Ken Burns scale on top. Together these enforce the "reference-grade" motion characteristic of top-tier explainers.

### 8.7 Easing mandate

Every GSAP tween must use a named ease:
- `expo.out` — snappy, modern
- `power3.out` — smooth
- `back.out(1.6)` — playful pop
- `power2.inOut` — crossfades
- Never omit `ease` or use `linear` unless intentional (e.g. continuous drift)

Enforced via `CORE_PREAMBLE` and checked in `html_validation` (when enabled by quality tier).

### 8.8 Typography hierarchy — 2 levels, not 3

Every shot uses exactly 2 text levels:
1. Display headline: Bebas Neue / Montserrat Black, ≥4rem
2. Small label: Inter, ≤1rem, letter-spacing 0.25em, ALL-CAPS

**Exception**: `illustrated_svg` allows a 3rd level — italic serif `Fig. 1 — caption` style via `.tech-annotation-caption`. This is the only place a body paragraph is permitted, and it reads as "textbook annotation" not content.

---

## 9. Credit accounting & rate limiting

### 9.1 Credits

- Every generation request passes through `require_credits("video", estimated_tokens=5000)` which reserves credits upfront.
- The pipeline emits `TokenUsageService` events at each LLM call with actual token usage.
- On **success**, credits are settled to match actual usage.
- On **failure**, `TokenUsageService.refund_video_credits` refunds all charges for that `video_id`.
- `quality_tier` multiplies estimated cost (ultra ≈ 2× premium, super_ultra ≈ 3×).

### 9.2 Rate limiting & concurrency

- `_check_rate_limit(institute_id)` — N requests per minute per institute (configured via `settings.video_rate_limit_per_minute`).
- `_check_concurrency_limit(institute_id)` — at most K concurrent in-flight generations per institute. Exceeding returns 429.
- The background-task pattern means disconnecting from an SSE stream doesn't abort the generation — it continues to completion and can be reconnected via `/status` polling. The concurrency counter decrements only when the task actually finishes.

---

## 10. Testing checklist

When making changes that touch the pipeline or render engine:

1. **Parse check** — `python -c "import ast; ast.parse(open('X').read())"` on all edited Python files.
2. **Admin typecheck** — `cd frontend-admin-dashboard && pnpm run typecheck` must exit 0.
3. **Learner typecheck** — `cd frontend-learner-dashboard-app && pnpm run typecheck` must exit 0.
4. **Smoke test generation** — send a short prompt via the Video API Studio, verify all 4 stages (SCRIPT/TTS/WORDS/HTML) complete.
5. **Mode tests** — regenerate the same prompt with each `visual_style` value and confirm:
   - `standard`: mixed shots with photos/videos
   - `illustrated_svg`: cream bg, zero `<img>` tags, Bebas Neue headlines, `.svg-canvas` root, blueprint draft / roughen filter visible
   - `product_showcase`: single hero subject, crossfading bg layers, flat badge slams in, slam-text outro
6. **Render test** — trigger `POST /render/{video_id}` for each mode and verify the MP4 matches the browser player output frame-for-frame (modulo timing precision).
7. **History round-trip** — generate a video, refresh the page, verify history entry shows the correct `visual_style`, `orientation`, `quality_tier` (pulled from `item.metadata`).
8. **Frame regen** — edit a frame via `/frame/regenerate` and verify the new HTML still has `_ensure_fonts` CSS classes available (it doesn't go through `_ensure_fonts` again, so it relies on the CSS baked into the full timeline — broken cross-frame CSS is a known gap).

---

## 11. Troubleshooting cheatsheet

| Symptom | Likely cause | Where to look |
|---------|-------------|---------------|
| Mode ignored after script stage (e.g. illustrated_svg shows dark bg) | `_current_visual_style` overwritten by image style | [automation_pipeline.py:1352](../../ai_service/app/ai-video-gen-main/automation_pipeline.py#L1352) — must use `_current_image_style` |
| SVG filter has no effect | Filter defs not in same shadow root / iframe | Check `_ensure_fonts` is prepending the defs block; check no `innerHTML` replacement is stripping them |
| `setTimeout` animations don't fire in MP4 but work in browser | Render engine uses `gsap.globalTimeline.totalTime` | Rewrite to `gsap.delayedCall` or `_animeR` |
| Fonts fall back to Impact/serif in illustrated_svg mode | Bebas Neue not loaded | Verify `_is_illustrated = style_guide.visual_style == "illustrated_svg"` in `_ensure_fonts` |
| History entries default to `standard` mode | Metadata persisting not hit | Confirm generation is `visual_style != "standard"` so metadata stores it; check `getRemoteHistory` reads `item.metadata.visual_style` |
| MP4 render stuck at queued | Render server unreachable / auth failing | Check `settings.render_server_url` + `settings.render_server_key`, poll `/render/status/{job_id}` |
| Anime.js instance doesn't animate in MP4 | Missing `_animeR` registration | All `autoplay:false` instances must call `_animeR({instance, startMs})` |
| Anime.js animates in browser but jumps in MP4 | `_animeSeek` not called per frame | Check [generate_video.py:2364](../../ai_service/app/ai-video-gen-main/generate_video.py#L2364) inside `__batchRenderFrame` |
| Two shots visually overlap incorrectly | Shot timing gap | Director output must have `shot[N].end_time == shot[N+1].start_time`; validate at [automation_pipeline.py:3319](../../ai_service/app/ai-video-gen-main/automation_pipeline.py#L3319) |
| Frame regen breaks mode | Regen LLM doesn't know about `visual_style` | Known gap — inject mode from `metadata.visual_style` into regen system prompt (future work) |
| Background task keeps running after browser closes | Intended behaviour | Reconnect via `GET /status/{video_id}` polling |
| 402 Insufficient credits | Credit balance < reserved amount | Top up via AI credits purchase flow |
| 429 Too many requests | Rate limit or concurrency cap | Wait / reduce concurrent requests |

---

## 12. Future work / known gaps

1. **Frame regen mode-awareness**: inject `metadata.visual_style` into the regen system prompt so mid-video edits don't break mode constraints.
2. **Resume endpoint**: `VideoGenerationResumeRequest` schema exists but no route is wired up. `generate_till_stage(resume=True)` is only used internally.
3. **Rough.js vs SVG filter**: the current hand-drawn wobble uses `<feTurbulence>` + `<feDisplacementMap>`. This is free, preserves `stroke-dashoffset`, and needs no new CDN dep. Rough.js would give more authentic pencil-stroke fills but requires rewriting how `INFOGRAPHIC_SVG` generates paths. Open question.
4. **Shared AIVideoPlayer package**: admin and learner each have their own copy. Any change must be mirrored. A future refactor could extract to a shared package in `packages/ai-video-player`.
5. **Institute branding injection**: the pipeline reads `_current_style_config` from institute settings but doesn't currently propagate per-institute font overrides. See `_TEMPLATE_EXTRA_FONT_FAMILIES` in `_ensure_fonts` for the current extension point.
6. **Mobile playback**: the browser player works on mobile but `.stage-drift` and other transform-heavy effects can stutter on low-end devices. The render server MP4 is the recommended mobile delivery path.
7. **Kinetic text word-sync accuracy**: the pipeline-built `KINETIC_TEXT` shots have frame-perfect sync. LLM-built kinetic text in lower tiers relies on `sync_points` from the director which are not as precise.
8. **Stock video cache**: Pexels downloads are not cached across generations. Re-using the same stock footage for multiple shots within a video works, but across videos they re-fetch. A shared cache would cut Pexels API costs.

---

## 13. Glossary

| Term | Meaning |
|------|---------|
| **Shot** | A single unit of visual content within a video. One shot = one `<div>` of HTML, one shadow root at render time, 2–6 seconds of narration coverage. |
| **Segment** | Legacy term for multi-shot groups. Modern pipeline uses individual shots only. |
| **Beat** | A unit of the narrative script outline. One beat → 1–4 shots. |
| **Timeline** | The `time_based_frame.json` output containing all shots + audio metadata. |
| **Entry** | A single item in the timeline `entries[]` array (≈ shot for VIDEO content, ≈ question for QUIZ, ≈ page for STORYBOOK). |
| **Stage** | Pipeline phase: PENDING → SCRIPT → TTS → WORDS → HTML → RENDER. |
| **Director** | The shot-planning LLM call that turns a script + beat outline + word timestamps into a shot-by-shot plan. |
| **Shadow DOM** | Browser feature used by the render server to style-isolate each shot. Not used by the browser player (which uses iframes instead). |
| **Navigation mode** | `time_driven` (VIDEO — follows audio clock), `user_driven` (QUIZ/STORYBOOK — user clicks), `self_contained` (INTERACTIVE_GAME — HTML runs on its own). |
| **Pipeline mode** (= `visual_style`) | `standard` / `illustrated_svg` / `product_showcase`. Determines shot types, CSS utilities, and overall visual character. |
| **Image style** | LLM-picked photography/illustration style used as a prompt prefix for AI image generation. `"realistic cinematic photograph"` / `"flat vector illustration"` / etc. Distinct from pipeline mode. |
| **Quality tier** | `free` / `standard` / `premium` / `ultra` / `super_ultra`. Controls feature gates (two-pass review, validation, director, kinetic text, motion bias). Independent of pipeline mode. |

---

**Maintainers**: if you change anything in `automation_pipeline.py::run()`, `_ensure_fonts()`, `shot_type_cards.py::SHOT_TYPE_CARDS`, or the external API contract, update this doc in the same commit.
