import { SubjectDefaultImage } from "@/assets/svgs";
import { LevelWithDetailsType } from "@/stores/study-library/use-study-library-store";
import { useNavigate, useRouter } from "@tanstack/react-router";

interface LevelCardProps {
    level: LevelWithDetailsType;
}

export const LevelCard = ({ level }: LevelCardProps) => {
    const navigate = useNavigate();
    const router = useRouter();

    const currentPath = router.state.location.pathname;
    const { courseId } = router.state.location.search;
    const imageUrl = undefined

    const handleLevelCardClick = (e: React.MouseEvent) => {
        if (
            e.target instanceof Element &&
            (e.target.closest(".menu-options-container") ||
                e.target.closest(".drag-handle-container") ||
                e.target.closest('[role="menu"]') ||
                e.target.closest('[role="dialog"]'))
        ) {
            return;
        }

        navigate({
            to: `${currentPath}/subjects`,
            search: {
                courseId: courseId,
                levelId: level.id,
            },
        });
    };

    

    return(
        <div onClick={handleLevelCardClick} className="cursor-pointer w-full ">
            <div
                className={`relative flex flex-col items-center justify-center gap-4 border rounded-lg border-neutral-200 bg-neutral-50 p-4  w-full`}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={level.name}
                        className={``}
                    />
                ) : (
                    <SubjectDefaultImage
                    />
                )}
                <div className="flex items-center justify-between gap-5">
                    <div className="text-body font-semibold">{level.name}</div>
                </div>
            </div>
        </div>
    )
}