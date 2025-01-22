import { useEffect, useRef } from "react";
import PDFViewer from "./pdf-viewer";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { EmptySlideMaterial } from "@/assets/svgs";
import { useState } from "react";
import YouTubePlayer from "./youtube-player";

export const SlideMaterial = () => {
    const { items, activeItemId, setActiveItem } = useContentStore();
    const activeItem = items.find((item) => item.id === activeItemId);
    const selectionRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [heading, setHeading] = useState(activeItem?.name || "");

    const handleHeadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHeading(e.target.value);
    };

    const saveHeading = () => {
        if (activeItem) {
            const updatedItem = { ...activeItem, name: heading };
            setActiveItem(updatedItem); // Use setActiveItem to update the store
        }
        setIsEditing(false);
    };

    const renderContent = () => {
        if (!activeItem) {
            return (
                <div className="flex h-[500px] flex-col items-center justify-center rounded-lg py-10">
                    <EmptySlideMaterial />
                    <p className="mt-4 text-neutral-500">No study material has been added yet</p>
                </div>
            );
        }

        switch (activeItem.type) {
            case "pdf":
                return <PDFViewer />;
            case "video":
                return <YouTubePlayer videoUrl={`https://www.youtube.com/watch?v=cXYuduvIcdg`} videoTitle={activeItem.name} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        if (activeItem) {
            setHeading(activeItem.name);
        }
    }, [activeItem]);

    return (
        <div className="flex w-full flex-col" ref={selectionRef}>
            <div className="-mx-8 -my-8 flex items-center justify-between gap-6 border-b border-neutral-300 px-8 py-4">
                {isEditing ? (
                    <input
                        type="text"
                        value={heading}
                        onChange={handleHeadingChange}
                        onBlur={saveHeading}
                        className="w-full text-h3 font-semibold text-neutral-600 focus:outline-none"
                        autoFocus
                    />
                ) : (
                    <h3
                        className="text-h3 font-semibold text-neutral-600"
                        onClick={() => setIsEditing(true)}
                    >
                        {heading || "No content selected"}
                    </h3>
                )}
            </div>
            <div
                className={`mx-auto mt-14 ${
                    activeItem?.type == "pdf" ? "h-[calc(100vh-200px)]" : "h-full"
                } w-full overflow-hidden px-10`}
            >
                {renderContent()}
            </div>
        </div>
    );
};
