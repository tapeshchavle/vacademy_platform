import { useEffect, useRef } from "react";
import PDFViewer from "./pdf-viewer";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { EmptySlideMaterial } from "@/assets/svgs";
import { useState } from "react";
import YouTubePlayer from "./youtube-player";
import { getPublicUrl } from "@/services/upload_file";

export const SlideMaterial = () => {
    const { activeItem } = useContentStore();
    const selectionRef = useRef(null);
    const [heading, setHeading] =  useState(activeItem?.document_title || activeItem?.video_title || "")
    const [content, setContent] = useState<JSX.Element | null>(null);


    const loadContent = async () => {
        if (!activeItem) {
            setContent(
                <div className="flex h-[500px] flex-col items-center justify-center rounded-lg py-10">
                    <EmptySlideMaterial />
                    <p className="mt-4 text-neutral-500">No study material has been added yet</p>
                </div>,
            );
            return;
        }

        if (activeItem.video_url != null) {
            console.log("video url: ", activeItem.video_url);
            setContent(
                <div key={`video-${activeItem.slide_id}`} className="h-full w-full">
                    <YouTubePlayer
                        videoUrl={activeItem.video_url || ""}
                    />
                </div>,
            );
            return;
        }

        if (activeItem?.document_type == "PDF") {
            const url = await getPublicUrl(activeItem?.document_data);
            setContent(<PDFViewer pdfUrl={url} />);
            return;
        }

        if (activeItem?.document_type == "DOC") {
            return;
        }

        return;
    };

    useEffect(() => {
        if (activeItem) {
            setHeading(activeItem.document_title || activeItem.video_title || "");
            setContent(null);
            loadContent();
        }
    }, [activeItem]);

    useEffect(() => {
        if (activeItem) {
            setHeading(activeItem.slide_title || "");
        }
    }, [activeItem]);

    return (
        <div className="flex w-full flex-col" ref={selectionRef}>
            <div className="-mx-8 -my-3 flex items-center justify-between gap-6 border-b border-neutral-300 px-8 py-2">
                <h3
                    className="text-subtitle font-semibold text-neutral-600"
                >
                    {heading || "No content selected"}
                </h3>
            </div>
            <div
                className={`mx-auto mt-8 ${
                    activeItem?.document_type == "PDF" ? "h-[calc(100vh-200px)]" : "h-full"
                } w-full overflow-hidden `}
            >
                {content}
            </div>
        </div>
    );
};
