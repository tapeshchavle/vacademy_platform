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
   const videoStartTime = useRef<string>('');
   const videoEndTime = useRef<string>('');
   const [elapsedTime, setElapsedTime] = useState(0);
   const timerRef = useRef<NodeJS.Timeout | null>(null);
   const currentStartTimeRef = useRef('');
//    const [timestampDuration, setTimestampDuration] = useState(0);
   const timestampDurationRef = useRef(0);

   const extractVideoId = (url: string): string => {
       const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
       const match = url.match(regExp);
       return (match && match[2] && match[2].length === 11) ? match[2] : "";
   };

   const calculatePercentageWatched = (totalDuration: number) => {
       const watchedDuration = elapsedTime;
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

   useEffect(() => {
       const videoId = extractVideoId(videoUrl);
       const endTime = videoEndTime.current || new Date().toISOString();
       
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
           sync_status: 'STALE' as const
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
                       const now = new Date().toISOString();
                       const currentTime = player.getCurrentTime();

                       
                       if (event.data === window.YT.PlayerState.PLAYING) {
                           startTimer();
                           
                           if (!videoStartTime.current) {
                               videoStartTime.current = now;
                            }
                            currentStartTimeRef.current = formatVideoTime(currentTime);
                            console.log("play state")
                            
                        } else if (event.data === window.YT.PlayerState.PAUSED || 
                            event.data === window.YT.PlayerState.ENDED) {
                                stopTimer();
                                videoEndTime.current = now;

                                const currentStartTimeInSeconds = convertTimeToSeconds(currentStartTimeRef.current);
                                const endTimeInSeconds = currentStartTimeInSeconds+timestampDurationRef.current
                                const endTimeStamp = formatVideoTime(endTimeInSeconds);

                                console.log("currentStartTime: ", currentStartTimeRef.current); 
                                console.log("end time formatted: ",  endTimeStamp);
                                // console.log("wrong end time: ", formatVideoTime(currentTime));

                                currentTimestamps.current.push({
                                    start: currentStartTimeRef.current,
                                    end: endTimeStamp
                                });
                            // setTimestampDuration(0);
                            currentStartTimeRef.current = formatVideoTime(currentTime);
                            console.log("updated start time: ", currentStartTimeRef.current )
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
       };
   }, [videoUrl]);

   useEffect(() => {
       return () => {
           stopTimer();
       };
   }, [stopTimer]);

   return (
       <div className="aspect-video w-full">
           <div ref={playerContainerRef} />
       </div>
   );
};

export default YouTubePlayer;