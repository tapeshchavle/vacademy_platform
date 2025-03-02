import React, { useEffect, useRef, useCallback, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useTrackingStore } from "@/stores/study-library/youtube-video-tracking-store";
import { getEpochTimeInMillis } from "./utils";
import { convertTimeToSeconds } from "@/utils/study-library/tracking/convertTimeToSeconds";
import { formatVideoTime } from "@/utils/study-library/tracking/formatVideoTime";
import { calculateNetDuration } from "@/utils/study-library/tracking/calculateNetDuration";
import { useVideoSync } from "@/hooks/study-library/useVideoSync";
import YouTube, { YouTubeEvent, YouTubePlayer, YouTubeProps } from 'react-youtube';
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { ArrowsOut, Check, FastForward, Pause, Play, Rewind } from "@phosphor-icons/react";

// Add the YouTube PlayerState enum to avoid window.YT references
enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
}

interface YouTubePlayerProps {
    videoId: string;
    videoTitle?: string;
}

export const YouTubePlayerComp: React.FC<YouTubePlayerProps> = ({ videoId }) => {
    const { addActivity } = useTrackingStore();
    const activityId = useRef(uuidv4());
    const currentTimestamps = useRef<Array<{ id: string, start_time: string, end_time: string, start: number, end: number }>>([]);
    const videoStartTime = useRef<number>(0);
    const videoEndTime = useRef<number>(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const currentStartTimeRef = useRef('');
    const timestampDurationRef = useRef(0);
    const [isFirstPlay, setIsFirstPlay] = useState(true);
    const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { syncVideoTrackingData } = useVideoSync();
    const currentStartTimeInEpochRef = useRef<number>(0);

    const [isPlayed, setIsPlayed] = useState(false);
    const [player, setPlayer] = useState<YouTubePlayer | null>(null);
    const [playerReady, setPlayerReady] = useState(false);
    const [duration, setDuration] = useState(0);
    const [minutesInput, setMinutesInput] = useState("");
    const [secondsInput, setSecondsInput] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false); // Fullscreen state
    const iframeRef = useRef<HTMLIFrameElement | null>(null);  // Ref for the iframe

    // Helper function to safely get a number from potentially a Promise<number>
    const safeGetNumber = async (value: any): Promise<number> => {
        if (value === undefined || value === null) return 0;
        if (typeof value === 'number') return value;
        if (value instanceof Promise) {
            try {
                const resolved = await value;
                return typeof resolved === 'number' ? resolved : 0;
            } catch {
                return 0;
            }
        }
        return 0;
    };

    const calculatePercentageWatched = (totalDuration: number) => {
        const netDuration = calculateNetDuration(currentTimestamps.current);
        return ((netDuration / totalDuration) * 100).toFixed(2);
    };

    const clearUpdateInterval = useCallback(() => {
        if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
            updateIntervalRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        if (timerRef.current) return;
        timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
            timestampDurationRef.current += 1;
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Get duration when player is ready
    useEffect(() => {
        if (!player) return;

        const getDuration = async () => {
            try {
                const dur = await safeGetNumber(player.getDuration());
                setDuration(dur);
            } catch (error) {
                console.error("Error getting duration:", error);
            }
        };

        getDuration();
    }, [player]);

    // Activity tracking effect
    useEffect(() => {
        const endTime = videoEndTime.current || getEpochTimeInMillis();

        const newActivity = {
            activity_id: activityId.current,
            source: 'YOUTUBE',
            source_id: videoId,
            start_time: videoStartTime.current,
            end_time: endTime,
            duration: elapsedTime.toString(),
            timestamps: currentTimestamps.current,
            percentage_watched: calculatePercentageWatched(duration),
            sync_status: 'STALE' as const,
            current_start_time: currentStartTimeRef.current,
            current_start_time_in_epoch: currentStartTimeInEpochRef.current,
            new_activity: true
        };
        addActivity(newActivity, true);
    }, [elapsedTime, duration, videoId, addActivity]);

    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: {
            // autoplay: 0,
            controls: 1,
            // showinfo: 0,
            rel: 0,
        },
    };

    const togglePause = () => {
        setIsPlayed(false);
        console.log("video is paused");
    };

    const togglePlay = () => {
        setIsPlayed(true);
        console.log("Video is played");
    };

    const onPlayerReady: YouTubeProps['onReady'] = async (event: YouTubeEvent) => {
        console.log("Player ready");
        setPlayer(event.target);
        setPlayerReady(true);

        // Get the iframe element
        try {
            const iframe = await event.target.getIframe();
            iframeRef.current = iframe;
        } catch (error) {
            console.error("Error getting iframe:", error);
        }
    };

    // Control video playback based on isPlayed state
    useEffect(() => {
        if (!player || !playerReady) return;

        try {
            if (isPlayed) {
                player.playVideo();
            } else {
                player.pauseVideo();
            }
        } catch (error) {
            console.error("Error controlling video playback:", error);
        }
        console.log("current time", player.getCurrentTime());
        console.log("video len: ", player.getDuration());
    }, [isPlayed, player, playerReady]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            clearUpdateInterval();
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [clearUpdateInterval]);

    const onStateChange = async (event: YouTubeEvent) => {
        if (!player) return;

        const now = getEpochTimeInMillis();

        // Handle different state events without directly referencing YT.PlayerState
        const PLAYING_STATE = PlayerState.PLAYING;
        const PAUSED_STATE = PlayerState.PAUSED;
        const ENDED_STATE = PlayerState.ENDED;

        // Safely get the current time
        let currentTime = 0;
        try {
            currentTime = await safeGetNumber(player.getCurrentTime());
        } catch (error) {
            console.error("Error getting current time:", error);
        }

        if (event.data === PLAYING_STATE) {
            startTimer();

            if (!videoStartTime.current) {
                videoStartTime.current = now;
            }

            if (isFirstPlay) {
                console.log("integrate add video activity api now");
                syncVideoTrackingData();
                setIsFirstPlay(false);

                if (!updateIntervalRef.current) {
                    updateIntervalRef.current = setInterval(() => {
                        console.log("integrate update video activity api now");
                        syncVideoTrackingData();
                    }, 2 * 60 * 1000);
                }
            }

            currentStartTimeRef.current = formatVideoTime(currentTime);
            currentStartTimeInEpochRef.current = convertTimeToSeconds(currentStartTimeRef.current) * 1000;
            setIsPlayed(true);
            console.log("play state");

        } else if (event.data === PAUSED_STATE || event.data === ENDED_STATE) {
            stopTimer();
            videoEndTime.current = now;

            const currentStartTimeInSeconds = convertTimeToSeconds(currentStartTimeRef.current);
            const endTimeInSeconds = currentStartTimeInSeconds + timestampDurationRef.current;
            const endTimeStamp = formatVideoTime(endTimeInSeconds);

            currentTimestamps.current.push({
                id: uuidv4(),
                start_time: currentStartTimeRef.current,
                end_time: endTimeStamp,
                start: convertTimeToSeconds(currentStartTimeRef.current) * 1000,
                end: convertTimeToSeconds(endTimeStamp) * 1000
            });

            currentStartTimeRef.current = formatVideoTime(currentTime);
            timestampDurationRef.current = 0;
            setIsPlayed(false);
        }
    };

    const handleNumericInput = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const value = e.target.value;
        // Only allow numbers
        if (value === '' || /^\d+$/.test(value)) {
            setter(value);
        }
    };

    const seekToTimestamp = async () => {
        if (!player || !playerReady) return;

        // Convert inputs to numbers
        const minutes = minutesInput === "" ? 0 : parseInt(minutesInput);
        const seconds = secondsInput === "" ? 0 : parseInt(secondsInput);

        // Calculate total seconds
        const totalSeconds = (minutes * 60) + seconds;

        try {
            // Get video duration
            const videoDuration = await safeGetNumber(player.getDuration());

            // Ensure timestamp is within valid range
            if (totalSeconds <= 0) {
                player.seekTo(0, true);
            } else if (totalSeconds >= videoDuration) {
                player.seekTo(videoDuration, true);
            } else {
                player.seekTo(totalSeconds, true);
            }

            // Optional: Clear inputs after seeking
            // setMinutesInput("");
            // setSecondsInput("");
        } catch (error) {
            console.error("Error seeking to timestamp:", error);
        }
    };

    const toggleFullscreen = useCallback(async () => {
        if (!iframeRef.current) {
            console.error("Iframe not available");
            return;
        }

        try {
            if (!document.fullscreenElement) {
                await iframeRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (error) {
            console.error("Error toggling fullscreen:", error);
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);


    return (
        <div className="w-full flex flex-col items-center gap-4">
            <div className="aspect-video w-full relative h-full items-center flex justify-center">
                <div className={`size-full absolute z-[9999] ${isFullscreen ? "h-[100vh] w-[100vw]": "w-full h-full"}`}></div>
                <YouTube
                    videoId={videoId}
                    opts={opts}
                    onReady={onPlayerReady}
                    className="h-full w-full"
                    onStateChange={onStateChange}
                />
            </div>
            <div className="flex gap-2 justify-between items-center w-full">
                <div className="w-full flex gap-2 items-center justify-start">
                    {isPlayed ?
                        <MyButton
                            buttonType="secondary"
                            scale="medium"
                            layoutVariant="icon"
                            onClick={togglePause}
                            disable={!playerReady || !isPlayed}
                        >
                            <Pause />
                        </MyButton>
                        :
                        <MyButton
                            buttonType="primary"
                            scale="medium"
                            layoutVariant="icon"
                            onClick={togglePlay}
                            disable={!playerReady || isPlayed}
                        >
                            <Play />
                        </MyButton>
                    }

                    <MyButton buttonType="secondary" scale="medium" layoutVariant="icon" onClick={() => {
                        if (player) {
                            safeGetNumber(player.getCurrentTime()).then(currentTime => {
                                const newTime = currentTime - 10;
                                // If less than 10 seconds from start, go to beginning
                                player.seekTo(Math.max(newTime, 0), true);

                            });
                        }
                    }}>
                        <Rewind />
                    </MyButton>

                    <MyButton buttonType="secondary" scale="medium" layoutVariant="icon" onClick={() => {
                        if (player) {
                            safeGetNumber(player.getCurrentTime()).then(currentTime => {
                                const newTime = currentTime + 10;
                                safeGetNumber(player.getDuration()).then(duration => {
                                    // If less than 10 seconds from the end, go to end of video
                                    player.seekTo(Math.min(newTime, duration), true);
                                });
                            });
                        }
                    }}>
                        <FastForward />
                    </MyButton>
                    <MyButton
                        buttonType="secondary"
                        scale="medium"
                        layoutVariant="icon"
                        onClick={toggleFullscreen}
                        disable={!iframeRef.current}
                    >
                        <ArrowsOut />
                    </MyButton>
                </div>
                <div className="flex items-center gap-1">
                    <MyInput
                        inputType="text"
                        inputPlaceholder="Min"
                        input={minutesInput}
                        onChangeFunction={(e) => handleNumericInput(e, setMinutesInput)}
                        size="small"
                        className="w-12 h-full"
                    />
                    <span>:</span>
                    <MyInput
                        inputType="text"
                        inputPlaceholder="Sec"
                        input={secondsInput}
                        onChangeFunction={(e) => handleNumericInput(e, setSecondsInput)}
                        size="small"
                        className="w-12 h-full"
                    />
                    <MyButton
                        buttonType="secondary"
                        scale="medium"
                        layoutVariant="icon"
                        onClick={seekToTimestamp}
                        disable={!playerReady}
                    >
                        <Check />
                    </MyButton>
                </div>
            </div>
        </div>
    );
};
