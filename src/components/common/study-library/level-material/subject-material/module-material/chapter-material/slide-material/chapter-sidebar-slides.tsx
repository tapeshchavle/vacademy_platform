import { useSidebar } from "@/components/ui/sidebar";
import { truncateString } from "@/lib/reusable/truncateString";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { BookOpenText, PlayCircle } from "@phosphor-icons/react";
import { ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { Slide, useSlides } from "@/hooks/study-library/use-slides";
import { DashboardLoader } from "@/components/core/dashboard-loader";

export const ChapterSidebarSlides = () => {
    const { open } = useSidebar();
    const { activeItem, setActiveItem } = useContentStore();
    const router = useRouter();
    const { chapterId } = router.state.location.search;
    const { slides, isLoading } = useSlides(chapterId || "");

   
    
    const getIcon = (slide: Slide): ReactNode => {
        const type = slide.published_url != null ? "VIDEO" : slide.document_type;
        switch (type) {
            case "VIDEO":
                return <PlayCircle className="size-6" />;
            default:
                return <BookOpenText className="size-6" />;
        }
    };

    if (isLoading) {
        return <DashboardLoader />;
    }

    return (
        <div className="flex w-full flex-col items-center gap-6 text-neutral-600">
            {slides?.map((slide:Slide) => (
                <div
                    key={slide.slide_id}
                    onClick={() => setActiveItem(slide)} // Pass the entire item
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2 ${
                        slide.slide_id === activeItem?.slide_id
                            ? "border border-neutral-200 bg-white text-primary-500"
                            : "hover:border hover:border-neutral-200 hover:bg-white hover:text-primary-500"
                    }`}
                    title={slide.document_title || slide.video_title || ""}
                >
                    {getIcon(slide)}
                    <p className={`flex-1 text-subtitle ${open ? "visible" : "hidden"} text-body`}>
                        {truncateString(
                            slide.document_title || slide.video_title || "",
                            18,
                        )}
                    </p>
                </div>
            ))}
        </div>
    );
};
