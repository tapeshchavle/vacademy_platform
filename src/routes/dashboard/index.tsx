import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect, useState } from "react";
export const Route = createFileRoute("/dashboard/")({
  component: Dashboard,
});
import { dashboardImg } from "@/assets/svgs";
import { fetchStaticData } from "./-lib/utils";
import { DashboardTabs } from "./-components/DashboardTabs";

export function Dashboard() {
  const [username, setUsername] = useState<string | null>(null);
  const [data , setData] = useState();
  const { setNavHeading } = useNavHeadingStore();
  console.log(data)
  useEffect(() => {
    setNavHeading("Dashoard");
    fetchStaticData(setUsername, setData);
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
        <div className="my-6">
          <img className="m-auto" src={dashboardImg} alt="dashboard Image" />
        </div>
        <div className="flex flex-col gap-6">
          <DashboardTabs title="Courses" count={2} button={false} />
          <DashboardTabs
            title="Courses"
            count={2}
            button={true}
            buttonText="Resume"
            list={["The Human Eye: Structure and Function Explained"]}
          />
          <DashboardTabs title="Courses" count={2} button={false} />
        </div>
      </div>
    </LayoutContainer>
  );
}
