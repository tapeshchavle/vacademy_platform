// module-material.tsx
import { useEffect } from "react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { Chapters, ChapterType } from "./chapters";

interface ChapterMaterialProps {
    subject: string;
    course: string;
    level:string;
}

export const ChapterMaterial = ({ subject, level, course }: ChapterMaterialProps) => {
    const router = useRouter();
    const { setNavHeading } = useNavHeadingStore();


    const handleBackClick = () => {
        router.navigate({
            to: `/study-library/courses/$course/levels/$level/subjects/$subject/modules`,
            params: {subject: subject, level:level, course: course}
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

    const chaptersDummyData = [
         {
            name: "Refraction",
            description: "Details about refraction and light in physics",
            resourceCount: {
                ebooks: 3,
                videos: 4
            }
        },
         {
            name: "Human Eye",
            description: "Details about Human Eye and light in physics",
            resourceCount: {
                ebooks: 3,
                videos: 4
            }
        }
    ]

    const chapters : ChapterType[] = chaptersDummyData;

    return (
        <Chapters
            chapters={chapters}
        />
    );
};
