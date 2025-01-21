import { Helmet } from "react-helmet";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { EmptyScheduleTest } from "@/svgs";
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { ScheduleTestFilters } from "./ScheduleTestFilters";
import { useFilterDataForAssesment } from "../../examination/-utils.ts/useFiltersData";
import { ScheduleTestSearchComponent } from "./ScheduleTestSearchComponent";
// import { MyFilterOption } from "@/types/my-filter";
import { ScheduleTestHeaderDescription } from "./ScheduleTestHeaderDescription";
import ScheduleTestTabList from "./ScheduleTestTabList";
import ScheduleTestFilterButtons from "./ScheduleTestFilterButtons";
import { scheduleTestTabsData } from "@/constants/dummy-data";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import LiveAssessmentList from "./LiveAssessmentList";
import UpcomingAssessmentList from "./upcomingAssessments";
import { useSidebar } from "@/components/ui/sidebar";

export const ScheduleTestMainComponent = () => {
  const { setNavHeading } = useNavHeadingStore();
  const [selectedTab, setSelectedTab] = useState("liveTests");

  useEffect(() => {
    setNavHeading("Assessment");
  }, []);


  const { open } = useSidebar();
  return (
    <>
      {/* <ScheduleTestHeaderDescription /> */}
      <div className="items-center gap-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="items-center justify-center gap-5 pb-5">
            <div className="flex flex-wrap gap-5 pb-5">
              <ScheduleTestTabList selectedTab={selectedTab} />
            </div>
            
          </div>
          {scheduleTestTabsData.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="rounded-xl bg-neutral-50"
            >
              {tab.value === "liveTests" ? (
                // Render Live Tests data
                <LiveAssessmentList />
              ) : tab.value === "upcomingTests" ? (
                <UpcomingAssessmentList />
              ) : (
                // Render empty state for other tabs or when no data is available
                <div className="flex h-screen flex-col items-center justify-center">
                  <img src={EmptyScheduleTest} alt="No Tests Available" />
                  <span className="text-neutral-600">{tab.message}</span>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
};
