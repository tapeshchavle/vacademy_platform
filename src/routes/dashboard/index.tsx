import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect, useState } from "react";
import { CourseData } from "@/types/dashbaord/types";
import { fetchStaticData } from "./-lib/utils";
import { DashboardTabs } from "./-components/DashboardTabs";
import { Helmet } from "react-helmet";
import { DashboardImg } from "@/assets/svgs";
import { fetchStudentDetails } from "@/services/studentDetails";
import { getUserId } from "@/constants/getUserId";
import { getInstituteId } from "@/constants/helper";
import { Preferences } from "@capacitor/preferences";

// export const Route = createFileRoute("/dashboard/")({
//   component: () => (
//     <LayoutContainer>
//       <DashboardComponent />
//     </LayoutContainer>
//   ),
// });

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: async () => {
    const instituteId = await getInstituteId();
    const userId = await getUserId();
    if (!instituteId || !userId) {
      throw new Error("Institute ID or User ID is missing");
    }
    const response = await fetchStudentDetails(instituteId, userId);
    const studentDetails = response.data[0];
    await Preferences.set({
      key: "studentDetails",
      value: JSON.stringify(studentDetails),
    });
  },
  component: () => {
    // const { studentDetails } = Route.useLoaderData();

    return (
      <LayoutContainer>
        <DashboardComponent />
      </LayoutContainer>
    );
  },
});

export function DashboardComponent() {
  const [username, setUsername] = useState<string | null>(null);
  const [data, setData] = useState<CourseData>();
  const [assessmentCount, setAssessmentCount] = useState<number>();
  const { setNavHeading } = useNavHeadingStore();
  const navigate = useNavigate();
  useEffect(() => {
    setNavHeading("Dashboard");
    fetchStaticData(setUsername, setData, setAssessmentCount);
  }, []);
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
            title={"Courses"}
            count={data?.courses}
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
