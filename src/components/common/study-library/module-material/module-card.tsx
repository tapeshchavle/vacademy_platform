import { useRouter } from "@tanstack/react-router";

export interface ModuleType {
    name: string;
    description: string;
    imageUrl?: string;
}

export const ModuleCard = ({module, subject}:{module:ModuleType; subject:string}) => {

    const router = useRouter();

    const handleCardClick = () => {
        const moduleName = module.name.toLowerCase().replace(/\s+/g, "-");
    
        // Navigate to the new route with the moduleName query parameter
        router.navigate({
            to: `/study-library/subjects/${subject}/modules/module`,
            search: { moduleName }, // Add moduleName as a query parameter
        });
    };
    

    return(
        <div onClick={handleCardClick} className="cursor-pointer">
        <div
            className={`flex w-[340px] flex-col gap-4 rounded-lg border border-neutral-300 bg-neutral-50 p-6 `}
        >
            <div className="flex items-center justify-between text-title font-semibold">
                <div>{module.name}</div>
            </div>

            {module.imageUrl ? (
                <img
                    src={module.imageUrl}
                    alt={module.name}
                    className="h-[200px] w-full rounded-lg object-cover"
                />
            ) : (
                <div className="flex h-[200px] w-full items-center justify-center rounded-lg bg-neutral-100">
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