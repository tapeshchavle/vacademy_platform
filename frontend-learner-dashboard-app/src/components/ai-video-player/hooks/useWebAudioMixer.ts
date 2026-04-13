/**
 * useWebAudioMixer — plays extra audio tracks in perfect sync with the narration.
 *
 * Same implementation as the admin dashboard version.
 * The narration <audio> element is the sync master; this hook schedules
 * extra tracks via Web Audio API so they stay perfectly in sync.
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

    function getCtx(): AudioContext {
        if (!ctxRef.current || ctxRef.current.state === 'closed') {
            ctxRef.current = new AudioContext();
        }
        return ctxRef.current;
    }

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
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(tracks?.map((t) => t.url))]);

    const startTracks = useCallback((narTime: number) => {
        if (trackStatesRef.current.length === 0) return;
        const ctx = getCtx();
        if (ctx.state === 'suspended') ctx.resume();
        stopAll();

        for (const { buffer, track } of trackStatesRef.current) {
            const gainNode = ctx.createGain();
            gainNode.connect(ctx.destination);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(gainNode);

            const trackDelay = track.delay ?? 0;
            const trackOffset = Math.max(0, narTime - trackDelay);
            const acStartTime = ctx.currentTime + Math.max(0, trackDelay - narTime);
            const targetVol = track.volume ?? 1;
            const fadeInDur = track.fadeIn ?? 0;

            gainNode.gain.setValueAtTime(0.0001, acStartTime);
            if (fadeInDur > 0) {
                gainNode.gain.linearRampToValueAtTime(targetVol, acStartTime + fadeInDur);
            } else {
                gainNode.gain.setValueAtTime(targetVol, acStartTime);
            }

            const fadeOutDur = track.fadeOut ?? 0;
            if (fadeOutDur > 0 && buffer.duration > fadeOutDur) {
                const fadeOutStart = acStartTime + (buffer.duration - trackOffset - fadeOutDur);
                if (fadeOutStart > ctx.currentTime) {
                    gainNode.gain.setValueAtTime(targetVol, fadeOutStart);
                    gainNode.gain.linearRampToValueAtTime(0, fadeOutStart + fadeOutDur);
                }
            }

            source.start(acStartTime, trackOffset);
            activeNodesRef.current.push({ source, gain: gainNode, trackId: track.id });
        }
    }, [stopAll]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying]);

    const prevCurrentTimeRef = useRef<number>(-1);
    useEffect(() => {
        const prev = prevCurrentTimeRef.current;
        prevCurrentTimeRef.current = currentTime;
        if (!isPlaying) return;
        if (prev >= 0 && Math.abs(currentTime - prev) > 1.5) {
            startTracks(audioRef.current?.currentTime ?? currentTime);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTime]);

    useEffect(() => {
        return () => {
            stopAll();
            ctxRef.current?.close();
            ctxRef.current = null;
        };
    }, [stopAll]);
}
