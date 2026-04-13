/**
 * useWebAudioMixer — plays extra audio tracks in perfect sync with the narration.
 *
 * The narration <audio> element is the sync master.  This hook:
 *   1. Fetches and decodes each track URL into an AudioBuffer on mount/URL change.
 *   2. On play: starts an AudioBufferSourceNode for each track, offset by
 *      track.delay + current narration time so they stay in sync even after seeking.
 *   3. On pause: suspends the AudioContext (all extra tracks freeze immediately).
 *   4. On seek: restarts all nodes with the updated offset.
 *   5. Volume: routes each track through a GainNode.
 *   6. Fade: applied via gain.linearRampToValueAtTime at play start/end.
 *
 * The narration <audio> element is NOT routed through this context —
 * it plays normally so browser controls and captions work as expected.
 */

import { useEffect, useRef, useCallback } from 'react';
import { AudioTrack } from '../types';

interface UseWebAudioMixerOptions {
    /** Extra audio tracks from meta.audio_tracks. */
    tracks?: AudioTrack[];
    /** Ref to the narration <audio> element (sync master). */
    audioRef: React.RefObject<HTMLAudioElement>;
    /** Whether the narration is currently playing. */
    isPlaying: boolean;
    /** Current playback time of the narration (seconds). */
    currentTime: number;
}

interface TrackState {
    buffer: AudioBuffer;
    track: AudioTrack;
}

interface ActiveNode {
    source: AudioBufferSourceNode;
    gain: GainNode;
    trackId: string;
}

export function useWebAudioMixer({
    tracks,
    audioRef,
    isPlaying,
    currentTime,
}: UseWebAudioMixerOptions) {
    const ctxRef = useRef<AudioContext | null>(null);
    const trackStatesRef = useRef<TrackState[]>([]);
    const activeNodesRef = useRef<ActiveNode[]>([]);

    // Get or lazily create AudioContext
    const getCtx = useCallback((): AudioContext => {
        if (!ctxRef.current || ctxRef.current.state === 'closed') {
            ctxRef.current = new AudioContext();
        }
        return ctxRef.current;
    }, []);

    // Stop and discard all active AudioBufferSourceNodes
    const stopAll = useCallback(() => {
        for (const node of activeNodesRef.current) {
            try {
                node.source.stop();
            } catch {
                /* already stopped */
            }
            try {
                node.source.disconnect();
            } catch {
                /* ok */
            }
            try {
                node.gain.disconnect();
            } catch {
                /* ok */
            }
        }
        activeNodesRef.current = [];
    }, []);

    // Fetch + decode all track buffers whenever track URLs change
    useEffect(() => {
        if (!tracks || tracks.length === 0) {
            stopAll();
            trackStatesRef.current = [];
            return;
        }

        let cancelled = false;
        const ctx = getCtx();

        const load = async () => {
            const results: TrackState[] = [];
            for (const track of tracks) {
                if (!track.url) continue;
                try {
                    const resp = await fetch(track.url);
                    const arrayBuf = await resp.arrayBuffer();
                    if (cancelled) return;
                    const audioBuf = await ctx.decodeAudioData(arrayBuf);
                    if (cancelled) return;
                    results.push({ buffer: audioBuf, track });
                } catch (err) {
                    console.warn(`[AudioMixer] Failed to load track "${track.label}":`, err);
                }
            }
            if (!cancelled) {
                trackStatesRef.current = results;
            }
        };

        load();
        return () => {
            cancelled = true;
            // Stop nodes using old buffers
            stopAll();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(tracks?.map((t) => t.url)), getCtx, stopAll]);

    // Start playing all buffered tracks from the given narration time offset
    const startTracks = useCallback(
        (narTime: number) => {
            if (trackStatesRef.current.length === 0) return;
            const ctx = getCtx();
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            stopAll();

            for (const { buffer, track } of trackStatesRef.current) {
                // How far into the track audio we should start (accounting for delay)
                const trackDelay = track.delay ?? 0;
                const trackOffset = Math.max(0, narTime - trackDelay);

                // Skip tracks that have already finished at the current narration time
                if (trackOffset >= buffer.duration) continue;

                const acStartTime = ctx.currentTime + Math.max(0, trackDelay - narTime);

                const gainNode = ctx.createGain();
                gainNode.connect(ctx.destination);

                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(gainNode);

                // Volume + fade-in
                const targetVol = track.volume ?? 1;
                const fadeInDur = track.fadeIn ?? 0;
                gainNode.gain.setValueAtTime(0.0001, acStartTime);
                if (fadeInDur > 0 && trackOffset < fadeInDur) {
                    // Still within fade-in region — ramp from current point
                    const remaining = fadeInDur - trackOffset;
                    gainNode.gain.linearRampToValueAtTime(targetVol, acStartTime + remaining);
                } else {
                    gainNode.gain.setValueAtTime(targetVol, acStartTime);
                }

                // Fade out (schedule relative to remaining playback)
                const fadeOutDur = track.fadeOut ?? 0;
                const remainingPlayback = buffer.duration - trackOffset;
                if (fadeOutDur > 0 && remainingPlayback > fadeOutDur) {
                    const fadeOutStart = acStartTime + (remainingPlayback - fadeOutDur);
                    gainNode.gain.setValueAtTime(targetVol, fadeOutStart);
                    gainNode.gain.linearRampToValueAtTime(0, fadeOutStart + fadeOutDur);
                }

                source.start(acStartTime, trackOffset);
                activeNodesRef.current.push({ source, gain: gainNode, trackId: track.id });
            }
        },
        [getCtx, stopAll]
    );

    // React to play/pause state
    const prevIsPlayingRef = useRef(false);
    useEffect(() => {
        const nowPlaying = isPlaying;
        const wasPlaying = prevIsPlayingRef.current;
        prevIsPlayingRef.current = nowPlaying;

        if (nowPlaying && !wasPlaying) {
            const narTime = audioRef.current?.currentTime ?? currentTime;
            startTracks(narTime);
        } else if (!nowPlaying && wasPlaying) {
            if (ctxRef.current && ctxRef.current.state === 'running') {
                ctxRef.current.suspend();
            }
        }
    }, [isPlaying, audioRef, currentTime, startTracks]);

    // React to seek (large time jumps while playing)
    const prevCurrentTimeRef = useRef<number>(-1);
    useEffect(() => {
        const prev = prevCurrentTimeRef.current;
        prevCurrentTimeRef.current = currentTime;

        if (!isPlaying) return;

        if (prev >= 0 && Math.abs(currentTime - prev) > 1.5) {
            const narTime = audioRef.current?.currentTime ?? currentTime;
            startTracks(narTime);
        }
    }, [currentTime, isPlaying, audioRef, startTracks]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAll();
            if (ctxRef.current) {
                ctxRef.current.close();
                ctxRef.current = null;
            }
        };
    }, [stopAll]);
}
