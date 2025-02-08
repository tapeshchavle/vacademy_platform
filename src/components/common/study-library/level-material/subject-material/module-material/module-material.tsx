import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore"
import { useRouter } from "@tanstack/react-router";
import { CaretLeft } from "phosphor-react";
import { useEffect } from "react";
import { Modules } from "./modules";
import { useModulesWithChaptersStore } from "@/stores/study-library/use-modules-with-chapters-store";
import { getSubjectName } from "@/utils/study-library/get-name-by-id/getSubjectNameById";


export const ModuleMaterial = () => {

    const {setNavHeading} = useNavHeadingStore();
    const router = useRouter();
    const searchParams = router.state.location.search;
    const subjectId: string = searchParams.subjectId || "";

    const { modulesWithChaptersData } = useModulesWithChaptersStore();
    

    const handleBackClick = () => {
        router.navigate({
            to: `/study-library/courses/levels/subjects`
        })
    };

    const subjectName = getSubjectName(subjectId)

    const heading = (
        <div className="flex items-center gap-2">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer size-5" />
            <div>{subjectName}</div>
        </div>
    );

    useEffect(() => {
        setNavHeading(heading);
    }, []);

    return(
        <Modules
            modules={modulesWithChaptersData}
        />
    )
}