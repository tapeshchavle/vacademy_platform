import React, { useEffect, useRef, useCallback, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useTrackingStore } from "@/stores/study-library/youtube-video-tracking-store";
import { getISTTime } from "./utils";

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
   const currentTimestamps = useRef<Array<{id: string, start_time: string, end_time: string}>>([]);
   const videoStartTime = useRef<string>('');
   const videoEndTime = useRef<string>('');
   const [elapsedTime, setElapsedTime] = useState(0);
   const timerRef = useRef<NodeJS.Timeout | null>(null);
   const currentStartTimeRef = useRef('');
   const timestampDurationRef = useRef(0);
   const [isFirstPlay, setIsFirstPlay] = useState(true);
    const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const clearUpdateInterval = useCallback(() => {
        if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
            updateIntervalRef.current = null;
        }
    }, []);

   const extractVideoId = (url: string): string => {
       const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
       const match = url.match(regExp);
       return (match && match[2] && match[2].length === 11) ? match[2] : "";
   };

   const calculatePercentageWatched = (totalDuration: number) => {
        const netDuration = calculateNetDuration(currentTimestamps.current);
        return ((netDuration / totalDuration) * 100).toFixed(2);
    };

   const formatVideoTime = (seconds: number): string => {
       const hours = Math.floor(seconds / 3600);
       const minutes = Math.floor((seconds % 3600) / 60);
       const secs = Math.floor(seconds % 60);
       
       return hours > 0 
           ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
           : `${minutes}:${secs.toString().padStart(2, '0')}`;
   };

   const convertTimeToSeconds = (formattedTime: string): number => {
        const parts = formattedTime.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    };

   const startTimer = useCallback(() => {
       if (timerRef.current) return;
       timerRef.current = setInterval(() => {
           setElapsedTime(prev => prev + 1);
        //    setTimestampDuration(prev => prev + 1);
           timestampDurationRef.current += 1
       }, 1000);
   }, []);

   const stopTimer = useCallback(() => {
       if (timerRef.current) {
           clearInterval(timerRef.current);
           timerRef.current = null;
       }
   }, []);

   const calculateNetDuration = (timestamps: Array<{id: string, start_time: string, end_time: string}>): number => {
    
    if (timestamps.length === 0) return 0;

    // Convert timestamps to seconds for easier calculation
    const ranges = timestamps.map(t => ({
        id: t.id,
        start: convertTimeToSeconds(t.start_time),
        end: convertTimeToSeconds(t.end_time)
    }));

    // Sort ranges by start time
    ranges.sort((a, b) => a.start - b.start);

    // Merge overlapping ranges
    const mergedRanges = ranges.reduce((merged, current) => {
        if (merged.length === 0) {
            return [current];
        }

        const lastRange = merged[merged.length - 1];
        if (current.start <= lastRange.end) {
            // Overlapping range - merge them
            lastRange.end = Math.max(lastRange.end, current.end);
            return merged;
        } else {
            // Non-overlapping range - add to list
            return [...merged, current];
        }
    }, [] as Array<{start: number, end: number}>);

    // Calculate total duration from merged ranges
    const totalDuration = mergedRanges.reduce((sum, range) => {
        return sum + (range.end - range.start);
    }, 0);

    return totalDuration;
};

   useEffect(() => {
       const videoId = extractVideoId(videoUrl);
       const endTime = videoEndTime.current || getISTTime();
       
       const newActivity = {
           activity_id: activityId.current,
           source: 'youtube',
           source_id: videoId,
           start_time: videoStartTime.current,
           end_time: endTime,
           duration: elapsedTime.toString(),
           timestamps: currentTimestamps.current,
           percentage_watched: calculatePercentageWatched(
               playerRef.current?.getDuration() || 0
           ),
           sync_status: 'STALE' as const,
           current_start_time: currentStartTimeRef.current 
       };
   
       addActivity(newActivity, true);
   }, [elapsedTime]);

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
                       const now = getISTTime();
                       const currentTime = player.getCurrentTime();

                       
                       if (event.data === window.YT.PlayerState.PLAYING) {
                           startTimer();
                           
                           if (!videoStartTime.current) {
                               videoStartTime.current = now;
                            }

                            if (isFirstPlay) {
                                console.log("integrate add video activity api now");
                                setIsFirstPlay(false);
                                
                                // Start the 2-minute interval for update notifications
                                if (!updateIntervalRef.current) {
                                    updateIntervalRef.current = setInterval(() => {
                                        console.log("integrate update video activity api now");
                                    }, 2 * 60 * 1000); // 2 minutes in milliseconds
                                }
                            }

                            currentStartTimeRef.current = formatVideoTime(currentTime);
                            console.log("play state")
                            
                        } else if (event.data === window.YT.PlayerState.PAUSED || 
                            event.data === window.YT.PlayerState.ENDED) {
                                stopTimer();
                                videoEndTime.current = now;
                        
                                const currentStartTimeInSeconds = convertTimeToSeconds(currentStartTimeRef.current);
                                const endTimeInSeconds = currentStartTimeInSeconds + timestampDurationRef.current;
                                const endTimeStamp = formatVideoTime(endTimeInSeconds);
                        
                                currentTimestamps.current.push({
                                    id: uuidv4(), // Add this line to generate unique ID
                                    start_time: currentStartTimeRef.current,
                                    end_time: endTimeStamp
                                });
                        
                                currentStartTimeRef.current = formatVideoTime(currentTime);
                                timestampDurationRef.current = 0;
                        }
                   }
               },
           });
           playerRef.current = player;
       };

       return () => {
           if (playerRef.current) {
               playerRef.current.destroy();
           }
           clearUpdateInterval(); 
       };
   }, [videoUrl]);

   return (
       <div className="aspect-video w-full">
           <div ref={playerContainerRef} />
       </div>
   );
};

export default YouTubePlayer;