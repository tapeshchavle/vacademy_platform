import { Card } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { MyButton } from "@/components/design-system/button";
import {
  StatusChip,
//   StatusMode,
//   StatusState,
} from "@/components/design-system/chips";
import { assessmentTypes } from "@/types/assessment";
import { Assessment } from "@/types/assessment";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";

interface AssessmentProps {
  assessmentInfo: Assessment;
  assessmentType: assessmentTypes;
}
// Card Component
export const AssessmentCard = ({
  assessmentInfo,
  assessmentType,
}: AssessmentProps) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showPopup]);

  const handleClose = () => {
    setShowPopup(false);
  };
  const handleOpen = () =>{
    if(assessmentType === assessmentTypes.UPCOMING){
        setShowPopup(true)
    }
  }

  const handleJoinAssessment = () => {
    navigate({ to: `/assessment/examination/${assessmentInfo.assessment_id}` });
  };

  return (
    <>
      <Card className="w-full p-6 space-y-6" onClick={() => handleOpen()}>
        <h2 className="text-sm lg:text-base font-semibold">
          {assessmentInfo.name}
        </h2>
        <div className="lg:flex md:flex justify-between items-center ">
          <div className="">
            <div className="flex gap-3 pb-3 items-center">
              <StatusChip mode={"ONLINE"} />
              {assessmentType === assessmentTypes.LIVE && (
                <div className="h-8 border-l border-gray-400"></div>
              )}
              {assessmentType === assessmentTypes.LIVE && (
                <StatusChip status={"PUBLISHED"} />
              )}
            </div>
            <div className="space-y-2 text-xs lg:text-sm text-gray-600">
              <div>Start Date and Time: {assessmentInfo.bound_start_time}</div>
              <div>End Date and Time: {assessmentInfo.bound_end_time}</div>
              {/* <div>Subject: {assessmentInfo.subject}</div> */}
              <div>Duration: {assessmentInfo.duration}</div>
            </div>
          </div>
          {assessmentType === assessmentTypes.LIVE && (
            <div className="sm:justify-center">
              <div className="pt-6 md:pt-14 lg:pt-24 sm:items-center">
                <MyButton
                  buttonType="secondary"
                  className="w-full max-w-xs md:w-[200px] lg:w-[300px]"
                  disabled={status.toLowerCase() !== "active"}
                  onClick={handleJoinAssessment}
                >
                  Join Assessment
                </MyButton>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="sm:max-w-[90%] md:max-w-[400px] lg:max-w-[500px]">
        <AlertDialog open={showPopup} onOpenChange={handleClose}>
          <AlertDialogOverlay className="bg-black/50" onClick={handleClose} />
          <AlertDialogContent className="max-w-sm bg-[#FDFAF6] rounded-lg p-4 sm:mx-4 sm:p-6 ">
            <div className="text-gray-700">
              The assessment{" "}
              <span className="text-orange-500">{assessmentInfo.name}</span> is
              not live currently. You can appear for the assessment when it goes
              live.
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};
