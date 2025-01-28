import { EmptySubjectMaterial } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { Subject, SubjectCard } from "./subject-card";
import { useSidebar } from "@/components/ui/sidebar";
import { useRouter } from "@tanstack/react-router";
import { CaretLeft } from "phosphor-react";

const subjectsDummy = [
    { 
        id: "123",
        name: "Biology",
        code: null,
        credit: null,
        imageId: null,
        createdAt: null,
        updatedAt: null
    },
    { 
        id: "124",
        name: "Chemistry",
        code: null,
        credit: null,
        imageId: null,
        createdAt: null,
        updatedAt: null
    },
]

export const SubjectMaterial = ({course}:{course:string}) => {
    const subjects: Subject[] = subjectsDummy;
    const {setNavHeading} = useNavHeadingStore();
    const {open} = useSidebar();
    const router = useRouter();

    const handleBackClick = () => {
        router.navigate({
            to: `/study-library/courses/$course/levels`,
            params: {course: course}
        })
    };

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
                    {subjects.map((subject) => (
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