import { EmptyModulesImage } from "@/assets/svgs"
import { ModuleCard, ModuleType } from "./module-card"


export const Modules = ({modules, subject }:{modules: ModuleType[], subject: string}) => {


    return(
        <div className=" w-full flex flex-col items-center justify-center">
        {!modules.length && (
            <div className="flex w-full h-[70vh] flex-col items-center justify-center gap-8 rounded-lg">
                    <EmptyModulesImage />
                    <div>No Modules have been added yet.</div>
                </div>
            )}
            <div className={`grid grid-cols-1 md:grid-cols-2  gap-6 w-full`}>
                {modules.map((module, index) => (
                    <ModuleCard
                        key={index}
                        module={module}
                        subject={subject}
                    />
                ))}
            </div>
        </div>
    )
}