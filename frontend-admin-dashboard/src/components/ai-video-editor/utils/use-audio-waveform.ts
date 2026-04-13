import { useState, useEffect } from 'react';

/**
 * Fetches an audio file and decodes it via the Web Audio API,
 * returning a normalised array of peak amplitudes (0–1) ready for rendering.
 *
 * The computation runs once per URL and is cancelled if the URL changes or
 * the component unmounts before decoding finishes.
 */
export function useAudioWaveform(audioUrl?: string, numPeaks = 400) {
    const [peaks, setPeaks] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!audioUrl) {
            setPeaks([]);
            return;
        }

        let cancelled = false;
        let audioCtx: AudioContext | null = null;
        setLoading(true);

        (async () => {
            try {
                const response = await fetch(audioUrl);
                if (cancelled) return;

                const arrayBuffer = await response.arrayBuffer();
                if (cancelled) return;

                audioCtx = new AudioContext();
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                if (cancelled) return;

                // Use the first channel (mono / left channel)
                const raw = audioBuffer.getChannelData(0);
                const blockSize = Math.max(1, Math.floor(raw.length / numPeaks));
                const computed: number[] = [];
                let globalMax = 0;

                for (let i = 0; i < numPeaks; i++) {
                    let peak = 0;
                    const start = i * blockSize;
                    const end = Math.min(start + blockSize, raw.length);
                    for (let j = start; j < end; j++) {
                        const abs = Math.abs(raw[j] ?? 0);
                        if (abs > peak) peak = abs;
                    }
                    computed.push(peak);
                    if (peak > globalMax) globalMax = peak;
                }

                // Normalise so the loudest peak = 1
                const normalised =
                    globalMax > 0 ? computed.map((p) => p / globalMax) : computed;

                if (!cancelled) setPeaks(normalised);
            } catch {
                // Audio unavailable or CORS blocked — silently skip waveform
            } finally {
                if (!cancelled) setLoading(false);
                audioCtx?.close().catch(() => {});
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [audioUrl, numPeaks]);

    return { peaks, loading };
}
