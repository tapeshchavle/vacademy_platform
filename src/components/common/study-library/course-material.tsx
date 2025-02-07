import { EmptySubjectMaterial } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { CourseCard } from "./course-card";
import { useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";
import { getCourses } from "@/utils/study-library/get-list-from-stores/getCourses";


export const CourseMaterial = () => {
    const {studyLibraryData} = useStudyLibraryStore();
    const {setNavHeading} = useNavHeadingStore();
    const {open} = useSidebar();
    const [courses, setCourses] = useState(getCourses());
    
    useEffect(()=>{
        setNavHeading("Study Library")
    }, [])

    useEffect(() => {
        setCourses(getCourses());
    }, [studyLibraryData]);

    return(
        <div className=" w-full flex flex-col items-center justify-center">
            {!courses.length ? (
                <div className="flex w-full h-[70vh] flex-col items-center justify-center gap-8 rounded-lg">
                    <EmptySubjectMaterial />
                    <div>No subjects have been added yet.</div>
                </div>
            ) : (
                <div className={`grid grid-cols-2 ${open?"sm:grid-cols-2 md-tablets:grid-cols-3":"sm:grid-cols-3 md-tablets:grid-cols-4"} w-full gap-4 `}>
                    {courses?.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}