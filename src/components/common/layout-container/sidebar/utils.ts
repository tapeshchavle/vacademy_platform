import { SidebarItemsType } from "../../../../types/layout-container-types";
import { House, Users, BookOpen, Scroll } from "@phosphor-icons/react";

export const SidebarItemsData: SidebarItemsType[] = [
    {
        icon: House,
        title: "Dashboard",
        to: "/dashboard",
    },
    {
        icon: BookOpen,
        title: "Study Library",
        to: "/study-library",
    },
    {
        icon: Scroll,
        title: "Assessment Centre",
        subItems: [
            {
                subItem: "Examination",
                subItemLink: "/assessment/examination",
            },
            {
                subItem: "Mock Test",
                subItemLink: "/assessment/mock-test",
            },
            {
                subItem: "Practice Test",
                subItemLink: "/assessment/practice-test",
            },
            {
                subItem: "Survey",
                subItemLink: "/assessment/survey",
            },
            {
                subItem: "Reports",
                subItemLink: "/assessment/reports",
            },
            
        ],
    },
];
