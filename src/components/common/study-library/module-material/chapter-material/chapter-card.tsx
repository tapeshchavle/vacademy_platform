import { ChapterType } from "./chapters";
import { FileDoc, FilePdf, Video } from "@phosphor-icons/react";

interface ChapterCardProps {
    chapter: ChapterType;
}

export const ChapterCard = ({ chapter }: ChapterCardProps) => {

    // const router = useRouter();
    // const navigate = useNavigate();
    const handleCardClick = () => {};

    return (
        <div onClick={handleCardClick} className="w-full cursor-pointer">
            <div className="flex w-full flex-col justify-center gap-2 rounded-lg border border-neutral-300 bg-neutral-50 p-3 shadow-md">
                <div className="flex items-center justify-between text-subtitle font-semibold">
                    <div>{chapter.name}</div>
                </div>
                <div className="flex gap-4 text-title font-semibold">
                    <div className="flex items-center gap-2">
                        <FilePdf />
                        <div className="text-primary-500">{chapter.resourceCount?.ebooks || 0}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileDoc />
                        <div className="text-primary-500">{chapter.resourceCount?.videos || 0}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Video />
                        <div className="text-primary-500">{chapter.resourceCount?.videos || 0}</div>
                    </div>
                </div>
            </div>

            
        </div>
    );
};
