// utils/chapter.ts
import { useModulesWithChaptersStore } from "@/stores/study-library/use-modules-with-chapters-store";

export const getChapterName = (chapterId: string): string | null => {
    const modulesWithChaptersData = useModulesWithChaptersStore.getState().modulesWithChaptersData;
    
    if (!modulesWithChaptersData) return null;

    for (const module of modulesWithChaptersData) {
        for (const chapterWithSlides of module.chapters) {
            if (chapterWithSlides.chapter.id === chapterId) {
                return chapterWithSlides.chapter.chapter_name;
            }
        }
    }
    return null;
};