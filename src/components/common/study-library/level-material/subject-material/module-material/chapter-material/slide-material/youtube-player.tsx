import React, { useEffect, useRef, useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTrackingStore } from "@/stores/study-library/youtube-video-tracking-store";
import { getEpochTimeInMillis } from "./utils";
import { convertTimeToSeconds } from "@/utils/study-library/tracking/convertTimeToSeconds";
import { formatVideoTime } from "@/utils/study-library/tracking/formatVideoTime";
import { calculateNetDuration } from "@/utils/study-library/tracking/calculateNetDuration";
import { useVideoSync } from "@/hooks/study-library/useVideoSync";
import YouTube, {
  YouTubeEvent,
  YouTubePlayer,
  YouTubeProps,
} from "react-youtube";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import {
  ArrowsOut,
  Check,
  FastForward,
  Pause,
  Play,
  Rewind,
} from "@phosphor-icons/react";
import { Preferences } from "@capacitor/preferences";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";

// Add the YouTube PlayerState enum to avoid window.YT references
enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

interface YouTubePlayerProps {
  videoId: string;
  videoTitle?: string;
}

export const YouTubePlayerComp: React.FC<YouTubePlayerProps> = ({
  videoId,
}) => {
  const {activeItem} = useContentStore();
  const { addActivity } = useTrackingStore();
  const activityId = useRef(uuidv4());
  const currentTimestamps = useRef<
    Array<{
      id: string;
      start_time: string;
      end_time: string;
      start: number;
      end: number;
    }>
  >([]);
  const videoStartTime = useRef<number>(0);
  const videoEndTime = useRef<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStartTimeRef = useRef("");
  const timestampDurationRef = useRef(0);
  const [isFirstPlay, setIsFirstPlay] = useState(true);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { syncVideoTrackingData } = useVideoSync();
  const currentStartTimeInEpochRef = useRef<number>(0);

  const [isPlayed, setIsPlayed] = useState(false);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [duration, setDuration] = useState(0);

  const [currentTime, setCurrentTime] = useState(0);
  const [minutesInput, setMinutesInput] = useState("");
  const [secondsInput, setSecondsInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCountdown, setVerificationCountdown] = useState(59);
  const [verificationNumbers, setVerificationNumbers] = useState<number[]>([]);
  const [verificationInterval] = useState(60); // Fixed 1 minute interval
  const [lastVerificationTime, setLastVerificationTime] = useState(0);
  const [responseTimesArray, setResponseTimesArray] = useState<number[]>([]);
  const [answeredTimeArray, setAnsweredTimeArray] = useState<number[]>([]);
  const verificationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to safely get a number from potentially a Promise<number>
  const safeGetNumber = async (value: any): Promise<number> => {
    if (value === undefined || value === null) return 0;
    if (typeof value === "number") return value;
    if (value instanceof Promise) {
      try {
        const resolved = await value;
        return typeof resolved === "number" ? resolved : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  };

  // Load saved verification time from Capacitor preferences
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load answered_time array
        const { value: answeredTimeValue } = await Preferences.get({
          key: "answered_time",
        });
        if (answeredTimeValue) {
          const savedAnsweredTime = JSON.parse(answeredTimeValue);
          setAnsweredTimeArray(savedAnsweredTime);
        }

        // Load last verification time
        const { value } = await Preferences.get({ key: "verification_time" });
        if (value) {
          const savedTime = Number.parseInt(value, 10);
          setLastVerificationTime(savedTime);
          console.log("lastVerificationTime", lastVerificationTime);
        }
      } catch (error) {
        console.error("Error loading saved verification data:", error);
      }
    };

    loadSavedData();
  }, []);

  // Save verification time to Capacitor preferences
  const saveVerificationTime = async (time: number) => {
    try {
      await Preferences.set({
        key: "verification_time",
        value: time.toString(),
      });
    } catch (error) {
      console.error("Error saving verification time:", error);
    }
  };

  // Save answered time array to Capacitor preferences
  const saveAnsweredTimeArray = async (times: number[]) => {
    try {
      await Preferences.set({
        key: "answered_time",
        value: JSON.stringify(times),
      });
    } catch (error) {
      console.error("Error saving answered time array:", error);
    }
  };

  // Generate verification numbers
  const generateVerificationNumbers = useCallback(() => {
    const correctNum = Math.floor(Math.random() * 100);
    let num1 = correctNum;
    let num2 = correctNum;

    // Ensure numbers are different from the correct one
    while (num1 === correctNum) {
      num1 = Math.floor(Math.random() * 100);
    }

    while (num2 === correctNum || num2 === num1) {
      num2 = Math.floor(Math.random() * 100);
    }

    // Set in a fixed order - correct number is always in the middle
    setVerificationNumbers([num1, correctNum, num2]);
  }, []);

  // Start the verification countdown timer
  const startVerificationTimer = useCallback(() => {
    if (verificationTimerRef.current) {
      clearInterval(verificationTimerRef.current);
    }

    setVerificationCountdown(59);

    verificationTimerRef.current = setInterval(() => {
      setVerificationCountdown((prev) => {
        if (prev <= 1) {
          // Time's up, pause the video
          if (player) {
            player.pauseVideo();
            setIsPlayed(false);
          }

          // Clear the timer
          if (verificationTimerRef.current) {
            clearInterval(verificationTimerRef.current);
            verificationTimerRef.current = null;
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [player]);

  // Handle verification number click
  const handleVerificationClick = (index: number) => {
    // Clear the verification timer
    if (verificationTimerRef.current) {
      clearInterval(verificationTimerRef.current);
      verificationTimerRef.current = null;
    }

    const responseTime = 59 - verificationCountdown;

    // Check if correct number was clicked (middle position, index 1)
    if (index === 1) {
      // Record verification time
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      setLastVerificationTime(currentTimeInSeconds);
      saveVerificationTime(currentTimeInSeconds);

      // Add response time to arrays
      const newResponseTimes = [...responseTimesArray, responseTime];
      setResponseTimesArray(newResponseTimes);

      const newAnsweredTimes = [...answeredTimeArray, responseTime];
      setAnsweredTimeArray(newAnsweredTimes);
      saveAnsweredTimeArray(newAnsweredTimes);

      // Hide verification
      setShowVerification(false);
    } else {
      // Wrong number clicked, pause the video
      if (player) {
        player.pauseVideo();
        setIsPlayed(false);
      }

      // Close the verification dialog
      setShowVerification(false);
    }
  };

  // Check if verification is needed based on elapsed time
  useEffect(() => {
    if (
      isPlayed &&
      elapsedTime > 0 &&
      elapsedTime % verificationInterval === 0
    ) {
      // Show verification without pausing the video
      setShowVerification(true);
      generateVerificationNumbers();
      startVerificationTimer();
    }
  }, [
    elapsedTime,
    verificationInterval,
    isPlayed,
    generateVerificationNumbers,
    startVerificationTimer,
  ]);

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
      setElapsedTime((prev) => prev + 1);
      timestampDurationRef.current += 1;
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start progress tracking interval when player is playing
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) return;
    progressIntervalRef.current = setInterval(async () => {
      if (player) {
        try {
          const time = await safeGetNumber(player.getCurrentTime());
          setCurrentTime(time);
        } catch (error) {
          console.error("Error getting current time for progress bar:", error);
        }
      }
    }, 250); // Update 4 times per second for smoother progress
  }, [player]);

  // Stop progress tracking interval
  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);
  // Pause video when tab is switched
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && player) {
        player.pauseVideo();
        setIsPlayed(false);
        console.log("Tab switched, video paused");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [player]);

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

  // Update current time periodically
  useEffect(() => {
    if (!player || !isPlayed) return;

    const updateTimeInterval = setInterval(async () => {
      try {
        const time = await safeGetNumber(player.getCurrentTime());
        setCurrentTime(time);
      } catch (error) {
        console.error("Error getting current time:", error);
      }
    }, 1000);

    return () => clearInterval(updateTimeInterval);
  }, [player, isPlayed, safeGetNumber]);

  // Activity tracking effect
  useEffect(() => {
    const endTime = videoEndTime.current || getEpochTimeInMillis();

    const newActivity = {
      slide_id: activeItem?.slide_id || "",
      activity_id: activityId.current,
      source: "YOUTUBE",
      source_id: videoId,
      start_time: videoStartTime.current,
      end_time: endTime,
      duration: elapsedTime.toString(),
      timestamps: currentTimestamps.current,
      percentage_watched: calculatePercentageWatched(duration),
      sync_status: "STALE" as const,
      current_start_time: currentStartTimeRef.current,
      current_start_time_in_epoch: currentStartTimeInEpochRef.current,
      answered_time: answeredTimeArray,
      new_activity: true,
    };
    addActivity(newActivity, true);
  }, [elapsedTime, duration, videoId, addActivity]);

  // Prevent right-click on the video
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const playerContainer = playerContainerRef.current;
    if (playerContainer) {
      playerContainer.addEventListener("contextmenu", handleContextMenu);
    }

    return () => {
      if (playerContainer) {
        playerContainer.removeEventListener("contextmenu", handleContextMenu);
      }
    };
  }, []);

  // Add CSS to hide YouTube elements when the video ends
  useEffect(() => {
    const handleVideoEnd = () => {
      // Add a style element to hide YouTube end screen elements
      const styleEl = document.createElement("style");
      styleEl.innerHTML = `
            .ytp-endscreen-content,
            .ytp-ce-element,
            .ytp-ce-covering-overlay,
            .ytp-ce-element-shadow,
            .ytp-ce-covering-image,
            .ytp-ce-expanding-image,
            .ytp-ce-element.ytp-ce-channel.ytp-ce-channel-this,
            .ytp-ce-element.ytp-ce-video.ytp-ce-element-show,
            .ytp-pause-overlay,
            .ytp-related-on-pause-container,
            .ytp-more-videos-overlay {
            display: none !important;
            }
        `;
      document.head.appendChild(styleEl);

      return () => {
        document.head.removeChild(styleEl);
      };
    };

    if (player) {
      handleVideoEnd();
    }

    return () => {
      const styleElements = document.querySelectorAll("style");
      styleElements.forEach((el) => {
        if (el.innerHTML.includes("ytp-endscreen-content")) {
          document.head.removeChild(el);
        }
      });
    };
  }, [player]);

  // Add an additional effect to handle iframe load and inject CSS
  useEffect(() => {
    if (!iframeRef.current) return;

    const injectCSS = () => {
      try {
        const iframe = iframeRef.current;
        if (!iframe) return;

        // Try to access iframe content
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDocument) return;

        // Create a style element
        const style = iframeDocument.createElement("style");
        style.textContent = `
            .ytp-chrome-top,
            .ytp-chrome-bottom,
            .ytp-watermark,
            .ytp-show-cards-title,
            .ytp-youtube-button,
            .ytp-embed-title,
            .ytp-embed-owner,
            .ytp-share-button,
            .ytp-watch-later-button,
            .ytp-more-videos-overlay,
            .ytp-pause-overlay,
            .ytp-related-on-pause-container,
            .ytp-endscreen-content,
            .ytp-ce-element {
                display: none !important;
            }
            `;

        // Append style to iframe head
        iframeDocument.head.appendChild(style);
      } catch (error) {
        console.error("Error injecting CSS into iframe:", error);
      }
    };

    // Try to inject CSS after iframe is loaded
    const iframe = iframeRef.current;
    iframe.addEventListener("load", injectCSS);

    // Also try immediately in case iframe is already loaded
    injectCSS();

    return () => {
      iframe.removeEventListener("load", injectCSS);
    };
  }, [iframeRef.current]);

  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      controls: 0, // Disable YouTube controls
      disablekb: 1, // Disable keyboard controls
      fs: 0, // Disable fullscreen button
      iv_load_policy: 3, // Disable annotations
      modestbranding: 1, // Hide YouTube logo
      rel: 0, // Don't show related videos
      // showinfo: 0, // Hide video title and uploader
      autoplay: 0, // Don't autoplay
      // cc_load_policy: 0, // Hide closed captions
      origin: window.location.origin, // Set origin for security
      enablejsapi: 1, // Enable JavaScript API
      playsinline: 1, // Play inline on iOS
      loop: 0, // Don't loop the video
      color: "white", // Use white progress bar
      hl: "en", // Set language to English
      start: 0, // Start from the beginning
      end: 0, // End at the natural end of the video
      // autohide: 1, // Hide controls after play begins
    },
  };

  const togglePause = () => {
    setIsPlayed(false);
    console.log("video is paused");
    if (player) player.pauseVideo();
  };

  const togglePlay = () => {
    setIsPlayed(true);
    console.log("Video is played");
    if (player) player.playVideo();
  };

  const onPlayerReady: YouTubeProps["onReady"] = async (
    event: YouTubeEvent
  ) => {
    console.log("Player ready");
    setPlayer(event.target);
    setPlayerReady(true);

    // Get the iframe element
    try {
      const iframe = await event.target.getIframe();
      iframeRef.current = iframe;

      // Try to hide YouTube elements by injecting CSS
      if (iframe) {
        try {
          const iframeDocument =
            iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDocument) {
            const style = iframeDocument.createElement("style");
            style.textContent = `
                    .ytp-chrome-top,
                    .ytp-chrome-bottom,
                    .ytp-watermark,
                    .ytp-show-cards-title,
                    .ytp-youtube-button,
                    .ytp-embed-title,
                    .ytp-embed-owner,
                    .ytp-share-button,
                    .ytp-watch-later-button,
                    .ytp-more-videos-overlay,
                    .ytp-pause-overlay,
                    .ytp-related-on-pause-container,
                    .ytp-endscreen-content,
                    .ytp-ce-element {
                      display: none !important;
                    }
                  `;
            iframeDocument.head.appendChild(style);
          }
        } catch (error) {
          console.error("Error accessing iframe content:", error);
        }
      }
    } catch (error) {
      console.error("Error getting iframe:", error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      console.log("fullscreen change", isFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Control video playback based on isPlayed state
  useEffect(() => {
    if (!player || !playerReady) return;

    try {
      if (isPlayed) {
        player.playVideo();
        startProgressTracking();
      } else {
        player.pauseVideo();
        stopProgressTracking();
      }
    } catch (error) {
      console.error("Error controlling video playback:", error);
    }
  }, [
    isPlayed,
    player,
    playerReady,
    startProgressTracking,
    stopProgressTracking,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearUpdateInterval();
      stopProgressTracking();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (verificationTimerRef.current) {
        clearInterval(verificationTimerRef.current);
      }
    };
  }, [clearUpdateInterval, stopProgressTracking]);

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
      setCurrentTime(currentTime); // Update state with current time
    } catch (error) {
      console.error("Error getting current time:", error);
    }

    if (event.data === PLAYING_STATE) {
      startTimer();
      startProgressTracking();

      if (!videoStartTime.current) {
        videoStartTime.current = now;
      }

      if (isFirstPlay) {
        console.log("integrate add video activity api now");
        syncVideoTrackingData();
        setIsFirstPlay(false);

        if (!updateIntervalRef.current) {
          updateIntervalRef.current = setInterval(
            () => {
              console.log("integrate update video activity api now");
              syncVideoTrackingData();
            },
            2 * 60 * 1000
          );
        }
      }

      currentStartTimeRef.current = formatVideoTime(currentTime);
      currentStartTimeInEpochRef.current =
        convertTimeToSeconds(currentStartTimeRef.current) * 1000;
      setIsPlayed(true);
      console.log("play state");
    } else if (event.data === PAUSED_STATE || event.data === ENDED_STATE) {
      stopTimer();
      stopProgressTracking();
      videoEndTime.current = now;

      const currentStartTimeInSeconds = convertTimeToSeconds(
        currentStartTimeRef.current
      );
      const endTimeInSeconds =
        currentStartTimeInSeconds + timestampDurationRef.current;
      const endTimeStamp = formatVideoTime(endTimeInSeconds);

      currentTimestamps.current.push({
        id: uuidv4(),
        start_time: currentStartTimeRef.current,
        end_time: endTimeStamp,
        start: convertTimeToSeconds(currentStartTimeRef.current) * 1000,
        end: convertTimeToSeconds(endTimeStamp) * 1000,
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
    if (value === "" || /^\d+$/.test(value)) {
      setter(value);
    }
  };

  const seekToTimestamp = async () => {
    if (!player || !playerReady) return;

    // Convert inputs to numbers
    const minutes = minutesInput === "" ? 0 : parseInt(minutesInput);
    const seconds = secondsInput === "" ? 0 : parseInt(secondsInput);

    // Calculate total seconds
    const totalSeconds = minutes * 60 + seconds;

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

      // Update currentTime state to reflect new position
      setCurrentTime(totalSeconds);

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

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Format time for display
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Handle progress bar click for seeking
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player || !playerReady || duration <= 0) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const seekTime = clickPosition * duration;

    player.seekTo(seekTime, true);
    setCurrentTime(seekTime);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Video player container with verification overlay */}
      <div
        ref={playerContainerRef}
        className="aspect-video w-full relative h-full items-center flex justify-center overflow-hidden"
      >
        {/* Verification overlay - positioned to work in fullscreen */}
        {showVerification && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-full max-w-xs z-[10000] animate-in fade-in slide-in-from-top duration-300">
            <div className="bg-yellow-50 border bg-primary-500 rounded-lg shadow-lg overflow-hidden">
              <div className="p-2">
                <div className="mt-1">
                  <p className="text-xs text-neutral-600">
                    Just ensuring that you are actively learning, please click
                    the number{" "}
                    <span className="text-primary-500">
                      {verificationNumbers[1]}
                    </span>{" "}
                    within{" "}
                    <span className="text-primary-500">
                      {verificationCountdown}{" "}
                    </span>
                    seconds.
                  </p>
                </div>
                <div className="mt-2 flex justify-center space-x-2">
                  {verificationNumbers.map((number, index) => (
                    <button
                      key={index}
                      onClick={() => handleVerificationClick(index)}
                      className="px-2 py-1 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-neutral-600 border-xl"
                    >
                      {number}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* YouTube player */}
        <div className="w-full h-full pointer-events-none">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onPlayerReady}
            className="h-full w-full"
            onStateChange={onStateChange}
          />
        </div>
      </div>

      {/* Video controls */}

      {/* Progress Bar */}
      <div className="w-full flex flex-col gap-1">
        <div
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
          onClick={handleProgressBarClick}
        >
          <div
            className="h-full bg-primary-500 rounded-full"
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex gap-2 justify-between items-center w-full">
        <div className="w-full flex gap-2 items-center justify-start">
          {isPlayed ? (
            <MyButton
              buttonType="secondary"
              scale="medium"
              layoutVariant="icon"
              onClick={togglePause}
              disable={!playerReady || !isPlayed}
            >
              <Pause />
            </MyButton>
          ) : (
            <MyButton
              buttonType="primary"
              scale="medium"
              layoutVariant="icon"
              onClick={togglePlay}
              disable={!playerReady || isPlayed}
            >
              <Play />
            </MyButton>
          )}

          <MyButton
            buttonType="secondary"
            scale="medium"
            layoutVariant="icon"
            onClick={() => {
              if (player) {
                safeGetNumber(player.getCurrentTime()).then((currentTime) => {
                  const newTime = currentTime - 10;
                  // If less than 10 seconds from start, go to beginning
                  player.seekTo(Math.max(newTime, 0), true);
                  setCurrentTime(Math.max(newTime, 0));
                });
              }
            }}
          >
            <Rewind />
          </MyButton>

          <MyButton
            buttonType="secondary"
            scale="medium"
            layoutVariant="icon"
            onClick={() => {
              if (player) {
                safeGetNumber(player.getCurrentTime()).then((currentTime) => {
                  const newTime = currentTime + 10;
                  safeGetNumber(player.getDuration()).then((duration) => {
                    // If less than 10 seconds from the end, go to end of video
                    player.seekTo(Math.min(newTime, duration), true);
                    setCurrentTime(Math.min(newTime, duration));
                  });
                });
              }
            }}
          >
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
