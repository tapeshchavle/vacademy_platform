import { EmptySubjectMaterial } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { CourseCard, CourseType } from "./course-card";

const courseDummy = [
    { 
        id: "123",
        name: "Premium Pro Group 1",
        code: null,
        credit: null,
        imageId: null,
        createdAt: null,
        updatedAt: null
    },
    { 
        id: "121",
        name: "Premium Pro Group 2",
        code: null,
        credit: null,
        imageId: null,
        createdAt: null,
        updatedAt: null
    },
    { 
        id: "124",
        name: "Premium Plus Group 1",
        code: null,
        credit: null,
        imageId: null,
        createdAt: null,
        updatedAt: null
    },
]

export const CourseMaterial = () => {
    const courses: CourseType[] = courseDummy;
    const {setNavHeading} = useNavHeadingStore();
    const {open} = useSidebar();
    
      useEffect(()=>{
        setNavHeading("Study Library")
      }, [])

    return(
        <div className=" w-full flex flex-col items-center justify-center">
            {!courses.length ? (
                <div className="flex w-full h-[70vh] flex-col items-center justify-center gap-8 rounded-lg">
                    <EmptySubjectMaterial />
                    <div>No subjects have been added yet.</div>
                </div>
            ) : (
                <div className={`grid grid-cols-2 ${open?"sm:grid-cols-2 md-tablets:grid-cols-3":"sm:grid-cols-3 md-tablets:grid-cols-4"} w-full gap-4 `}>
                    {courses.map((course) => (
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