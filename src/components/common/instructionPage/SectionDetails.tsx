import React from "react";
import { Check } from "lucide-react";
import { SectionProps } from "@/types/previewInstructionAssessment";
import { StatusCheck } from "@/components/design-system/chips";

export const SectionDetails: React.FC<SectionProps> = ({ section }) => {
  return (
    <div className="w-full mb-4">
      <div className="space-y-6">
        <h2 className="text-orange-500 text-lg font-semibold">
          {section.subject}
        </h2>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <div className="font-semibold ">
              <p className="font-bold">Section Description:</p>
            </div>
            <div className="text-gray-700">{section.sectionDesc}</div>
          </div>

          <div className="text-sm text-gray-600">
            <div className="mb-4">
              <span className="font-bold">Section Duration: </span>
              <span className="text-gray-900">{section.assesmentDuration}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-bold">Negative Marking: </span>
                {section.negativeMarking.checked
                  ? section.negativeMarking.value
                  : "No"}
              </div>
              {section.cutoffMarking.checked && <StatusCheck />}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <p className="font-bold">Partial Marking</p>
              </div>
              {section.partialMarking && <StatusCheck />}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-bold">Cut off marks: </span>
                {section.cutoffMarking.checked
                  ? section.cutoffMarking.value
                  : "NA"}
              </div>
              {section.cutoffMarking.checked && <StatusCheck />}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-bold">Total Marks: </span>
                <span>{section.totalMark}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionDetails;