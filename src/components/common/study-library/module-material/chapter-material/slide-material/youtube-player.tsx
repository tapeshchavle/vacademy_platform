    import React, { useEffect, useRef, useCallback, useState } from "react";
    import { v4 as uuidv4 } from 'uuid';
    import { useTrackingStore } from "@/stores/study-library/tracking-store";

    interface YTPlayer {
    destroy(): void;
    getCurrentTime(): number;
    getDuration(): number;
    }

    declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: {
            Player: new (
                container: HTMLElement | string,
                options: {
                    height?: string | number;
                    width?: string | number;
                    videoId?: string;
                    playerVars?: {
                        autoplay?: number;
                        controls?: number;
                        showinfo?: number;
                        rel?: number;
                        [key: string]: any;
                    };
                    events?: {
                        onReady?: (event: any) => void;
                        onStateChange?: (event: any) => void;
                        [key: string]: any;
                    };
                }
            ) => YTPlayer;
            PlayerState: {
                PLAYING: number;
                PAUSED: number;
                ENDED: number;
                BUFFERING: number;
            };
        };
    }
    }

    interface YouTubePlayerProps {
    videoUrl: string;
    videoTitle?: string;
    }

    export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl }) => {
    const { addActivity } = useTrackingStore();
    const playerRef = useRef<YTPlayer | null>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const activityId = useRef(uuidv4());
    const currentTimestamps = useRef<Array<{start: string, end: string}>>([]);
    //    const [timestamps, setTimestamps] = useState<Array<{start: string, end: string}>>([]);
    const videoStartTime = useRef<string>('');
    const videoEndTime = useRef<string>('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const extractVideoId = (url: string): string => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2] && match[2].length === 11) ? match[2] : "";
    };

    const calculateDuration = (timestamps: Array<{start: string, end: string}>) => {
            return timestamps.reduce((total, curr) => {
                if (!curr.end) return total; // Skip if there's no end time
                const startSeconds = convertToSeconds(curr.start);
                const endSeconds = convertToSeconds(curr.end);
                return total + (endSeconds - startSeconds);
            }, 0).toString();
        };

        const convertToSeconds = (timeStr: string): number => {
            const parts = timeStr.split(':');
            const minutes = parseInt(parts[0]);
            const seconds = parseInt(parts[1]);
            return minutes * 60 + seconds;
        };

        const calculatePercentageWatched = (timestamps: Array<{start: string, end: string}>, totalDuration: number) => {
            const watchedDuration = parseInt(calculateDuration(timestamps));
            return ((watchedDuration / (totalDuration)) * 100).toFixed(2);
        };

        const formatVideoTime = (seconds: number): string => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            
            return hours > 0 
            ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
            : `${minutes}:${secs.toString().padStart(2, '0')}`;
        };

        const createActivity = useCallback(() => {
            const videoId = extractVideoId(videoUrl);
            const endTime = videoEndTime.current || new Date().toISOString();
            const duration = calculateDuration(currentTimestamps.current);
            const percentageWatched = calculatePercentageWatched(
                currentTimestamps.current,
                playerRef.current?.getDuration() || 0
            );
        
            const newActivity = {
                activity_id: activityId.current,
                source: 'youtube',
                source_id: videoId,
                start_time: videoStartTime.current,
                end_time: endTime,
                duration,
                timestamps: currentTimestamps.current,
                percentage_watched: percentageWatched,
                sync_status: 'STALE' as const
            };
        
            // Update existing activity or create a new one
            addActivity(newActivity, true); // Pass `true` to indicate it's an update
        }, [videoUrl, addActivity]);

        const startTimer = useCallback(() => {
            if (timerRef.current) return;
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => {
                    return prev + 1;
                });
            }, 1000);
        }, []);
        
        const stopTimer = useCallback(() => {
            if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            }
        }, []);
        
        useEffect(() => {
            const interval = setInterval(() => {
                createActivity();
            }, 120000); // 2 minutes for API call syncs
        
            return () => clearInterval(interval);
        }, [createActivity]);
        
       
        useEffect(()=>{
            console.log("elapsedTime: ", elapsedTime)
        }, [elapsedTime])


        useEffect(() => {
        const videoId = extractVideoId(videoUrl);
        if (!videoId) return;

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            if (!playerContainerRef.current) return;

            const player = new window.YT.Player(playerContainerRef.current, {
                height: "100%",
                width: "100%",
                videoId: videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    showinfo: 0,
                    rel: 0,
                },
                events: {
                    onReady: () => {
                        console.log("Player ready");
                    },
                    onStateChange: (event) => {
                        const now = new Date().toISOString();
                        const currentTime = player.getCurrentTime();
                    
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            startTimer();
                            
                            if (!videoStartTime.current) {
                                videoStartTime.current = now;
                            }

                            currentTimestamps.current.push({
                                start: formatVideoTime(currentTime),
                                end: ''
                            });
                    
                        } else if (event.data === window.YT.PlayerState.PAUSED || 
                            event.data === window.YT.PlayerState.ENDED) {
                            stopTimer(); 
                            const lastTimestamp = currentTimestamps.current[currentTimestamps.current.length - 1];
                            if (lastTimestamp && !lastTimestamp.end) {
                                lastTimestamp.end = formatVideoTime(currentTime);
                                videoEndTime.current = now;
                    
                                // Immediately create activity with the updated timestamps
                            createActivity();
                            }
                        }
                    }
                    
                },
            });
            playerRef.current = player;
        };

        return () => {
            createActivity();
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [videoUrl, createActivity]);

    useEffect(() => {
        return () => {
            stopTimer();
        };
    }, [stopTimer]);

    return (
        <div className="aspect-video w-full">
            <div ref={playerContainerRef} />
            {/* Optionally render the timestamps for debugging */}
            {/* <div>
                <h3>Timestamps:</h3>
                <pre>{JSON.stringify(timestamps, null, 2)}</pre>
            </div> */}
        </div>
    );
    };

    export default YouTubePlayer;

