import { Tabs, TabsContent } from "@/components/ui/tabs";
// import { EmptyScheduleTest } from "@/svgs";
import { useEffect, useState } from "react";
import ScheduleTestTabList from "./ScheduleTestTabList";
// import { scheduleTestTabsData } from "@/constants/dummy-data";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
// import LiveAssessmentList from "./LiveAssessmentList";
// import dummyUpcomingList from "./upcomingAssessments";
import { assessmentTypes } from "@/types/assessment";
// import { useMutation } from "@tanstack/react-query";
import { fetchAssessmentData } from "../-utils.ts/useFetchAssessment";
import { Assessment } from "@/types/assessment";
import { AssessmentCard } from "../-components/AssessmentCard";
import { MyPagination } from "@/components/design-system/pagination";

export const ScheduleTestMainComponent = () => {
  const { setNavHeading } = useNavHeadingStore();
  const [loading, setLoading] = useState(true);
  // const [pageNo, setPageNo] = useState(0);
  const [liveAssessmentList, setLiveAssessmentList] = useState<Assessment[]>(
    []
  );
  const [currentLivePage, setCurrentLivePage] = useState(0);
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(0);
  const [currentPastPage, setCurrentPastPage] = useState(0);
  const [totalLivePage, setTotalLivePage] = useState(0);
  const [totalUpcomingPage, setTotalUpcomingPage] = useState(0);
  const [totalPastPage, setTotalPastPage] = useState(0);
  const [totalLiveAssessment, setTotalLiveAssessment] = useState(0);
  const [totalUpcomingAssessment, setTotalUpcomingAssessment] = useState(0);
  const [totalPastAssessment, setTotalPastAssessment] = useState(0);
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
  // const getFilteredData = useMutation({
  //   mutationFn: ({
  //     pageNo,
  //     pageSize,
  //     assessmentType,
  //   }: {
  //     pageNo: number;
  //     pageSize: number;
  //     assessmentType: assessmentTypes;
  //   }) => fetchAssessmentData(pageNo, pageSize, assessmentType),
  //   onSuccess: ({ data, assessmentType }) => {
  //     console.log(data, selectedTab);
  //     switch (assessmentType) {
  //       case assessmentTypes.LIVE:
  //         setLiveAssessmentList(data?.content);
  //         break;
  //       case assessmentTypes.UPCOMING:
  //         setUpcomingAssessmentList(data?.content);
  //         break;
  //       case assessmentTypes.PAST:
  //         console.log(data?.content);
  //         setPastAssessmentList(data?.content);
  //         break;
  //     }
  //   },
  //   onError: (error: unknown) => {
  //     throw error;
  //   },
  // });
  const handleTabChange = (value: string) => {
    setSelectedTab(value as assessmentTypes);
  };
  useEffect(() => {
    setNavHeading("Assessment");
  }, []);
  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      fetchAssessmentData(currentLivePage, pageSize, assessmentTypes.LIVE)
        .then((data) => {
          setLiveAssessmentList(data?.content);
          setTotalLivePage(data?.total_pages);
          setTotalLiveAssessment(data?.total_elements);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentLivePage]);
  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      fetchAssessmentData(
        currentUpcomingPage,
        pageSize,
        assessmentTypes.UPCOMING
      )
        .then((data) => {
          setUpcomingAssessmentList(data?.content);
          setTotalUpcomingPage(data?.total_pages);
          setTotalUpcomingAssessment(data?.total_elements);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentUpcomingPage]);
  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      fetchAssessmentData(currentPastPage, pageSize, assessmentTypes.PAST)
        .then((data) => {
          console.log(data);
          console.log(data?.content);
          setPastAssessmentList(data?.content);
          setTotalPastPage(data?.total_pages);
          setTotalPastAssessment(data?.total_elements);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentPastPage]);

  const totalAssessments = () => {
    switch (selectedTab) {
      case assessmentTypes.LIVE:
        return totalLiveAssessment;
        break;
        case assessmentTypes.UPCOMING:
          return totalUpcomingAssessment;
        break;
      case assessmentTypes.PAST:
        return totalPastAssessment;
        break;
    }
  };

  return (
    <>
      <div className="items-center gap-4 min-h-full">
        <Tabs value={selectedTab} onValueChange={handleTabChange}>
          <div className="items-center justify-center gap-5 pb-5">
            <div className="flex flex-wrap gap-5 pb-5">
              <ScheduleTestTabList
                selectedTab={selectedTab}
                totalAssessments={totalAssessments()}
              />
            </div>
          </div>
          <TabsContent
            key={assessmentTypes.LIVE}
            value={assessmentTypes.LIVE}
            className="rounded-xl bg-neutral-50 flex flex-col gap-3"
          >
            {liveAssessmentList &&
              liveAssessmentList.length > 0 &&
              liveAssessmentList.map((assessment, index) => {
                return (
                  <AssessmentCard
                    key={`${index}-${assessmentTypes.LIVE}`}
                    assessmentInfo={assessment}
                    assessmentType={assessmentTypes.LIVE}
                  />
                );
              })}
            {liveAssessmentList && liveAssessmentList.length > 0 && (
              <MyPagination
                currentPage={currentLivePage}
                totalPages={totalLivePage}
                onPageChange={setCurrentLivePage}
              ></MyPagination>
            )}
          </TabsContent>
          <TabsContent
            key={assessmentTypes.UPCOMING}
            value={assessmentTypes.UPCOMING}
            className="rounded-xl bg-neutral-50 flex flex-col gap-3"
          >
            {UpcomingAssessmentList &&
              UpcomingAssessmentList.length > 0 &&
              UpcomingAssessmentList.map((assessment, index) => {
                return (
                  <AssessmentCard
                    key={`${index}-${assessmentTypes.UPCOMING}`}
                    assessmentInfo={assessment}
                    assessmentType={assessmentTypes.UPCOMING}
                  />
                );
              })}
            {UpcomingAssessmentList && UpcomingAssessmentList.length > 0 && (
              <MyPagination
                currentPage={currentUpcomingPage}
                totalPages={totalUpcomingPage}
                onPageChange={setCurrentUpcomingPage}
              ></MyPagination>
            )}
          </TabsContent>
          <TabsContent
            key={assessmentTypes.PAST}
            value={assessmentTypes.PAST}
            className="rounded-xl bg-neutral-50 flex flex-col gap-3"
          >
            {PastAssessmentList &&
              PastAssessmentList.length > 0 &&
              PastAssessmentList.map((assessment, index) => {
                return (
                  <AssessmentCard
                    key={`${index}-${assessmentTypes.PAST}`}
                    assessmentInfo={assessment}
                    assessmentType={assessmentTypes.PAST}
                  />
                );
              })}
            {PastAssessmentList && PastAssessmentList.length > 0 && (
              <MyPagination
                currentPage={currentPastPage}
                totalPages={totalPastPage}
                onPageChange={setCurrentPastPage}
              ></MyPagination>
            )}
            {/* <div className="flex-1 items-end">Pagination will be hrere</div> */}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
