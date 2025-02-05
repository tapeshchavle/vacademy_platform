import { SidebarTrigger } from "@/components/ui/sidebar";
// import { useState } from "react";
import { MagnifyingGlass, Bell, Sliders } from "@phosphor-icons/react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { FiSidebar } from "react-icons/fi";
import { useNavigate } from "@tanstack/react-router";

export function Navbar() {
  const notifications = true;
  const navigate = useNavigate();
  const { navHeading } = useNavHeadingStore();
  const navigateToNotificationsTab = () => {
    console.log("onclick");
    navigate({ to: "/dashboard/notifications" });
  };

  return (
    <div className="flex h-[72px] items-center justify-between bg-neutral-50 max-sm:px-4 px-8 py-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger>
          <FiSidebar className="text-neutral-600" />
        </SidebarTrigger>
        <div className="border-l border-neutral-500 px-4 sm max-sm:text-h3 text-h2 font-semibold text-neutral-600">
          {navHeading}
        </div>
      </div>
      <div className="flex gap-6 text-neutral-600">
        <MagnifyingGlass className="size-5" />
        <div className="relative" onClick={navigateToNotificationsTab}>
          <Bell className="size-5" />
          {notifications && (
            <div className="absolute right-0 top-0 size-2 rounded-full bg-primary-500"></div>
          )}
        </div>

        <Sliders className="size-5" />

        {/* TODO: implement side nab bar */}
        {/* <AppSidebar /> */}
        {/* <SidebarTrigger>
        </SidebarTrigger> */}
        {/* <List className="text-neutral-600" /> */}
      </div>
    </div>
  );
}
