import { EmptySubjectMaterial } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { SubjectCard } from "./subject-card";
import { useSidebar } from "@/components/ui/sidebar";
import { useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";


export const SubjectMaterial = () => {
    
    const {setNavHeading} = useNavHeadingStore();
    const {open} = useSidebar();
    const {studyLibraryData}  = useStudyLibraryStore();

    const heading = (
        <div className="flex items-center gap-2">
            <div>Subjects</div>
        </div>
    );
    
      useEffect(()=>{
        setNavHeading(heading)
      }, [])

    return(
        <div className=" w-full flex flex-col items-center justify-center">
            {!studyLibraryData?.length ? (
                <div className="flex w-full h-[70vh] flex-col items-center justify-center gap-8 rounded-lg">
                    <EmptySubjectMaterial />
                    <div>No subjects have been added yet.</div>
                </div>
            ) : (
                <div className={`grid grid-cols-2 ${open?"sm:grid-cols-2 md-tablets:grid-cols-3":"sm:grid-cols-3 md-tablets:grid-cols-4"} w-full gap-4 `}>
                    {studyLibraryData?.map((subject) => (
                        <SubjectCard
                            key={subject.id}
                            subject={subject}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}