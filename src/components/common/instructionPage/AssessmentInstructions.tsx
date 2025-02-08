import { StatusCheck } from "@/components/design-system/chips";
import {parseHtmlToString} from "@/lib/utils"

interface AssessmentInstructionsProps {
  instructions: string;
  duration: number;
  preview: boolean;
  canSwitchSections: boolean;
}

export const AssessmentInstructions = ({
  instructions,
  duration,
  preview,
  canSwitchSections,
}: AssessmentInstructionsProps) => {
  return (
    <>
      <div className="font-bold">Assessment Instructions</div>
      <div className="text-gray-700 whitespace-pre-line text-sm font-normal">
        {parseHtmlToString(instructions)}
      </div>
      <div className="mt-4 gap-4 text-sm font-bold">
        <div className="mb-4">
          Assessment Duration:
          <div className="flex items-center gap-2 font-normal">
            <div>Entire Assessment Duration</div>
            <span>{duration}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-gray-600 font-normal mb-4">
          <div className="font-bold">
            Assessment Preview:{" "}
            <span className="font-normal">{preview ? "Yes" : "No"}</span>
          </div>
          {preview && <StatusCheck />}
        </div>
        <div className="flex items-center justify-between text-gray-600 font-normal mb-4">
          <div className="font-bold">
            Switch between sections:{" "}
            <span className="font-normal">
              {canSwitchSections ? "Yes" : "No"}
            </span>
          </div>
          {canSwitchSections && <StatusCheck />}
        </div>
      </div>
    </>
  );
};
