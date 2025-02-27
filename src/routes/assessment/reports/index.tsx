import { createFileRoute } from "@tanstack/react-router";
import ReportPage from "./-components/reportMain";
import AssessmentReportList from "./-components/reportMain";
import InstructionPage from "@/components/common/instructionPage/InstructionPage";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";

export const Route = createFileRoute("/assessment/reports/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    // <ReportPage />
    <LayoutContainer>
      <AssessmentReportList />
    </LayoutContainer> 
    // <InstructionPage />
  );
}
