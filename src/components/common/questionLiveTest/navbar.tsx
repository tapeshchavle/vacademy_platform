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

  const [helpType, setHelpType] = useState<HelpType["type"]>(null);

  const formatDataFromStore = (assessment_id: string) => {
    console.log("here   ");
    const state = useAssessmentStore.getState();
    console.log(state);
    return {
      attemptId: state.assessment?.attempt_id,
      clientLastSync: new Date().toISOString(),
      assessment: {
        assessmentId: assessment_id,
        entireTestDurationLeftInSeconds: state.entireTestTimer,
        timeElapsedInSeconds: 0,
        status: "END",
        tabSwitchCount: state.tabSwitchCount || 0,
      },
      sections: state.assessment?.section_dtos?.map((section, idx) => ({
        sectionId: section.id,
        timeElapsedInSeconds: state.sectionTimers?.[idx].timeLeft || 0,
        questions: section.question_preview_dto_list?.map((question, qidx) => ({
          questionId: question.question_id,
          questionDurationLeftInSeconds: state.questionTimers?.[qidx] || 0,
          timeTakenInSeconds: 0,
          responseData: {
            type: question.question_type,
            optionIds: state.answers?.[question.question_id] || [],
          },
        })),
      })),
    };
  };

  const sendFormattedData = async () => {
    try {
      const state = useAssessmentStore.getState();
      const InstructionID_and_AboutID = await Preferences.get({
        key: "InstructionID_and_AboutID",
      });

      const assessment_id_json = InstructionID_and_AboutID.value
        ? JSON.parse(InstructionID_and_AboutID.value)
        : null;
      const formattedData = formatDataFromStore(
        assessment_id_json?.assessment_id
      );
      console.log("Formatted Data:", formattedData);
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
      console.log(response.data);

      // Save announcements in local storage
      await Preferences.set({
        key: "announcements",
        value: JSON.stringify(response.data),
      });

      return response.data;
    } catch (error) {
      console.error("Error sending data:", error);
      // throw error;
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // setWarningCount((prev) => prev + 1);
        incrementTabSwitchCount();
        setShowWarningModal(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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

  const formatTime = (timeInSeconds: number) => {
    // Calculate hours, minutes, and seconds directly from seconds
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    // Pad with zeros if needed
    const padNumber = (num: number) => num.toString().padStart(2, "0");

    return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
  };

  if (!assessment) return null;

  const isAllTimeUp = entireTestTimer === 0;

  const handleSubmit = async () => {
    let attemptCount = 0;
    const submitData = async () => {
      const success = await sendFormattedData();
      if (!success && attemptCount < 5) {
        attemptCount++;
        const retryInterval = 10000 + attemptCount * 5000; // 10, 15, 20, 25, 30 seconds
        console.log(`Retrying data submission in ${retryInterval / 1000} seconds...`);
        setTimeout(submitData, retryInterval);
        toast.error("Failed to submit assessment. retrying...");
      } else if (success) {
        console.log("Data submitted successfully!");
        submitAssessment();
        // Show success toast
        toast.success("Data submitted successfully!");
        navigate({
          to: "/assessment/examination",
        });
      }
    };

    submitData();
  };

  if (isAllTimeUp && !showTimesUpModal) {
    setShowTimesUpModal(true);
  }

  const handleWarningClose = () => {
    setShowWarningModal(false);
    if (tabSwitchCount >= 3) {
      handleSubmit();
    }
  };

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
              <div className="flex items-center space-x-1">
                {formatTime(entireTestTimer)
                  .split(":")
                  .map((time, index, array) => (
                    <div key={index} className="relative flex items-center">
                      <span className="border border-gray-400 px-2 py-1 rounded">
                        {time}
                      </span>
                      {index < array.length - 1 && (
                        <span className="absolute right-[-4px] text-lg">:</span>
                      )}
                    </div>
                  ))}
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
          <AlertDialogAction onClick={handleWarningClose}>
            Return to Test
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <HelpModal
        open={helpType !== null}
        onOpenChange={(open) => !open && setHelpType(null)}
        type={helpType || "instructions"}
      />
    </>
  );
}
