import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  MagnifyingGlass,
  Bell,
  List,
} from "@phosphor-icons/react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { FiSidebar } from "react-icons/fi";


export function Navbar() {
  const notifications = true;
  const { navHeading } = useNavHeadingStore();

  return (
    <div className="flex h-[72px] items-center justify-between bg-neutral-50 p-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger>
          <FiSidebar className="text-neutral-600" />
        </SidebarTrigger>
        <div className="border-l border-neutral-500 px-3 text-subtitle font-body text-neutral-600">
          {navHeading}
        </div>
      </div>
      <div className="flex gap-3 text-neutral-600">
        <MagnifyingGlass className="size-5" />
        <Bell className="size-5" />
        {notifications && (
          <div className="absolute right-12 top-7 size-2 rounded-full bg-primary-500"></div>
        )}

        <List className="size-5" />
        
        {/* TODO: implement side nab bar */}
        {/* <AppSidebar /> */}
        {/* <SidebarTrigger>
        </SidebarTrigger> */}
        {/* <List className="text-neutral-600" /> */}
      </div>
    </div>
  );
}
