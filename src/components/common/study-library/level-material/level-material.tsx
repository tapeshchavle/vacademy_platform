import { EmptySubjectMaterial } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { LevelCard } from "./level-card";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { CaretLeft } from "phosphor-react";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import { getCourseSessions } from "@/utils/study-library/get-list-from-stores/getSessionsForLevels";
import { StudyLibrarySessionType } from "@/stores/study-library/use-study-library-store";
import { getCourseLevels } from "@/utils/study-library/get-list-from-stores/getLevelWithDetails";



export const LevelMaterial = () => {

    const { open } = useSidebar();
    const router = useRouter();
    const searchParams = router.state.location.search;
    const courseId = searchParams.courseId;
    const { setSelectedSession } = useSelectedSessionStore();
    const {setNavHeading} = useNavHeadingStore();
    const navigate = useNavigate();

    // Ensure hooks always run
    const sessionList = courseId ? getCourseSessions(courseId) : [];
    const initialSession: StudyLibrarySessionType | undefined = sessionList[0] ?? undefined;

    // const [currentSession, setCurrentSession] = useState<StudyLibrarySessionType | undefined>(
    //     () => initialSession,
    // );
    const currentSession = initialSession;

    // Get levels only if session is selected
    const initialLevelList = currentSession ? getCourseLevels(courseId!, currentSession.id) : [];

    const [levelList, setLevelList] = useState(initialLevelList);

    // const handleSessionChange = (value: string | StudyLibrarySessionType) => {
    //     if (typeof value !== "string" && value) {
    //         setCurrentSession(value);
    //     }
    // };


    useEffect(() => {
        setSelectedSession(currentSession);
        const newLevelList = currentSession ? getCourseLevels(courseId!, currentSession.id) : [];
        setLevelList(newLevelList);
    }, [currentSession]);

    const handleBackClick = () => {
        navigate({
            to: `/study-library/courses`,
        });
    };

    const heading = (
        <div className="flex items-center gap-2">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer size-5" />
            <div>Levels</div>
        </div>
    );
    
    useEffect(()=>{
        setNavHeading(heading)
    }, [])

    return(
        <div className=" w-full flex flex-col items-center justify-center">
             {!courseId ? (
                <div>Course not found</div>
            ) : sessionList.length === 0 ? (
                <div>No sessions found</div>
            ) : (
                <>
            {!levelList.length ? (
                <div className="flex w-full h-[70vh] flex-col items-center justify-center gap-8 rounded-lg">
                    <EmptySubjectMaterial />
                    <div>No subjects have been added yet.</div>
                </div>
            ) : (
                <div className={`grid grid-cols-2 ${open?"sm:grid-cols-2 md-tablets:grid-cols-3":"sm:grid-cols-3 md-tablets:grid-cols-4"} w-full gap-4 `}>
                    {levelList.map((level) => (
                        <LevelCard
                            key={level.id}
                            level={level}
                        />
                    ))}
                </div>
            )}
            </>
            )}
        </div>
    )
}