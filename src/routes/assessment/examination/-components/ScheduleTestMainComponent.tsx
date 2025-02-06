import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState, useRef, useCallback } from "react";
import ScheduleTestTabList from "./ScheduleTestTabList";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { assessmentTypes } from "@/types/assessment";
import { fetchAssessmentData } from "../-utils.ts/useFetchAssessment";
import { AssessmentCard } from "../-components/AssessmentCard";
import { EmptyScheduleTest } from "@/svgs";

// Define types for state variables
type AssessmentData = { [key in assessmentTypes]: any[] };
type TotalCounts = { [key in assessmentTypes]: number };
type Page = { [key in assessmentTypes]: number };
type HasMoreData = { [key in assessmentTypes]: boolean };

export const ScheduleTestMainComponent = () => {
  const { setNavHeading } = useNavHeadingStore();
  const [selectedTab, setSelectedTab] = useState<assessmentTypes>(assessmentTypes.LIVE);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    [assessmentTypes.LIVE]: [],
    [assessmentTypes.UPCOMING]: [],
    [assessmentTypes.PAST]: [],
  });
  const [totalCounts, setTotalCounts] = useState<TotalCounts>({
    [assessmentTypes.LIVE]: 0,
    [assessmentTypes.UPCOMING]: 0,
    [assessmentTypes.PAST]: 0,
  });
  const [page, setPage] = useState<Page>({
    [assessmentTypes.LIVE]: 0,
    [assessmentTypes.UPCOMING]: 0,
    [assessmentTypes.PAST]: 0,
  });
  const [loading, setLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState<HasMoreData>({
    [assessmentTypes.LIVE]: true,
    [assessmentTypes.UPCOMING]: true,
    [assessmentTypes.PAST]: true,
  });
  
  const observer = useRef<IntersectionObserver | null>(null); // Proper typing
  const pageSize = 5;

  useEffect(() => {
    setNavHeading("Assessment List");
  }, []);

  // Fetch data for all tabs initially (called only once)
  useEffect(() => {
    fetchAllTabsData();
  }, []);

  const fetchAllTabsData = () => {
    Object.values(assessmentTypes).forEach((tab) => {
      fetchMoreData(tab);  // Fetch data for each tab
    });
  };

  const fetchMoreData = useCallback((tab: assessmentTypes) => {
    if (loading || !hasMoreData[tab]) return;
    setLoading(true);
    fetchAssessmentData(page[tab], pageSize, tab)
      .then((data) => {
        if (data.content.length === 0) {
          setHasMoreData((prev) => ({ ...prev, [tab]: false }));
          return;
        }
        setAssessmentData((prevData) => ({
          ...prevData,
          [tab]: [
            ...prevData[tab],
            ...data.content.map((assessment) => ({
              ...assessment,
              status: assessment.recent_attempt_status,
            })),
          ],
        }));
        setTotalCounts((prevCounts) => ({
          ...prevCounts,
          [tab]: data.total_elements,
        }));
        setPage((prevPage) => ({
          ...prevPage,
          [tab]: prevPage[tab] + 1,
        }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [loading, page, hasMoreData]);

  const refreshData = () => {
    setAssessmentData({
      [assessmentTypes.LIVE]: [],
      [assessmentTypes.UPCOMING]: [],
      [assessmentTypes.PAST]: [],
    });
    setPage({
      [assessmentTypes.LIVE]: 0,
      [assessmentTypes.UPCOMING]: 0,
      [assessmentTypes.PAST]: 0,
    });
    setHasMoreData({
      [assessmentTypes.LIVE]: true,
      [assessmentTypes.UPCOMING]: true,
      [assessmentTypes.PAST]: true,
    });
    fetchAllTabsData();
  };

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => { // Typing the node parameter
      if (loading || !hasMoreData[selectedTab]) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreData(selectedTab);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMoreData, selectedTab]
  );

  return (
    <div className="items-center gap-4 min-h-full">
      <Tabs value={selectedTab} onValueChange={(tab: string) => setSelectedTab(tab as assessmentTypes)}>
        <ScheduleTestTabList
          selectedTab={selectedTab}
          totalAssessments={totalCounts}
          onRefresh={refreshData}
        />
        <TabsContent
          key={selectedTab}
          value={selectedTab}
          className="rounded-xl bg-neutral-50 flex flex-col gap-3"
        >
          {assessmentData[selectedTab].length > 0 ? (
            assessmentData[selectedTab].map((assessment, index) => {
              const actionButton =
                assessment.recent_attempt_status === "ENDED"
                  ? "Join Assessment"
                  : assessment.recent_attempt_status === "LIVE"
                  ? "Resume"
                  : "Upcoming";
              if (index === assessmentData[selectedTab].length - 1) {
                return (
                  <div ref={lastElementRef} key={assessment.assessment_id}>
                    <AssessmentCard
                      assessmentInfo={{ ...assessment, actionButton }}
                      assessmentType={selectedTab}
                    />
                  </div>
                );
              }
              return (
                <AssessmentCard
                  key={assessment.assessment_id}
                  assessmentInfo={{ ...assessment, actionButton }}
                  assessmentType={selectedTab}
                />
              );
            })
          ) : (
            <div className="flex h-screen flex-col items-center justify-center">
              <img src={EmptyScheduleTest} alt="No Tests Available" />
              <span className="text-neutral-600">No tests found.</span>
            </div>
          )}
          {loading && <div className="text-center py-4">Loading...</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
};
