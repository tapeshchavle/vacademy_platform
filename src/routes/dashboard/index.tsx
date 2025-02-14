import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect, useState } from "react";
import { CourseData } from "@/types/dashbaord/types";
export const Route = createFileRoute("/dashboard/")({
  component: Dashboard,
});
import { DashboardImg } from "@/assets/svgs";
import { fetchStaticData } from "./-lib/utils";
import { DashboardTabs } from "./-components/DashboardTabs";

export function Dashboard() {
  const [username, setUsername] = useState<string | null>(null);
  const [data, setData] = useState<CourseData>();
  const [assessmentCount, setAssessmentCount] = useState<number>();
  const { setNavHeading } = useNavHeadingStore();
  useEffect(() => {
    setNavHeading("Dashoard");
    fetchStaticData(setUsername, setData, setAssessmentCount);
  }, []);
  return (
    <LayoutContainer>
      <div>
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
          <DashboardTabs
            title={"Courses"}
            count={data?.courses}
            button={false}
          />
          {/* TODO: implemnet resume feature after api is changed */}
          {/* <DashboardTabs
            title="Begin your journey"
            count={data?.slides.length}
            button={true}
            buttonText="Resume"
            list={data?.slides}
          /> */}
          <DashboardTabs
            title="Test Assigned"
            count={assessmentCount}
            button={false}
          />
        </div>
      </div>
    </LayoutContainer>
  );
}
