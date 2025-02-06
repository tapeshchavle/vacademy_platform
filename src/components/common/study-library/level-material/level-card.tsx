import { SubjectDefaultImage } from "@/assets/svgs";
import { useRouter } from "@tanstack/react-router";

export interface LevelType {
    id: string;
    name: string;
    code: string | null;
    credit: number | null;
    imageId: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

interface LevelCardProps {
    level: LevelType;
}

export const LevelCard = ({ level }: LevelCardProps) => {
    
    const router = useRouter();
    const imageUrl = undefined

    const handleCardClick = (e: React.MouseEvent) => {
        if (
            (e.target as HTMLElement).closest(".menu-options-container") ||
            (e.target as HTMLElement).closest('[role="menu"]') ||
            (e.target as HTMLElement).closest('[role="dialog"]')
        ) {
            return;
        }

        const formatterLevelName = level.name.replace(/\s+/g, "-");
        const currentPath = router.state.location.pathname;

        router.navigate({
            to: `${currentPath}/$level/subjects`,
            params: {level: formatterLevelName}
        });
    };

    return(
        <div onClick={handleCardClick} className="cursor-pointer w-full ">
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