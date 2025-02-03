// import React from "react";
// import { AssessmentInstructions } from "@/components/common/instructionPage/AssessmentInstructions";
// import { SectionDetails } from "@/components/common/instructionPage/SectionDetails";
import AssessmentStartModal from "./StartAssessment";
// import Navbar from "@/components/common/instructionPage/AssessmentNavbar";
// import { Separator } from "@/components/ui/separator";

// Export interfaces so they can be imported by other components
export interface Section {
  id: string;
  title: string;
  duration?: number;
  questionCount?: number;
  description?: string;
  totalMarks?: number;
  passingMarks?: number;
}

export interface InstructionsProps {
  instructions: string;
  duration: number;
  preview: boolean;
  canSwitchSections: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  assessmentInstruction: string;
  assessmentDuration: number;
  assessmentPreview: boolean;
  canSwitchSections: boolean;
  sections: Section[];
}

export interface NavbarProps {
  title: string;
}

export interface SectionDetailsProps {
  section: Section;
}

export interface InstructionPageProps {
  assessment: Assessment;
}

const InstructionPage = () => {
  // Validate required props
  // if (!assessment || !assessment.sections) {
  //   return <div>Error: Assessment data is missing</div>;
  // }

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-0 w-full z-50">
        {/* <Navbar title={assessment.title} /> */}
      </div>
      
      <main className="pt-24 pb-16 p-4 lg:p-8 lg:pt-24 lg:pb-16">
        {/* <AssessmentInstructions
          instructions={assessment.assessmentInstruction}
          duration={assessment.assessmentDuration}
          preview={assessment.assessmentPreview}
          canSwitchSections={assessment.canSwitchSections}
        /> */}
        
        {/* {assessment.section_dtos.map((section: Section) => (
          <div key={section.id} className="section-container">
            <Separator orientation="horizontal" className="my-4" />
            <SectionDetails section={section} />
          </div>
        ))} */}
        
        <div className="fixed bottom-0 left-0 right-0 bg-white z-50">
          <div className="pb-4 px-4">
            <AssessmentStartModal />
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructionPage;