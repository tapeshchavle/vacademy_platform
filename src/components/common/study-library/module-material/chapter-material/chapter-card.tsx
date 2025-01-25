import { useNavigate, useRouter } from "@tanstack/react-router";
import { ChapterType } from "./chapters";
import { BookOpenText, PlayCircle  } from "@phosphor-icons/react";
import { CheckCircle } from "phosphor-react";

interface ChapterCardProps {
    chapter: ChapterType;
}

export const ChapterCard = ({ chapter }: ChapterCardProps) => {

    const router = useRouter();
    const navigate = useNavigate();

    const handleCardClick = () => {
        const currentPath = router.state.location.pathname;
        const formatterChapterName = chapter.name.replace(/\s+/g, "-");
        const currentSearch = router.state.location.search;
        navigate({ 
            to: `${currentPath}/${formatterChapterName}`,
            search: { moduleName: currentSearch.moduleName }
         });
    };

    return (
        <div onClick={handleCardClick} className="w-full cursor-pointer">
            <div className="flex w-full flex-col justify-center gap-2 rounded-lg border border-neutral-300 bg-neutral-50 p-4">
                <div className="flex items-center justify-between text-body font-semibold">
                    <div>{chapter.name}</div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-body font-semibold">
                        <div className="flex items-center gap-2">
                            <BookOpenText />
                            <div className="text-primary-500">{chapter.resourceCount?.ebooks || 0}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <PlayCircle  />
                            <div className="text-primary-500">{chapter.resourceCount?.videos || 0}</div>
                        </div>
                    </div>
                    <CheckCircle size={20} weight="fill" className="text-success-600 " />
                </div>
            </div>
        </div>
    );
};
