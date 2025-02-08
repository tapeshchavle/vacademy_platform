import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState, useRef, useCallback } from "react";
import ScheduleTestTabList from "./ScheduleTestTabList";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { assessmentTypes } from "@/types/assessment";
import { fetchAssessmentData } from "../-utils.ts/useFetchAssessment";
import { AssessmentCard } from "../-components/AssessmentCard";
import { EmptyScheduleTest } from "@/svgs";

export const ScheduleTestMainComponent = () => {
  const { setNavHeading } = useNavHeadingStore();
  const [selectedTab, setSelectedTab] = useState<assessmentTypes>(assessmentTypes.LIVE);
  const [assessmentData, setAssessmentData] = useState<{ [key in assessmentTypes]: any[] }>({
    [assessmentTypes.LIVE]: [],
    [assessmentTypes.UPCOMING]: [],
    [assessmentTypes.PAST]: [],
  });
  const [totalCounts, setTotalCounts] = useState<{ [key in assessmentTypes]: number }>({
    [assessmentTypes.LIVE]: 0,
    [assessmentTypes.UPCOMING]: 0,
    [assessmentTypes.PAST]: 0,
  });
  const [hasMorePages, setHasMorePages] = useState<{ [key in assessmentTypes]: boolean }>({
    [assessmentTypes.LIVE]: true,
    [assessmentTypes.UPCOMING]: true,
    [assessmentTypes.PAST]: true,
  });

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [page, setPage] = useState<{ [key in assessmentTypes]: number }>({
    [assessmentTypes.LIVE]: 0,
    [assessmentTypes.UPCOMING]: 0,
    [assessmentTypes.PAST]: 0,
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const pageSize = 5;
  const pullThreshold = 60;
  let startY = 0;

  useEffect(() => {
    setNavHeading("Assessment");
    fetchAllTabsData();
  }, []);

  const fetchAllTabsData = () => {
    Object.values(assessmentTypes).forEach((tab) => {
      fetchMoreData(tab, 0, true);
    });
  };

  const fetchMoreData = useCallback(
    (tab: assessmentTypes, pageNum: number, isInitialLoad = false) => {
      if (loading || (loadingMore && !isInitialLoad) || !hasMorePages[tab]) return;

      setLoading(isInitialLoad);
      setLoadingMore(!isInitialLoad);

      fetchAssessmentData(pageNum, pageSize, tab)
        .then((data) => {
          if (data.content.length === 0 || data.last) {
            setHasMorePages((prev) => ({ ...prev, [tab]: false }));
          }

          setAssessmentData((prevData) => ({
            ...prevData,
            [tab]: isInitialLoad ? data.content : [...prevData[tab], ...data.content],
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
        .finally(() => {
          setLoading(false);
          setLoadingMore(false);
        });
    },
    [loading, loadingMore, hasMorePages]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    startY = e.touches[0].clientY;
    setPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const distance = Math.max(currentY - startY, 0);
    setPullDistance(distance);
  };

  const handleTouchEnd = () => {
    if (pullDistance > pullThreshold) {
      refreshCurrentTab();
    }
    setPullDistance(0);
    setPulling(false);
  };

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
      <Tabs value={selectedTab} onValueChange={(tab) => setSelectedTab(tab as assessmentTypes)}>
        <ScheduleTestTabList selectedTab={selectedTab} totalAssessments={totalCounts} />

        {/* Pull-to-refresh UI */}
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateY(${pullDistance}px)`,
            transition: pulling ? "none" : "transform 0.2s ease-out",
          }}
        >
          {pullDistance > 20 && (
            <div className="absolute top-0 left-0 right-0 flex justify-center text-sm text-gray-500">
              {pullDistance > pullThreshold ? "Release to refresh" : "Pull to refresh..."}
            </div>
          )}

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
            {loadingMore && <div className="text-center py-4">Loading more...</div>}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
