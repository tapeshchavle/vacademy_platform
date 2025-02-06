// stores/content-store.ts
import { create } from "zustand";
import { SidebarContentItem } from "@/types/study-library/chapter-sidebar";

// stores/content-store.ts
interface ContentStore {
    items: SidebarContentItem[];
    activeItemId: string | null;
    setActiveItem: (item: SidebarContentItem) => void;
}

const itemsDummyData: SidebarContentItem[] = [
    {
        id: "123",
        type: "pdf",
        name: "Human Eye",
        url: "",
        content:  "", 
        createdAt: new Date()
    },
    {
        id: "124",
        type: "video",
        name: "Refraction",
        url: "",
        content:  "", 
        createdAt: new Date()
    },
]

export const useContentStore = create<ContentStore>((set) => ({
    items: itemsDummyData,
    activeItemId: "123",
    setActiveItem: (item) => {
        set((state) => {
            const updatedItems = state.items.map((i) =>
                i.id === item.id ? { ...i, name: item.name } : i,
            );
            return { items: updatedItems, activeItemId: item.id }; // Set activeItemId here
        });
    }
}));
