import { Card } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { MyButton } from "@/components/design-system/button";
import { PlayMode, StatusChip } from "@/components/design-system/chips";
import { assessmentTypes } from "@/types/assessment";
import { Assessment } from "@/types/assessment";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { restartAssessment } from "../-utils.ts/useFetchRestartAssessment";
import { storeAssessmentInfo } from "../-utils.ts/useFetchAssessment";
import { formatDuration } from "@/constants/helper";
import { toast } from "sonner";

interface AssessmentProps {
  assessmentInfo: Assessment;
  assessmentType: assessmentTypes;
}

const playModeColors: { [key: string]: string } = {
  EXAM: "bg-green-500 text-white",
  MOCK: "bg-purple-500 text-white",
  PRACTICE: "bg-blue-500 text-white",
  SURVEY: "bg-red-500 text-white",
};

export const AssessmentCard = ({
  assessmentInfo,
  assessmentType,
}: AssessmentProps) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showPopup]);

  const handleClosePopup = () => setShowPopup(false);
  const handleCloseRestartDialog = () => setShowRestartDialog(false);

  const handleOpen = () => {
    if (assessmentType === assessmentTypes.UPCOMING) {
      setShowPopup(true);
    }
  };

  const handleAction = async () => {
    // For LIVE or PREVIEW status
    if (
      assessmentInfo.recent_attempt_status === "PREVIEW" ||
      assessmentInfo.recent_attempt_status === "LIVE"
    ) {
      setShowRestartDialog(true);
      return;
    }

    // For ENDED status or null status
    if (
      assessmentInfo.recent_attempt_status === "ENDED" ||
      assessmentInfo.recent_attempt_status === null
    ) {
      const attemptsUsed =
        assessmentInfo.user_attempts !== 0
          ? assessmentInfo.user_attempts
          : (assessmentInfo.assessment_attempts ?? 0);
      const maxAttempts = assessmentInfo.created_attempts ?? 1;

      // If there are attempts left
      if ((attemptsUsed ?? 0) < maxAttempts) {
        storeAssessmentInfo(assessmentInfo);
        navigate({
          to: `/assessment/examination/${assessmentInfo.assessment_id}`,
        });
      } else {
        // No more attempts remaining
        return;
      }
    } else {
      // For any other status
      storeAssessmentInfo(assessmentInfo);
      navigate({
        to: `/assessment/examination/${assessmentInfo.assessment_id}`,
      });
    }
  };

  const handleRestartAssessment = async () => {
    setIsRestarting(true);
    try {
      await storeAssessmentInfo(assessmentInfo);

      const isRestarted = await restartAssessment(
        assessmentInfo.assessment_id,
        assessmentInfo.last_attempt_id ?? ""
      );
      console.log("assessmentInfo", assessmentInfo);

      console.log("Restart API Response:", isRestarted);

      if (isRestarted) {
        console.log(
          "Navigating to:",
          `/assessment/examination/${assessmentInfo.assessment_id}/LearnerLiveTest`
        );
        navigate({
          to: `/assessment/examination/${assessmentInfo.assessment_id}/LearnerLiveTest`,
          replace: true,
        });
        return; // Ensure no further execution
      } else {
        toast.error(
          "Failed to resume the assessment. Assessment already Ended."
        );
      }
    } catch (error) {
      console.error("Error in handleRestartAssessment:", error);
      toast.error("An error occurred while resuming the assessment.");
    }

    setIsRestarting(false);
    setShowRestartDialog(false);
  };

  const getButtonLabel = () => {
    if (
      ["LIVE", "PREVIEW"].includes(assessmentInfo?.recent_attempt_status ?? "")
    ) {
      return "Resume";
    }

    if (
      assessmentInfo.recent_attempt_status === "ENDED" ||
      assessmentInfo.recent_attempt_status === null
    ) {
      const attemptsUsed =
        assessmentInfo.user_attempts !== 0
          ? assessmentInfo.user_attempts
          : (assessmentInfo.assessment_attempts ?? 0);
      const maxAttempts = assessmentInfo.created_attempts ?? 1;

      if ((attemptsUsed ?? 0) < maxAttempts) {
        return "Join Assessment";
      } else {
        return "Ended";
      }
    }

    // Default
    return " Assessment";
  };

  // const getButtonLabel = () => {
  //   if (
  //     ["LIVE", "PREVIEW"].includes(assessmentInfo?.recent_attempt_status ?? "")
  //   ) {
  //     return "Resume";
  //   }

  //   if (
  //     assessmentInfo.recent_attempt_status === "ENDED" ||
  //     assessmentInfo.recent_attempt_status === null
  //   ) {
  //     const attemptsUsed =
  //       assessmentInfo.user_attempts ?? assessmentInfo.assessment_attempts ?? 0;

  //     const maxAttempts = assessmentInfo.created_attempts ?? 1;

  //     if (attemptsUsed < maxAttempts) {
  //       return "Join Assessment";
  //     } else {
  //       return "Ended";
  //     }
  //   }

  //   return "Join Assessment";
  // };

  return (
    <>
      <Card className="w-full p-6 space-y-6" onClick={handleOpen}>
        <h2 className="text-sm lg:text-base font-semibold">
          {assessmentInfo.name}
        </h2>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex gap-3 pb-3 items-center">
              <StatusChip
                playMode={assessmentInfo.play_mode as PlayMode}
                className={playModeColors[assessmentInfo.play_mode as PlayMode]}
              />
            </div>
            <div className="space-y-2 text-xs lg:text-sm text-gray-600">
              <div>
                Start Date and Time:{" "}
                {dayjs(assessmentInfo.bound_start_time).format(
                  "DD MMM YYYY, hh:mm A"
                )}
              </div>
              <div>
                End Date and Time:{" "}
                {dayjs(assessmentInfo.bound_end_time).format(
                  "DD MMM YYYY, hh:mm A"
                )}
              </div>
              <div>
                Duration: {formatDuration(assessmentInfo.duration * 60)}
              </div>
              <div>
                Attempts: {assessmentInfo.created_attempts ?? 0}/
                {assessmentInfo.user_attempts !== 0 &&
                assessmentInfo.user_attempts !== null
                  ? assessmentInfo.user_attempts
                  : (assessmentInfo.assessment_attempts ?? 0)}
              </div>
            </div>
          </div>
          {assessmentType !== assessmentTypes.UPCOMING &&
            assessmentType !== assessmentTypes.PAST && (
              <div className="w-full md:w-auto">
                <MyButton
                  buttonType="secondary"
                  className="w-full max-w-xs md:w-[200px] lg:w-[300px]"
                  onClick={handleAction}
                  disabled={assessmentInfo.recent_attempt_status === "ENDED"}
                >
                  {getButtonLabel()}
                </MyButton>
              </div>
            )}
        </div>
      </Card>

      {/* Pop-up for Upcoming Tests */}
      <AlertDialog open={showPopup} onOpenChange={handleClosePopup}>
        <AlertDialogOverlay
          className="bg-black/50"
          onClick={handleClosePopup}
        />
        <AlertDialogContent className="max-w-sm bg-[#FDFAF6] rounded-lg p-4 sm:mx-4 sm:p-6">
          <div className="text-gray-700">
            The assessment{" "}
            <span className="text-primary-500">{assessmentInfo.name}</span> is
            not live currently. You can appear for the assessment when it goes
            live.
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resume Confirmation Dialog */}
      <AlertDialog
        open={showRestartDialog}
        onOpenChange={handleCloseRestartDialog}
      >
        <AlertDialogOverlay className="bg-black/50" />
        <AlertDialogContent className="max-w-sm bg-white rounded-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Resume Assessment</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-gray-700">
            Would you like to continue the assessment from your last saved
            progress?
          </AlertDialogDescription>
          <AlertDialogFooter className="flex justify-end gap-3 mt-4">
            <MyButton buttonType="secondary" onClick={handleCloseRestartDialog}>
              Cancel
            </MyButton>
            <MyButton
              buttonType="primary"
              onClick={handleRestartAssessment}
              disabled={isRestarting}
            >
              {isRestarting ? "Proceeding..." : "Resume"}
            </MyButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
