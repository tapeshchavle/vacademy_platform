import { EmptySubjectMaterial } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { Subject, SubjectCard } from "./subject-card";

export const SubjectMaterial = () => {
    const subjects: Subject[] = [];
    const {setNavHeading} = useNavHeadingStore();
    
      useEffect(()=>{
        setNavHeading("Subjects")
      }, [])

    return(
        <div className=" w-full flex flex-col items-center justify-center">
            {!subjects.length ? (
                <div className="flex w-full h-[70vh] flex-col items-center justify-center gap-8 rounded-lg">
                    <EmptySubjectMaterial />
                    <div>No subjects have been added yet.</div>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-10">
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