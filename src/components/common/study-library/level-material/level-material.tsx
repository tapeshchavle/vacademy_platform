import { EmptySubjectMaterial } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { LevelCard, LevelType } from "./level-card";
import { useRouter } from "@tanstack/react-router";
import { CaretLeft } from "phosphor-react";

const levelDummy = [
    { 
        id: "123",
        name: "10th Class",
        code: null,
        credit: null,
        imageId: null,
        createdAt: null,
        updatedAt: null
    },
    { 
        id: "121",
        name: "9th Class",
        code: null,
        credit: null,
        imageId: null,
        createdAt: null,
        updatedAt: null
    },
    { 
        id: "124",
        name: "8th Class",
        code: null,
        credit: null,
        imageId: null,
        createdAt: null,
        updatedAt: null
    },
]

export const LevelMaterial = () => {

    const levels: LevelType[] = levelDummy;
    const {setNavHeading} = useNavHeadingStore();
    const {open} = useSidebar();
    const router = useRouter();
    
    const handleBackClick = () => {
        router.navigate({
            to: `/study-library/courses`
        })
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
            {!levels.length ? (
                <div className="flex w-full h-[70vh] flex-col items-center justify-center gap-8 rounded-lg">
                    <EmptySubjectMaterial />
                    <div>No subjects have been added yet.</div>
                </div>
            ) : (
                <div className={`grid grid-cols-2 ${open?"sm:grid-cols-2 md-tablets:grid-cols-3":"sm:grid-cols-3 md-tablets:grid-cols-4"} w-full gap-4 `}>
                    {levels.map((level) => (
                        <LevelCard
                            key={level.id}
                            level={level}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}