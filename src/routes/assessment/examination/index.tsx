import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { createFileRoute } from "@tanstack/react-router";
import { ScheduleTestMainComponent } from "./-components/ScheduleTestMainComponent";
import { Helmet } from "react-helmet";

export const Route = createFileRoute("/assessment/examination/")({
  component: () => (
    <LayoutContainer>
      <Helmet>
        <title>Assessment</title>
        <meta name="description" content="Assessment page" />
      </Helmet>
      <ScheduleTestMainComponent />
    </LayoutContainer>
  ),
});
