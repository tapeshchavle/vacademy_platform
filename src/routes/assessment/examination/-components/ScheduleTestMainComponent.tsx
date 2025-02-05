import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import ScheduleTestTabList from "./ScheduleTestTabList";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { assessmentTypes } from "@/types/assessment";
import { fetchAssessmentData } from "../-utils.ts/useFetchAssessment";
import { Assessment } from "@/types/assessment";
import { AssessmentCard } from "../-components/AssessmentCard";
import { MyPagination } from "@/components/design-system/pagination";
import { EmptyScheduleTest } from "@/svgs";

export const ScheduleTestMainComponent = () => {
  const { setNavHeading } = useNavHeadingStore();
  // const [loading, // setLoading] = useState(true);
  const [liveAssessmentList, setLiveAssessmentList] = useState<Assessment[]>(
    []
  );
  const [currentLivePage, setCurrentLivePage] = useState(0);
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(0);
  const [currentPastPage, setCurrentPastPage] = useState(0);
  const [totalLivePage, setTotalLivePage] = useState(0);
  const [totalUpcomingPage, setTotalUpcomingPage] = useState(0);
  const [totalPastPage, setTotalPastPage] = useState(0);
  const [UpcomingAssessmentList, setUpcomingAssessmentList] = useState<
    Assessment[]
  >([]);
  const [PastAssessmentList, setPastAssessmentList] = useState<Assessment[]>(
    []
  );
  const pageSize = 5;
  const [selectedTab, setSelectedTab] = useState<assessmentTypes>(
    assessmentTypes.LIVE
  );
  
  const handleTabChange = (value: string) => {
    setSelectedTab(value as assessmentTypes);
  };
  useEffect(() => {
    setNavHeading("Assessment");
  }, []);
  useEffect(() => {
    // setLoading(true);
    const timeoutId = setTimeout(() => {
      fetchAssessmentData(currentLivePage, pageSize, assessmentTypes.LIVE)
        .then((data) => {
          setLiveAssessmentList(data?.content);
          setTotalLivePage(data?.total_pages);
          // setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          // // setLoading(false);
        });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentLivePage]);
  useEffect(() => {
    // setLoading(true);
    const timeoutId = setTimeout(() => {
      fetchAssessmentData(
        currentUpcomingPage,
        pageSize,
        assessmentTypes.UPCOMING
      )
        .then((data) => {
          setUpcomingAssessmentList(data?.content);
          setTotalUpcomingPage(data?.total_pages);
          // setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          // setLoading(false);
        });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentUpcomingPage]);
  useEffect(() => {
    // setLoading(true);
    const timeoutId = setTimeout(() => {
      fetchAssessmentData(currentPastPage, pageSize, assessmentTypes.PAST)
        .then((data) => {
          setPastAssessmentList(data?.content);
          setTotalPastPage(data?.total_pages);
          // setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          // setLoading(false);
        });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentPastPage]);

  return (
    <>
      <div className="items-center gap-4 min-h-full">
        <Tabs value={selectedTab} onValueChange={handleTabChange}>
          <div className="items-center justify-center gap-5 pb-5">
            <div className="flex flex-wrap gap-5 pb-5">
              <ScheduleTestTabList selectedTab={selectedTab} totalAssessments={selectedTab.length} />
            </div>
          </div>
          <TabsContent
            key={assessmentTypes.LIVE}
            value={assessmentTypes.LIVE}
            className="rounded-xl bg-neutral-50 flex flex-col gap-3"
          >
            {liveAssessmentList && liveAssessmentList.length > 0 ? (
              <>
                {liveAssessmentList.map((assessment, index) => (
                  <AssessmentCard
                    key={`${index}-${assessmentTypes.LIVE}`}
                    assessmentInfo={assessment}
                    assessmentType={assessmentTypes.LIVE}
                  />
                ))}
                <MyPagination
                  currentPage={currentLivePage}
                  totalPages={totalLivePage}
                  onPageChange={setCurrentLivePage}
                />
              </>
            ) : (
              // Empty state when no live assessments are available
              <div className="flex h-screen flex-col items-center justify-center">
                <img src={EmptyScheduleTest} alt="No Live Tests Available" />
                <span className="text-neutral-600">
                  No tests are currently live.
                </span>
              </div>
            )}
          </TabsContent>

          <TabsContent
            key={assessmentTypes.UPCOMING}
            value={assessmentTypes.UPCOMING}
            className="rounded-xl bg-neutral-50 flex flex-col gap-3"
          >
            {UpcomingAssessmentList && UpcomingAssessmentList.length > 0 ? (
              <>
                {UpcomingAssessmentList.map((assessment, index) => (
                  <AssessmentCard
                    key={`${index}-${assessmentTypes.UPCOMING}`}
                    assessmentInfo={assessment}
                    assessmentType={assessmentTypes.UPCOMING}
                  />
                ))}
                <MyPagination
                  currentPage={currentUpcomingPage}
                  totalPages={totalUpcomingPage}
                  onPageChange={setCurrentUpcomingPage}
                />
              </>
            ) : (
              // Empty state when no data is available
              <div className="flex h-screen flex-col items-center justify-center">
                <img src={EmptyScheduleTest} alt="No Tests Available" />
                <span className="text-neutral-600">
                  No upcoming tests scheduled.
                </span>
              </div>
            )}
          </TabsContent>

          <TabsContent
            key={assessmentTypes.PAST}
            value={assessmentTypes.PAST}
            className="rounded-xl bg-neutral-50 flex flex-col gap-3"
          >
            {PastAssessmentList && PastAssessmentList.length > 0 ? (
              <>
                {PastAssessmentList.map((assessment, index) => (
                  <AssessmentCard
                    key={`${index}-${assessmentTypes.PAST}`}
                    assessmentInfo={assessment}
                    assessmentType={assessmentTypes.PAST}
                  />
                ))}
                <MyPagination
                  currentPage={currentPastPage}
                  totalPages={totalPastPage}
                  onPageChange={setCurrentPastPage}
                />
              </>
            ) : (
              // Empty state when no past assessments are available
              <div className="flex h-screen flex-col items-center justify-center">
                <img src={EmptyScheduleTest} alt="No Past Tests Available" />
                <span className="text-neutral-600">
                  No previous tests available.
                </span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
