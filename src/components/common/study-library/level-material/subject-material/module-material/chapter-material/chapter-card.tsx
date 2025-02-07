import { useNavigate, useRouter } from "@tanstack/react-router";
import { BookOpenText, PlayCircle  } from "@phosphor-icons/react";
import { CheckCircle } from "phosphor-react";
import { ChapterWithSlides } from "@/stores/study-library/use-modules-with-chapters-store";



export const ChapterCard = ({ chapter }: {chapter: ChapterWithSlides}) => {

    const router = useRouter();
    const { courseId, levelId, subjectId, moduleId } = router.state.location.search;
    const navigate = useNavigate();

    const handleCardClick = (e: React.MouseEvent) => {
        if (
            (e.target as HTMLElement).closest(".menu-options-container") ||
            (e.target as HTMLElement).closest('[role="menu"]') ||
            (e.target as HTMLElement).closest(".drag-handle-container") ||
            (e.target as HTMLElement).closest('[role="dialog"]')
        ) {
            return;
        }

        const currentPath = router.state.location.pathname;

        navigate({
            to: `${currentPath}/slides`,
            search: {
                courseId: courseId,
                levelId: levelId,
                subjectId: subjectId,
                moduleId: moduleId,
                chapterId: chapter.chapter.id,
                slideId: "yourSlideId",
            },
        });
    };

    return (
        <div onClick={handleCardClick} className="w-full cursor-pointer">
            <div className="flex w-full flex-col justify-center gap-2 rounded-lg border border-neutral-300 bg-neutral-50 p-4">
                <div className="flex items-center justify-between text-body font-semibold">
                    <div>{chapter.chapter.chapter_name}</div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-body font-semibold">
                        <div className="flex items-center gap-2">
                            <BookOpenText />
                            <div className="text-primary-500">{chapter.slides_count.pdf_count+chapter.slides_count.doc_count || 0}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <PlayCircle  />
                            <div className="text-primary-500">{chapter.slides_count.video_count || 0}</div>
                        </div>
                    </div>
                    <CheckCircle size={20} weight="fill" className="text-success-600 " />
                </div>
            </div>
        </div>
    );
};
