import React from "react";
import { InstructionsProps } from "@/types/previewInstructionAssessment";
import { StatusCheck } from "@/components/design-system/chips";

export const AssessmentInstructions: React.FC<InstructionsProps> = ({
  instructions,
  duration,
  preview,
  canSwitchSections,
}) => {
  return (
    <>
      <div className="font-bold">Assessment Instructions</div>
      <div className="text-gray-700 whitespace-pre-line text-sm font-normal">
        {instructions}
      </div>
      <div className="mt-4 gap-4 text-sm font-bold">
        <div className="mb-4">
          Assessment Duration:
          <div className="flex items-center gap-2 font-normal">
        <div>Entire Assessment Duration</div>
        {duration}
          </div>
        </div>
        <div className="font-bold mb-4">Assessment Preview: <span className="font-normal">{preview}</span></div>
        <div className="flex items-center justify-between text-gray-600 font-normal mb-4">
          <div className="font-bold">Switch between sections: <span className="font-normal">{canSwitchSections ? "Yes" : "No"}</span></div>
          {canSwitchSections && <StatusCheck />}
        </div>
      </div>
    </>
  );
};
