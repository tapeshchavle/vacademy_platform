import { EmptySubjectMaterial } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect, useState } from "react";
import { SubjectCard } from "./subject-card";
import { useSidebar } from "@/components/ui/sidebar";
import { useRouter } from "@tanstack/react-router";
import { CaretLeft } from "phosphor-react";
import { getCourseSubjects } from "@/utils/study-library/get-list-from-stores/getSubjects";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import { StudyLibrarySessionType, useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";
import { getLevelSessions } from "@/utils/study-library/get-list-from-stores/getSessionsForSubjects";


export const SubjectMaterial = () => {
    
    const {setNavHeading} = useNavHeadingStore();
    const {open} = useSidebar();
    const router = useRouter();
    const searchParams = router.state.location.search;
    const courseId: string = searchParams.courseId || "";
    const levelId: string = searchParams.levelId || "";

    const { selectedSession, setSelectedSession } = useSelectedSessionStore();

    const { studyLibraryData } = useStudyLibraryStore();

    const sessionList = courseId && levelId ? getLevelSessions(levelId) : [];
    const initialSession: StudyLibrarySessionType | undefined =
        selectedSession && sessionList.includes(selectedSession) ? selectedSession : sessionList[0];
    // const [currentSession, setCurrentSession] = useState<StudyLibrarySessionType | undefined>(
    //     initialSession,
    // );
    const currentSession = initialSession

    useEffect(() => {
        setSelectedSession(currentSession);
        const newSubjects = getCourseSubjects(courseId, currentSession?.id ?? "", levelId);
        setSubjects(newSubjects);
    }, [currentSession, studyLibraryData]);

   

    // const handleSessionChange = (value: string | StudyLibrarySessionType) => {
    //     if (typeof value !== "string" && value) {
    //         setCurrentSession(value);
    //     }
    // };

    const handleBackClick = () => {
        router.navigate({
            to: `/study-library/courses/levels`,
            search: {
                courseId: courseId
            }
        })
    };

    const initialSubjects = getCourseSubjects(courseId, currentSession?.id ?? "", levelId);
    const [subjects, setSubjects] = useState(initialSubjects);

    const heading = (
        <div className="flex items-center gap-2">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer size-5" />
            <div>Subjects</div>
        </div>
    );
    
      useEffect(()=>{
        setNavHeading(heading)
      }, [])

    return(
        <div className=" w-full flex flex-col items-center justify-center">
            {!subjects.length ? (
                <div className="flex w-full h-[70vh] flex-col items-center justify-center gap-8 rounded-lg">
                    <EmptySubjectMaterial />
                    <div>No subjects have been added yet.</div>
                </div>
            ) : (
                <div className={`grid grid-cols-2 ${open?"sm:grid-cols-2 md-tablets:grid-cols-3":"sm:grid-cols-3 md-tablets:grid-cols-4"} w-full gap-4 `}>
                    {subjects?.map((subject) => (
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