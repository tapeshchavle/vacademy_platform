import { create } from "zustand";

interface navHeadingState {
    navHeading: string;
    setNavHeading: (newNavHeading: string) => void;
}

export const useNavHeadingStore = create<navHeadingState>((set: (partial: Partial<navHeadingState>) => void) => ({
    navHeading: "",
    setNavHeading: (newNavHeading: string) => set({ navHeading: newNavHeading }),
}));
