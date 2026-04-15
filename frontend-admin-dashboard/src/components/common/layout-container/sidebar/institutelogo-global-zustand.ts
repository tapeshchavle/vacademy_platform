import { create } from 'zustand';

export interface BrandingDisplaySettings {
    hideInstituteName: boolean;
    logoWidthPx: number | null;
    logoHeightPx: number | null;
}

interface InstituteStore {
    instituteLogo: string;
    brandingDisplay: BrandingDisplaySettings;
    setInstituteLogo: (logo: string) => void;
    setBrandingDisplay: (settings: Partial<BrandingDisplaySettings>) => void;
    resetInstituteLogo: () => void;
}

const defaultBrandingDisplay: BrandingDisplaySettings = {
    hideInstituteName: false,
    logoWidthPx: null,
    logoHeightPx: null,
};

const useInstituteLogoStore = create<InstituteStore>((set) => ({
    instituteLogo: '',
    brandingDisplay: { ...defaultBrandingDisplay },
    setInstituteLogo: (logo) => set({ instituteLogo: logo }),
    setBrandingDisplay: (settings) =>
        set((state) => ({
            brandingDisplay: { ...state.brandingDisplay, ...settings },
        })),
    resetInstituteLogo: () =>
        set({ instituteLogo: '', brandingDisplay: { ...defaultBrandingDisplay } }),
}));

export default useInstituteLogoStore;
