import { useSidebar } from "@/components/ui/sidebar";
import { getPublicUrl } from "@/services/upload_file";
import { Module } from "@/stores/study-library/use-modules-with-chapters-store";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const ModuleCard = ({module}:{module:Module}) => {

    const router = useRouter();
    const {open} = useSidebar();
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    const handleCardClick = (e: React.MouseEvent) => {
        if (
            e.target instanceof Element &&
            (e.target.closest(".drag-handle-container") ||
                e.target.closest('[role="menu"]') ||
                e.target.closest('[role="dialog"]'))
        ) {
            return;
        }

        const currentPath = router.state.location.pathname;
        const searchParams = router.state.location.search;
        router.navigate({
            to: `${currentPath}/chapters`,
            search: {
                subjectId: searchParams.subjectId,
                moduleId: module.id,
            },
        });
    };

    useEffect(() => {
        const fetchImageUrl = async () => {
            if (module.thumbnail_id) {
                try {
                    const url = await getPublicUrl(module.thumbnail_id);
                    setImageUrl(url);
                } catch (error) {
                    console.error("Failed to fetch image URL:", error);
                }
            }
        };

        fetchImageUrl();
    }, [module.thumbnail_id]);
    

    return(
        <div onClick={handleCardClick} className="cursor-pointer w-full items-center flex justify-center">
        <div
            className={`flex w-[310px] xs:w-[340px] sm:w-full ${open?"md-tablet:w-[270px]":"md-tablet:w-[340px]"} flex-col gap-4 rounded-lg border border-neutral-300 bg-neutral-50 p-6`}
        >
            <div className="flex items-center justify-between text-title font-semibold">
                <div>{module.module_name}</div>
            </div>

            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={module.module_name}
                    className="w-full rounded-lg object-cover"
                />
            ) : (
                <div className="flex w-full items-center justify-center rounded-lg bg-neutral-100">
                    <span className="text-neutral-400">No Image</span>
                </div>
                // <div className="w-full flex items-center justify-center">
                // <SubjectDefaultImage />
                // </div>
            )}

            <div className="flex flex-col gap-2">
                <div className="flex gap-2 text-subtitle font-semibold">
                    <div className="text-primary-500">0</div>
                    <div>Chapters</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-caption text-neutral-500">{module.description}</div>
                </div>
            </div>
        </div>
    </div>
    )
}