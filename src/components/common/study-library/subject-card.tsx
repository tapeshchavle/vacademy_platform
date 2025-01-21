import { SubjectDefaultImage } from "@/assets/svgs";
import { useRouter } from "@tanstack/react-router";
import { DotsSixVertical } from "phosphor-react";

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
        <div onClick={handleCardClick} className="cursor-pointer">
            <div
                className={`relative flex size-[100px] flex-col items-center justify-center gap-4 border-neutral-500 bg-neutral-50 p-4 shadow-md`}
            >
                <DotsSixVertical className="absolute right-4 top-4 size-6 cursor-pointer" />
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={subject.name}
                        className={`h-[80px] w-[80px]`}
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