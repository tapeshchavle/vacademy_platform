import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore"
import { useRouter } from "@tanstack/react-router";
import { CaretLeft } from "phosphor-react";
import { useEffect } from "react";
import { ModuleType } from "./module-card";
import { Modules } from "./modules";

const moduleDummyData: ModuleType[] = [
    {
        name: "Live Sessions",
        description: "All live sessions are present here"
    },
    {
        name: "NCERT",
        description: "All NCERT chapters are present here"
    },
]

export const ModuleMaterial = ({subject, level, course}:{subject:string; level:string; course:string}) => {

    const {setNavHeading} = useNavHeadingStore();
    const router = useRouter();
    const modules: ModuleType[] = moduleDummyData;

    const handleBackClick = () => {
        router.navigate({
            to: `/study-library/courses/$course/levels/$level/subjects`,
            params: {course: course, level: level}
        })
    };

    const heading = (
        <div className="flex items-center gap-2">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer size-5" />
            <div>{subject}</div>
        </div>
    );

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return(
        <Modules
            modules={modules}
            subject={subject}
        />
    )
}