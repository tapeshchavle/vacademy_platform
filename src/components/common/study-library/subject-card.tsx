import { SubjectDefaultImage } from "@/assets/svgs";
import { useRouter } from "@tanstack/react-router";

export interface Subject {
    id: string;
    name: string;
    code: string | null;
    credit: number | null;
    imageId: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

interface SubjectCardProps {
    subject: Subject;
}

export const SubjectCard = ({ subject }: SubjectCardProps) => {
    
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

        const subjectRoute = subject.name.toLowerCase().replace(/\s+/g, "-");

        router.navigate({
            to: `/study-library/subjects/${subjectRoute}`,
        });
    };

    return(
        <div onClick={handleCardClick} className="cursor-pointer w-full">
            <div
                className={`relative flex flex-col items-center justify-center gap-4 border-neutral-500 bg-neutral-50 p-4 shadow-md w-full`}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={subject.name}
                        className={``}
                    />
                ) : (
                    <SubjectDefaultImage
                    />
                )}
                <div className="flex items-center justify-between gap-5">
                    <div className="text-h2 font-semibold">{subject.name}</div>
                </div>
            </div>
        </div>
    )
}