import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import {
  MagnifyingGlass,
  Bell,
  Sliders,
} from "@phosphor-icons/react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { FiSidebar } from "react-icons/fi";


export function Navbar() {
  const notifications = true;
  const { navHeading } = useNavHeadingStore();

  return (
    <div className="flex h-[72px] items-center justify-between bg-neutral-50 px-8 py-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger>
          <FiSidebar className="text-neutral-600" />
        </SidebarTrigger>
        <div className="border-l border-neutral-500 px-4 text-h2 font-semibold text-neutral-600">
          {navHeading}
        </div>
      </div>
      <div className="flex gap-6 text-neutral-600">
        <MagnifyingGlass className="size-5" />
        <Bell className="size-5" />
        {notifications && (
          <div className="absolute right-2 top-2 size-2 rounded-full bg-primary-500"></div>
        )}

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
