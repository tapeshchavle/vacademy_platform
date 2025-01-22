// module-material.tsx
import { useEffect } from "react";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { Chapters, ChapterType } from "./chapters";

interface ChapterMaterialProps {
    subject: string;
    module: string | undefined;
}

export const ChapterMaterial = ({ subject, module }: ChapterMaterialProps) => {
    const router = useRouter();
    const { setNavHeading } = useNavHeadingStore();


    const handleBackClick = () => {
        router.navigate({
            to: `/study-library/subjects/${subject}/modules`,
            search: { moduleName: module }
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
            name: "Refraction",
            description: "Details about refraction and light in physics",
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
