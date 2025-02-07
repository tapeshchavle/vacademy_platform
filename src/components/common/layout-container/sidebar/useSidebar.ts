import { create } from "zustand";
import { sideBarStateType } from "../../../../types/layout-container-types";
import { Preferences } from "@capacitor/preferences";
import { getPublicUrl } from "@/services/upload_file";

interface StoreState {
  sideBarState: sideBarStateType;
  instituteName: string;
  instituteLogoFileUrl: string;
  setSideBarState: (sidebarstate: sideBarStateType) => void;
  fetchInstituteDetails: () => Promise<void>; 
}

const useStore = create<StoreState>((set) => ({
  sideBarState: sideBarStateType.DEFAULT,
  instituteName: "",
  instituteLogoFileUrl: "",
  setSideBarState: (sidebarstate) => set({ sideBarState: sidebarstate }),

  fetchInstituteDetails: async () => {
    try {
      const InstituteDetailsData = await Preferences.get({
        key: "InstituteDetails",
      });

      const InstituteDetails = InstituteDetailsData.value
        ? JSON.parse(InstituteDetailsData.value)
        : null;

      if (InstituteDetails) {
        const url = InstituteDetails.institute_logo_file_id
          ? await getPublicUrl(InstituteDetails.institute_logo_file_id)
          : "";

        set({
          instituteName: InstituteDetails.institute_name,
          instituteLogoFileUrl: url,
        });
      }
    } catch (error) {
      console.error("Error fetching institute details:", error);
    }
  },
}));

export default useStore;
