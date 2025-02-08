// utils/subject.ts
import { useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";

export const getSubjectName = (subjectId: string): string | null => {
    const studyLibraryData = useStudyLibraryStore.getState().studyLibraryData;
    
    if (!studyLibraryData) return null;

    for (const level of studyLibraryData.level_with_details) {
        for (const subject of level.subjects) {
            if (subject.id === subjectId) {
                return subject.subject_name;
            }
        }
    }
    return null;
};