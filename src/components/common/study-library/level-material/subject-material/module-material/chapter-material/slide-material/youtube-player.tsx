import React, { useEffect, useRef, useCallback, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useTrackingStore } from "@/stores/study-library/youtube-video-tracking-store";
import { getISTTime } from "./utils";
import { convertTimeToSeconds } from "@/utils/study-library/tracking/convertTimeToSeconds";
import { formatVideoTime } from "@/utils/study-library/tracking/formatVideoTime";
import { calculateNetDuration } from "@/utils/study-library/tracking/calculateNetDuration";
import { extractVideoId } from "@/utils/study-library/tracking/extractVideoId";

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
        sync_status: 'STALE' as const, // Always set to STALE when updating
        current_start_time: currentStartTimeRef.current,
        new_activity: true
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