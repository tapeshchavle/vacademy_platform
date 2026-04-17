"""
Render Worker — Dedicated video rendering service.

Runs on a separate server (Hetzner CPX32). Accepts render jobs via HTTP,
runs generate_video.py (Playwright + FFmpeg), uploads MP4 to S3.
"""
from __future__ import annotations

import asyncio
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel, Field

from worker import RenderWorker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("render-worker")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

RENDER_KEY = os.environ.get("RENDER_KEY", "")
MAX_CONCURRENT_JOBS = int(os.environ.get("MAX_CONCURRENT_JOBS", "2"))

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="Vacademy Render Worker", version="1.0.0")

# In-memory job tracker (single-process worker, no need for DB)
jobs: Dict[str, dict] = {}
worker = RenderWorker()


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

def _verify_key(x_render_key: str = Header(...)):
    if RENDER_KEY and x_render_key != RENDER_KEY:
        raise HTTPException(status_code=401, detail="Invalid render key")


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class RenderJobRequest(BaseModel):
    job_id: Optional[str] = Field(default=None, description="Optional job ID (generated if not provided)")
    video_id: str = Field(..., description="Video ID for S3 path")
    timeline_url: str = Field(..., description="S3 URL to time_based_frame.json")
    audio_url: str = Field(..., description="S3 URL to narration.mp3")
    words_url: Optional[str] = Field(None, description="S3 URL to narration.words.json")
    branding_meta_url: Optional[str] = Field(None, description="S3 URL to branding_meta.json")
    avatar_video_url: Optional[str] = Field(None, description="S3 URL to avatar_video.mp4")
    callback_url: Optional[str] = Field(None, description="URL to POST on completion")
    show_captions: bool = Field(default=True)
    show_branding: bool = Field(default=True)
    audio_delay: float = Field(default=0.0)
    width: int = Field(default=1920, description="Video width (1920 for landscape, 1080 for portrait)")
    height: int = Field(default=1080, description="Video height (1080 for landscape, 1920 for portrait)")
    fps: Optional[int] = Field(default=None, description="Frames per second (15, 20, 25). Defaults to 22 if not set.")
    caption_position: Optional[str] = Field(default=None, description="top or bottom")
    caption_text_color: Optional[str] = Field(default=None, description="CSS color for caption text")
    caption_bg_color: Optional[str] = Field(default=None, description="CSS hex color for caption background")
    caption_bg_opacity: Optional[int] = Field(default=None, description="Caption background opacity 0-100")
    caption_font_size: Optional[int] = Field(default=None, description="Caption font size in px")


class RenderJobResponse(BaseModel):
    job_id: str
    status: str
    message: str = ""


class RenderJobStatus(BaseModel):
    job_id: str
    video_id: str
    status: str  # queued, running, completed, failed
    progress: Optional[float] = None  # 0-100
    video_url: Optional[str] = None
    error: Optional[str] = None
    created_at: str
    updated_at: str


# ---------------------------------------------------------------------------
# Background render task
# ---------------------------------------------------------------------------

async def _run_render_job(job_id: str, request: RenderJobRequest):
    """Run render in background, update job status."""
    jobs[job_id]["status"] = "running"
    jobs[job_id]["updated_at"] = datetime.now(timezone.utc).isoformat()

    try:
        video_url = await worker.render(
            video_id=request.video_id,
            timeline_url=request.timeline_url,
            audio_url=request.audio_url,
            words_url=request.words_url,
            branding_meta_url=request.branding_meta_url,
            avatar_video_url=request.avatar_video_url,
            show_captions=request.show_captions,
            show_branding=request.show_branding,
            audio_delay=request.audio_delay,
            on_progress=lambda p: _update_progress(job_id, p),
            width=request.width,
            height=request.height,
            fps=request.fps,
            caption_position=request.caption_position,
            caption_text_color=request.caption_text_color,
            caption_bg_color=request.caption_bg_color,
            caption_bg_opacity=request.caption_bg_opacity,
            caption_font_size=request.caption_font_size,
        )

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["video_url"] = video_url
        jobs[job_id]["progress"] = 100
        jobs[job_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
        logger.info(f"Job {job_id} completed: {video_url}")

        # Send callback
        if request.callback_url:
            await _send_callback(request.callback_url, {
                "video_id": request.video_id,
                "job_id": job_id,
                "status": "completed",
                "video_url": video_url,
            })

    except Exception as e:
        error_msg = str(e)
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = error_msg
        jobs[job_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
        logger.error(f"Job {job_id} failed: {error_msg}")

        if request.callback_url:
            await _send_callback(request.callback_url, {
                "video_id": request.video_id,
                "job_id": job_id,
                "status": "failed",
                "error": error_msg,
            })


def _update_progress(job_id: str, progress: float):
    if job_id in jobs:
        jobs[job_id]["progress"] = progress
        jobs[job_id]["updated_at"] = datetime.now(timezone.utc).isoformat()


async def _send_callback(url: str, data: dict):
    """Send completion callback to API server."""
    import httpx
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            headers = {}
            if RENDER_KEY:
                headers["X-Render-Key"] = RENDER_KEY
            await client.post(url, json=data, headers=headers)
            logger.info(f"Callback sent to {url}")
    except Exception as e:
        logger.warning(f"Callback failed: {e}")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    active = sum(1 for j in jobs.values() if j["status"] in ("queued", "running"))
    return {"status": "ok", "active_jobs": active, "max_concurrent": MAX_CONCURRENT_JOBS}


@app.post("/jobs", response_model=RenderJobResponse)
async def submit_job(
    request: RenderJobRequest,
    x_render_key: str = Header(""),
):
    _verify_key(x_render_key)

    # Check capacity
    active = sum(1 for j in jobs.values() if j["status"] in ("queued", "running"))
    if active >= MAX_CONCURRENT_JOBS:
        raise HTTPException(status_code=429, detail=f"Server busy ({active}/{MAX_CONCURRENT_JOBS} jobs running)")

    job_id = request.job_id or str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    jobs[job_id] = {
        "job_id": job_id,
        "video_id": request.video_id,
        "status": "queued",
        "progress": 0,
        "video_url": None,
        "error": None,
        "created_at": now,
        "updated_at": now,
    }

    # Fire and forget
    asyncio.create_task(_run_render_job(job_id, request))

    return RenderJobResponse(job_id=job_id, status="queued", message="Render job submitted")


@app.get("/jobs/{job_id}", response_model=RenderJobStatus)
async def get_job_status(job_id: str, x_render_key: str = Header("")):
    _verify_key(x_render_key)

    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    j = jobs[job_id]
    return RenderJobStatus(**j)


# ---------------------------------------------------------------------------
# Index Jobs — Video input indexing (stub for Step 1, real pipeline in Step 2)
# ---------------------------------------------------------------------------

index_jobs: Dict[str, dict] = {}


class IndexJobRequest(BaseModel):
    input_video_id: str = Field(..., description="AI Input Video record ID")
    source_url: str = Field(..., description="S3 URL of the uploaded video")
    mode: str = Field(..., description="'podcast' or 'demo'")
    callback_url: Optional[str] = Field(None, description="Webhook URL on completion")


class IndexJobResponse(BaseModel):
    job_id: str
    status: str
    message: str = ""


class IndexJobStatus(BaseModel):
    job_id: str
    input_video_id: str
    status: str  # queued, running, completed, failed
    progress: Optional[float] = None
    output_urls: Optional[dict] = None
    duration_seconds: Optional[float] = None
    resolution: Optional[str] = None
    error: Optional[str] = None
    created_at: str
    updated_at: str


async def _run_index_job_stub(job_id: str, request: IndexJobRequest):
    """Stub: simulates indexing by sleeping, then returning empty outputs.

    Step 2 will replace this with the real extraction pipeline
    (faster-whisper, mediapipe, matting, etc.).
    """
    index_jobs[job_id]["status"] = "running"
    index_jobs[job_id]["progress"] = 10
    index_jobs[job_id]["updated_at"] = datetime.now(timezone.utc).isoformat()

    try:
        # Simulate processing stages
        for pct in (20, 40, 60, 80, 95):
            await asyncio.sleep(1)
            index_jobs[job_id]["progress"] = pct
            index_jobs[job_id]["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Stub outputs — S3 keys that would be produced by the real pipeline
        base_key = f"ai-input-videos/{request.input_video_id}"
        output_urls = {
            "context_json": f"https://vacademy-media-storage.s3.amazonaws.com/{base_key}/video_context.json",
            "spatial_db": f"https://vacademy-media-storage.s3.amazonaws.com/{base_key}/video_spatial.sqlite",
            "assets": {
                "speaker_fg": f"https://vacademy-media-storage.s3.amazonaws.com/{base_key}/assets/speaker_fg.webm",
            },
        }

        index_jobs[job_id]["status"] = "completed"
        index_jobs[job_id]["progress"] = 100
        index_jobs[job_id]["output_urls"] = output_urls
        index_jobs[job_id]["duration_seconds"] = 30.0  # stub
        index_jobs[job_id]["resolution"] = "1920x1080"  # stub
        index_jobs[job_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
        logger.info(f"Index job {job_id} completed (stub)")

        if request.callback_url:
            await _send_callback(request.callback_url, {
                "input_video_id": request.input_video_id,
                "job_id": job_id,
                "status": "completed",
                "output_urls": output_urls,
            })

    except Exception as e:
        index_jobs[job_id]["status"] = "failed"
        index_jobs[job_id]["error"] = str(e)
        index_jobs[job_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
        logger.error(f"Index job {job_id} failed: {e}")

        if request.callback_url:
            await _send_callback(request.callback_url, {
                "input_video_id": request.input_video_id,
                "job_id": job_id,
                "status": "failed",
                "error": str(e),
            })


@app.post("/index-jobs", response_model=IndexJobResponse)
async def submit_index_job(
    request: IndexJobRequest,
    x_render_key: str = Header(""),
):
    _verify_key(x_render_key)

    # Shared capacity check: render + index jobs compete for the same CPU
    active_render = sum(1 for j in jobs.values() if j["status"] in ("queued", "running"))
    active_index = sum(1 for j in index_jobs.values() if j["status"] in ("queued", "running"))
    active_total = active_render + active_index
    if active_total >= MAX_CONCURRENT_JOBS:
        raise HTTPException(
            status_code=429,
            detail=f"Server busy ({active_total}/{MAX_CONCURRENT_JOBS} jobs running)",
        )

    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    index_jobs[job_id] = {
        "job_id": job_id,
        "input_video_id": request.input_video_id,
        "status": "queued",
        "progress": 0,
        "output_urls": None,
        "duration_seconds": None,
        "resolution": None,
        "error": None,
        "created_at": now,
        "updated_at": now,
    }

    asyncio.create_task(_run_index_job_stub(job_id, request))

    return IndexJobResponse(job_id=job_id, status="queued", message="Index job submitted")


@app.get("/index-jobs/{job_id}", response_model=IndexJobStatus)
async def get_index_job_status(job_id: str, x_render_key: str = Header("")):
    _verify_key(x_render_key)

    if job_id not in index_jobs:
        raise HTTPException(status_code=404, detail="Index job not found")

    j = index_jobs[job_id]
    return IndexJobStatus(**j)


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def startup():
    logger.info(f"Render Worker started (max {MAX_CONCURRENT_JOBS} concurrent jobs)")
