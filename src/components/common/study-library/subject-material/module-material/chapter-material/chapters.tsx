import { EmptyChaptersImage } from "@/assets/svgs";
import { ChapterCard } from "./chapter-card";

export interface ChapterType {
    name: string;
    description: string;
    resourceCount?: {
        ebooks: number;
        videos: number;
    };
}

export const Chapters = ({ chapters}:{chapters:ChapterType[]}) => {
    return(
        <div className=" w-full flex flex-col items-center justify-center">
        {!chapters.length && (
            <div className="flex w-full h-[70vh] flex-col items-center justify-center gap-8 rounded-lg">
                    <EmptyChaptersImage />
                    <div>No Modules have been added yet.</div>
                </div>
            )}
            <div className="flex flex-col gap-6 w-full">
                {chapters.map((chapter, index) => (
                    <ChapterCard
                        key={index}
                        chapter={chapter}
                    />
                ))}
            </div>
        </div>
    )
}