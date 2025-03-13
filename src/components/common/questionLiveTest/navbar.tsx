"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HelpModal } from "@/components/modals/help-modals";
import { useAssessmentStore } from "@/stores/assessment-store";
import { SubmitModal } from "@/components/modals/submit-modal";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HelpCircle } from "lucide-react";
import { MyButton } from "@/components/design-system/button";
import { TimesUpModal } from "@/components/modals/times-up-modal";
import { ASSESSMENT_SUBMIT } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { Preferences } from "@capacitor/preferences";
import { toast } from "sonner";
import { Storage } from "@capacitor/storage";
import { useProctoring } from "@/hooks";
import { App } from "@capacitor/app";
import { PluginListenerHandle } from "@capacitor/core";
import { formatDataFromStore } from "./page";
// import { disableProtection } from "@/constants/helper";

export function Navbar() {
  const {
    assessment,
    submitAssessment,
    updateEntireTestTimer,
    tabSwitchCount,
    incrementTabSwitchCount,
    entireTestTimer,
    setEntireTestTimer,
  } = useAssessmentStore();

  const navigate = useNavigate();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimesUpModal, setShowTimesUpModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  interface HelpType {
    type: "instructions" | "alerts" | "reattempt" | "time" | null;
  }
  const { fullScreen } = useProctoring({
    forceFullScreen: true,
    preventTabSwitch: true,
    preventContextMenu: true,
    preventUserSelection: true,
    preventCopy: true,
  });

  const [helpType, setHelpType] = useState<HelpType["type"]>(null);

  const [playMode, setPlayMode] = useState<string | null>(null);

  const sendFormattedData = async () => {
    try {
      const state = useAssessmentStore.getState();
      const InstructionID_and_AboutID = await Preferences.get({
        key: "InstructionID_and_AboutID",
      });

      const assessment_id_json = InstructionID_and_AboutID.value
        ? JSON.parse(InstructionID_and_AboutID.value)
        : null;
      const formattedData = await formatDataFromStore(
        assessment_id_json?.assessment_id,
        "END"
      );
      const response = await authenticatedAxiosInstance.post(
        `${ASSESSMENT_SUBMIT}`,
        { json_content: JSON.stringify(formattedData) },
        {
          params: {
            attemptId: state.assessment?.attempt_id,
            assessmentId: assessment_id_json?.assessment_id,
          },
        }
      );

      if (response.data) {
        const { value } = await Storage.get({ key: "Assessment_questions" });

        if (value) {
          try {
            const parsedData = JSON.parse(value);
            const attemptId = parsedData?.attempt_id;

            if (attemptId) {
              const storageKey = `ASSESSMENT_STATE_${attemptId}`;
              await Storage.remove({ key: storageKey });
            } else {
              console.error("Attempt ID not found in Assessment_questions.");
            }
          } catch (error) {
            console.error("Error parsing Assessment_questions:", error);
          }
        } else {
          console.error("No data found in Assessment_questions.");
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  useEffect(() => {
    let backButtonListener: PluginListenerHandle | null = null;

    const setupBackButtonListener = async () => {
      backButtonListener = await App.addListener("backButton", () => {
        setShowSubmitModal(true);
        return false;
      });
    };

    setupBackButtonListener();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        incrementTabSwitchCount();
        setShowWarningModal(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const fetchPlayMode = async () => {
      const storedMode = await Preferences.get({
        key: "InstructionID_and_AboutID",
      });
      if (storedMode.value) {
        const parsedData = JSON.parse(storedMode.value);
        setPlayMode(parsedData.play_mode);
      }
    };

    fetchPlayMode();
  }, []);

  useEffect(() => {
    const updateEntireTimeLeft = () => {
      const { entireTestTimer } = useAssessmentStore.getState();
      setEntireTestTimer(entireTestTimer);
    };

    updateEntireTimeLeft();
    const timer = setInterval(() => {
      updateEntireTestTimer();
      updateEntireTimeLeft();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleWarningClose = () => {
    setShowWarningModal(false);
    if (tabSwitchCount >= 3) {
      handleSubmit();
    }
  };
  const formatTime = (timeInSeconds: number) => {
    // Calculate hours, minutes, and seconds directly from seconds
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    const padNumber = (num: number) => num.toString().padStart(2, "0");

    return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
  };

  if (!assessment) return null;

  const isAllTimeUp = entireTestTimer === 0;

  const handleSubmit = async () => {
    let attemptCount = 0;
    const state = useAssessmentStore.getState();
    const attemptId = state.assessment?.attempt_id;

    if (!attemptId) {
      console.error("Attempt ID is missing. Cannot proceed with submission.");
      toast.error("Submission failed: Attempt ID is missing.");
      return;
    }

    const submitData = async () => {
      const success = await sendFormattedData();
      if (!success && attemptCount < 5) {
        attemptCount++;
        const retryInterval = 10000 + attemptCount * 5000; // 10, 15, 20, 25, 30 seconds

        setTimeout(submitData, retryInterval);
        toast.error("Failed to submit assessment. Retrying...");
      } else if (success) {
        submitAssessment();
        toast.success("Assessment submitted successfully!");

        // disableProtection();

        navigate({
          to: "/assessment/examination",
          replace: true,
        });

        setTimeout(async () => {
          const { value } = await Storage.get({ key: "Assessment_questions" });

          if (value) {
            try {
              const parsedData = JSON.parse(value);
              const attemptId = parsedData?.attempt_id;

              if (attemptId) {
                const storageKey = `ASSESSMENT_STATE_${attemptId}`;

                // Remove from Capacitor Storage
                await Storage.remove({ key: storageKey });
                console.log(`${storageKey} removed from Capacitor Storage`);
              } else {
                console.error("Attempt ID not found in Assessment_questions.");
              }
            } catch (error) {
              console.error("Error parsing Assessment_questions:", error);
            }
          }
        }, 2000);
      }
    };

    submitData();
    // fullScreen.exit();
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  if (isAllTimeUp && !showTimesUpModal) {
    setShowTimesUpModal(true);
  }

  return (
    <>
      <div className="sticky top-0 z-50 flex bg-primary-50 h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setHelpType("instructions")}>
                Instructions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setHelpType("alerts")}>
                Assessment Alerts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setHelpType("reattempt")}>
                Request Reattempt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setHelpType("time")}>
                Request Time Increase
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="">
          {entireTestTimer && (
            <div className="flex items-center gap-2 text-lg  justify-center">
              <div className="flex items-center space-x-4">
                {playMode !== "PRACTICE" &&
                  playMode !== "SURVEY" &&
                  entireTestTimer && (
                    <div className="flex items-center gap-2 text-lg justify-center">
                      <div className="flex items-center space-x-4">
                        {formatTime(entireTestTimer)
                          .split(":")
                          .map((time, index, array) => (
                            <div
                              key={index}
                              className="relative flex items-center"
                            >
                              <span className="border border-gray-400 px-2 py-1 rounded">
                                {time}
                              </span>
                              {index < array.length - 1 && (
                                <span className="absolute right-[-10px] text-lg">
                                  :
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <MyButton
            type="submit"
            scale="medium"
            buttonType="primary"
            layoutVariant="default"
            onClick={() => setShowSubmitModal(true)}
          >
            Submit
          </MyButton>
        </div>
      </div>

      <SubmitModal
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        onConfirm={handleSubmit}
      />

      <TimesUpModal
        open={showTimesUpModal}
        onOpenChange={setShowTimesUpModal}
        onFinish={handleSubmit}
      />

      <AlertDialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <AlertDialogContent>
          <AlertDialogDescription>
            Warning: You are attempting to leave the test environment. This is
            warning {tabSwitchCount} of 3. If you attempt to leave again, your
            test will be automatically submitted.
          </AlertDialogDescription>
          <AlertDialogAction
            onClick={() => {
              fullScreen.trigger();
              setTimeout(() => {
                handleWarningClose();
              }, 100);
            }}
          >
            Return to Test
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
      {/* <AlertDialog open={true} modal={true}>
        <AlertDialogContent>
          <AlertDialogDescription>
            Warning: You are attempting to leave the test environment. This is
            warning {tabSwitchCount} of 3. If you attempt to leave again, your
            test will be automatically submitted.
          </AlertDialogDescription>
          <AlertDialogAction
            onClick={() => {
              fullScreen.trigger();
              setTimeout(() => {
                handleWarningClose();
              }, 100);
            }}
          >
            Return to Test
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog> */}

      <HelpModal
        open={helpType !== null}
        onOpenChange={(open) => !open && setHelpType(null)}
        type={helpType || "instructions"}
      />
    </>
  );
}
