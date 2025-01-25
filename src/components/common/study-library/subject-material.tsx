import { EmptySubjectMaterial } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { Subject, SubjectCard } from "./subject-card";
import { useSidebar } from "@/components/ui/sidebar";

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

export const SubjectMaterial = () => {
    const subjects: Subject[] = subjectsDummy;
    const {setNavHeading} = useNavHeadingStore();
    const {open} = useSidebar();
    
      useEffect(()=>{
        setNavHeading("Study Library")
      }, [])

    return(
        <div className=" w-full flex flex-col items-center justify-center">
            {!subjects.length ? (
                <div className="flex w-full h-[70vh] flex-col items-center justify-center gap-8 rounded-lg">
                    <EmptySubjectMaterial />
                    <div>No subjects have been added yet.</div>
                </div>
            ) : (
                <div className={`grid grid-cols-2 ${open?"md:grid-cols-3":"md:grid-cols-4"} w-full gap-4 `}>
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