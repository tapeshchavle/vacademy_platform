import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect, useState } from "react";
import { fetchStaticData } from "./-lib/utils";
import { DashboardTabs } from "./-components/DashboardTabs";
import { Helmet } from "react-helmet";
import { DashboardImg } from "@/assets/svgs";
import { getPackageSessionId } from "@/utils/study-library/get-list-from-stores/getPackageSessionId";
import { fetchStudyLibraryDetails } from "@/services/study-library/getStudyLibraryDetails";
import { useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";
import { DashbaordResponse } from "./-types/dashboard-data-types";
import { MyButton } from "@/components/design-system/button";

export const Route = createFileRoute("/dashboard/")({
  component: () => (
    <LayoutContainer>
      <DashboardComponent />
    </LayoutContainer>
  ),
});

export function DashboardComponent() {
  const [username, setUsername] = useState<string | null>(null);
  const [assessmentCount, setAssessmentCount] = useState<number>();
  const { setNavHeading } = useNavHeadingStore();
  const navigate = useNavigate();
  const { studyLibraryData, setStudyLibraryData } = useStudyLibraryStore();
  const [dashboardData, setDashboardData] = useState<DashbaordResponse>();

  const handleGetStudyLibraryData = async () => {
    const PackageSessionId = await getPackageSessionId();
    const data = await fetchStudyLibraryDetails(PackageSessionId);
    setStudyLibraryData(data);
  }
  useEffect(() => {
    setNavHeading("Dashboard");
    fetchStaticData(setUsername, setAssessmentCount, setDashboardData);
    handleGetStudyLibraryData();
  }, []);

  useEffect(() => {
    console.log("dashboardData: ", dashboardData);
  }, [dashboardData]);
  
  return (
    <div>
      <Helmet>
        <title>Dashboard</title>
        <meta name="description" content="Dashboard page" />
      </Helmet>
      <div className="text-h3">
        <div>
          Hello <span className="text-primary-500">{username}!</span>
        </div>
        <div className="text-body mt-2">
          Excited to have you here! Let's dive into learning!
        </div>
      </div>
      <div className="my-6 w-fit mx-auto">
        <DashboardImg />
      </div>
      <div className="flex flex-col gap-6">
        <div
          onClick={() => {
            navigate({
              to: `/study-library/courses`,
            });
          }}
          className="cursor-pointer"
        >
          <DashboardTabs
            title={"Subjects"}
            count={studyLibraryData?.length}
            button={false}
          />
        </div>
        {/* TODO: implemnet resume feature after api is changed */}
        {/* <DashboardTabs
            title="Begin your journey"
            count={data?.slides.length}
            button={true}
            buttonText="Resume"
            list={data?.slides}
          /> */}
        
       <div className="p-4 w-full flex flex-col gap-4 rounded-lg border border-neutral-200 items-center">
          <p className="text-subtitle font-semibold">Continue where you left</p>
          <MyButton buttonType="secondary" className="w-fit">Resume</MyButton>
       </div>
        <div
          onClick={() => {
            navigate({
              to: `/assessment/examination`,
            });
          }}
          className="cursor-pointer"
        >
          <DashboardTabs
            title="Test Assigned"
            count={assessmentCount}
            button={false}
          />
        </div>
      </div>
    </div>
  );
}
