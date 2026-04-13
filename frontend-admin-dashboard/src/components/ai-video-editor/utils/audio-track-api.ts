/**
 * API helpers for managing extra audio tracks in the video timeline.
 * Each call mutates meta.audio_tracks in the S3 timeline JSON via the ai_service endpoints.
 */

import { AudioTrack } from '@/components/ai-video-player/types';
import { AI_SERVICE_BASE_URL } from '@/constants/urls';

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

function headers(apiKey: string) {
    return { 'Content-Type': 'application/json', 'X-Institute-Key': apiKey };
}

export async function apiAddAudioTrack(
    videoId: string,
    apiKey: string,
    track: Omit<AudioTrack, 'id'> & { id?: string }
): Promise<ApiResult<{ track_id: string }>> {
    try {
        const res = await fetch(`${AI_SERVICE_BASE_URL}/external/video/v1/audio-track/add`, {
            method: 'POST',
            headers: headers(apiKey),
            body: JSON.stringify({
                video_id: videoId,
                label: track.label,
                url: track.url,
                volume: track.volume,
                delay: track.delay,
                fade_in: track.fadeIn,
                fade_out: track.fadeOut,
                track_id: track.id,
            }),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => res.statusText);
            return { ok: false, error: text };
        }
        const json = await res.json();
        return { ok: true, data: { track_id: json.track_id } };
    } catch (e) {
        return { ok: false, error: String(e) };
    }
}

export async function apiUpdateAudioTrack(
    videoId: string,
    apiKey: string,
    trackId: string,
    patch: Partial<Omit<AudioTrack, 'id'>>
): Promise<ApiResult<void>> {
    try {
        const res = await fetch(`${AI_SERVICE_BASE_URL}/external/video/v1/audio-track/update`, {
            method: 'PATCH',
            headers: headers(apiKey),
            body: JSON.stringify({
                video_id: videoId,
                track_id: trackId,
                label: patch.label,
                url: patch.url,
                volume: patch.volume,
                delay: patch.delay,
                fade_in: patch.fadeIn,
                fade_out: patch.fadeOut,
            }),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => res.statusText);
            return { ok: false, error: text };
        }
        return { ok: true, data: undefined };
    } catch (e) {
        return { ok: false, error: String(e) };
    }
}

export async function apiDeleteAudioTrack(
    videoId: string,
    apiKey: string,
    trackId: string
): Promise<ApiResult<void>> {
    try {
        const res = await fetch(`${AI_SERVICE_BASE_URL}/external/video/v1/audio-track/delete`, {
            method: 'POST',
            headers: headers(apiKey),
            body: JSON.stringify({ video_id: videoId, track_id: trackId }),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => res.statusText);
            return { ok: false, error: text };
        }
        return { ok: true, data: undefined };
    } catch (e) {
        return { ok: false, error: String(e) };
    }
}
