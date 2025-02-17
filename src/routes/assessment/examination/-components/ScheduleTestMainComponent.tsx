import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState, useRef, useCallback } from "react";
import ScheduleTestTabList from "./ScheduleTestTabList";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { assessmentTypes } from "@/types/assessment";
import { fetchAssessmentData } from "../-utils.ts/useFetchAssessment";
import { AssessmentCard } from "../-components/AssessmentCard";
import { EmptyScheduleTest } from "@/svgs";
import { PrivacyScreen } from "@capacitor-community/privacy-screen";

export const ScheduleTestMainComponent = () => {
    const disableProtection = async () => {
    await PrivacyScreen.disable();
  };
  const { setNavHeading } = useNavHeadingStore();
  const [selectedTab, setSelectedTab] = useState<assessmentTypes>(
    assessmentTypes.LIVE
  );
  const [assessmentData, setAssessmentData] = useState<{
    [key in assessmentTypes]: any[];
  }>({
    [assessmentTypes.LIVE]: [],
    [assessmentTypes.UPCOMING]: [],
    [assessmentTypes.PAST]: [],
  });
  const [totalCounts, setTotalCounts] = useState<{
    [key in assessmentTypes]: number;
  }>({
    [assessmentTypes.LIVE]: 0,
    [assessmentTypes.UPCOMING]: 0,
    [assessmentTypes.PAST]: 0,
  });
  const [hasMorePages, setHasMorePages] = useState<{
    [key in assessmentTypes]: boolean;
  }>({
    [assessmentTypes.LIVE]: true,
    [assessmentTypes.UPCOMING]: true,
    [assessmentTypes.PAST]: true,
  });

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState<{ [key in assessmentTypes]: number }>({
    [assessmentTypes.LIVE]: 0,
    [assessmentTypes.UPCOMING]: 0,
    [assessmentTypes.PAST]: 0,
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const pageSize = 5;

  useEffect(() => {
    setNavHeading("Assessment");
    disableProtection();
    fetchAllTabsData();
  }, []);

  const fetchAllTabsData = () => {
    Object.values(assessmentTypes).forEach((tab) => {
      fetchMoreData(tab, 0, true);
    });
  };

  const fetchMoreData = useCallback(
    async (tab: assessmentTypes, pageNum: number, isInitialLoad = false) => {
      if (loading || (loadingMore && !isInitialLoad) || !hasMorePages[tab])
        return;

      setLoading(isInitialLoad);
      setLoadingMore(!isInitialLoad);

      try {
        const data = await fetchAssessmentData(pageNum, pageSize, tab);

        setAssessmentData((prevData) => ({
          ...prevData,
          [tab]: isInitialLoad
            ? data.content
            : [...prevData[tab], ...data.content],
        }));

        setTotalCounts((prevCounts) => ({
          ...prevCounts,
          [tab]: data.total_elements,
        }));

        setHasMorePages((prev) => ({
          ...prev,
          [tab]: !data.last,
        }));

        setPage((prevPage) => ({
          ...prevPage,
          [tab]: pageNum + 1,
        }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [loading, loadingMore, hasMorePages]
  );

  const refreshCurrentTab = useCallback(() => {
    setAssessmentData((prevData) => ({
      ...prevData,
      [selectedTab]: [],
    }));
    setPage((prevPage) => ({
      ...prevPage,
      [selectedTab]: 0,
    }));
    setHasMorePages((prev) => ({ ...prev, [selectedTab]: true }));
    fetchMoreData(selectedTab, 0, true);
  }, [selectedTab]);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore || !hasMorePages[selectedTab]) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreData(selectedTab, page[selectedTab]);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, selectedTab, page, hasMorePages]
  );

  return (
    <div className="items-center gap-4 min-h-full">
      <Tabs
        value={selectedTab}
        onValueChange={(tab) => {
          setSelectedTab(tab as assessmentTypes);
          refreshCurrentTab();
        }}
      >
        <ScheduleTestTabList
          selectedTab={selectedTab}
          totalAssessments={totalCounts}
        />

        <TabsContent
          key={selectedTab}
          value={selectedTab}
          className="rounded-xl bg-neutral-50 flex flex-col gap-3"
        >
          {assessmentData[selectedTab].length > 0 ? (
            assessmentData[selectedTab].map((assessment, index) => {
              if (index === assessmentData[selectedTab].length - 1) {
                return (
                  <div ref={lastElementRef} key={assessment.assessment_id}>
                    <AssessmentCard
                      assessmentInfo={assessment}
                      assessmentType={selectedTab}
                    />
                  </div>
                );
              }
              return (
                <AssessmentCard
                  key={assessment.assessment_id}
                  assessmentInfo={assessment}
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
          {loadingMore && (
            <div className="text-center py-4">Loading more...</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
