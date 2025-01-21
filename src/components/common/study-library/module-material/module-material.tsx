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
            name: "Live Sessions",
            description: "All live sessions are present here"
        },
]

export const ModuleMaterial = ({subject}:{subject:string}) => {

    const {setNavHeading} = useNavHeadingStore();
    const router = useRouter();
    const modules: ModuleType[] = moduleDummyData;

    const handleBackClick = () => {
        router.navigate({
            to: `/study-library/subjects`,
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
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