/**
 * useWebAudioMixer — plays extra audio tracks in perfect sync with the narration.
 * Same implementation as the admin dashboard version.
 */

import { useEffect, useRef, useCallback } from 'react';
import { AudioTrack } from '../types';

interface UseWebAudioMixerOptions {
    tracks?: AudioTrack[];
    audioRef: React.RefObject<HTMLAudioElement>;
    isPlaying: boolean;
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

    const getCtx = useCallback((): AudioContext => {
        if (!ctxRef.current || ctxRef.current.state === 'closed') {
            ctxRef.current = new AudioContext();
        }
        return ctxRef.current;
    }, []);

    const stopAll = useCallback(() => {
        for (const node of activeNodesRef.current) {
            try { node.source.stop(); } catch { /* ok */ }
            try { node.source.disconnect(); } catch { /* ok */ }
            try { node.gain.disconnect(); } catch { /* ok */ }
        }
        activeNodesRef.current = [];
    }, []);

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
                    console.warn(`[AudioMixer] Failed to load "${track.label}":`, err);
                }
            }
            if (!cancelled) trackStatesRef.current = results;
        };
        load();
        return () => { cancelled = true; stopAll(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(tracks?.map((t) => t.url)), getCtx, stopAll]);

    const startTracks = useCallback((narTime: number) => {
        if (trackStatesRef.current.length === 0) return;
        const ctx = getCtx();
        if (ctx.state === 'suspended') ctx.resume();
        stopAll();

        for (const { buffer, track } of trackStatesRef.current) {
            const trackDelay = track.delay ?? 0;
            const trackOffset = Math.max(0, narTime - trackDelay);

            // Skip tracks that have already finished
            if (trackOffset >= buffer.duration) continue;

            const acStartTime = ctx.currentTime + Math.max(0, trackDelay - narTime);
            const gainNode = ctx.createGain();
            gainNode.connect(ctx.destination);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(gainNode);

            const targetVol = track.volume ?? 1;
            const fadeInDur = track.fadeIn ?? 0;
            gainNode.gain.setValueAtTime(0.0001, acStartTime);
            if (fadeInDur > 0 && trackOffset < fadeInDur) {
                const remaining = fadeInDur - trackOffset;
                gainNode.gain.linearRampToValueAtTime(targetVol, acStartTime + remaining);
            } else {
                gainNode.gain.setValueAtTime(targetVol, acStartTime);
            }

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
    }, [getCtx, stopAll]);

    const prevIsPlayingRef = useRef(false);
    useEffect(() => {
        const nowPlaying = isPlaying;
        const wasPlaying = prevIsPlayingRef.current;
        prevIsPlayingRef.current = nowPlaying;
        if (nowPlaying && !wasPlaying) {
            startTracks(audioRef.current?.currentTime ?? currentTime);
        } else if (!nowPlaying && wasPlaying) {
            if (ctxRef.current?.state === 'running') ctxRef.current.suspend();
        }
    }, [isPlaying, audioRef, currentTime, startTracks]);

    const prevCurrentTimeRef = useRef<number>(-1);
    useEffect(() => {
        const prev = prevCurrentTimeRef.current;
        prevCurrentTimeRef.current = currentTime;
        if (!isPlaying) return;
        if (prev >= 0 && Math.abs(currentTime - prev) > 1.5) {
            startTracks(audioRef.current?.currentTime ?? currentTime);
        }
    }, [currentTime, isPlaying, audioRef, startTracks]);

    useEffect(() => {
        return () => {
            stopAll();
            ctxRef.current?.close();
            ctxRef.current = null;
        };
    }, [stopAll]);
}
