import React from "react";
import { AssessmentInstructions } from "@/components/common/instructionPage/AssessmentInstructions";
import { SectionDetails } from "@/components/common/instructionPage/SectionDetails";
import { Assessment } from "@/types/previewInstructionAssessment";
import AssessmentStartModal from "./StartAssessment";
import Navbar from "@/components/common/instructionPage/AssessmentNavbar";
import { Separator } from "@/components/ui/separator";

const InstructionPage: React.FC<{ assessment: Assessment; title: string }> = ({
  assessment,
  title, 
}) => {
  return (
    <>
      <div className="">
        <div className="fixed top-0 w-full z-50">
          <Navbar title={assessment.title} />
        </div>
        <div className="pt-24 pb-16 p-4 lg:p-8 lg:pt-24 lg:pb-16">
          {" "}
          {/* Add padding-top to account for the fixed navbar */}
          <AssessmentInstructions
            instructions={assessment.assessmentInstruction}
            duration={assessment.assessmentDuration}
            preview={assessment.assessmentPreview}
            canSwitchSections={assessment.canSwitchSections}
          />
          {assessment.sections.map((section, index) => (
            <div className="">

          <Separator orientation="horizontal" className="my-4 " />
            <SectionDetails key={index} section={section} />
            </div>
          ))}
          <div className="fixed bottom-0 bg-white w-full z-50">
            <div className="pb-4">
              <AssessmentStartModal />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructionPage;
