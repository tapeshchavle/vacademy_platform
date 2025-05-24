import { useEffect, Dispatch, SetStateAction, useState } from "react";
import { getUserId } from "@/constants/getUserId";
import { ArrowSquareOut, CaretUp, TrashSimple } from "@phosphor-icons/react";
import { CaretDown } from "@phosphor-icons/react";
import { Reply } from "./reply";
import { StatusChip } from "@/components/design-system/status-chips";
import { Switch } from "@/components/ui/switch";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { useSidebar } from "@/components/ui/sidebar";
import { Doubt as DoubtType, DoubtFilter } from "../types/get-doubts-type";
import { handleAddDoubt } from "../helpers/handleAddDoubt";
import { useAddDoubt } from "../services/AddDoubt";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Doubt = ({doubt, setDoubtProgressMarkerPdf, setDoubtProgressMarkerVideo, refetch}:{doubt:DoubtType, setDoubtProgressMarkerPdf:Dispatch<SetStateAction<number | null>>, setDoubtProgressMarkerVideo:Dispatch<SetStateAction<number | null>>, filter:DoubtFilter, refetch: () => void}) => {
    
    // const [imageUrl, setImageUrl] = useState<string | null>(null);
    const imageUrl: string | null = null;
    const [userId, setUserId] = useState<string | null>(null);
    const [showReplies, setShowReplies] = useState<boolean>(false);
    const {activeItem} = useContentStore();
    const {setOpen} = useSidebar();
    const addDoubt = useAddDoubt();
    const [doubtResolved, setDoubtResolved] = useState<boolean>(doubt.status === "RESOLVED");
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

    useEffect(() => {
        setDoubtResolved(doubt.status === "RESOLVED");
    }, [doubt.status]);

    const handleTimeStampClick = (timestamp: number) => {
        if(activeItem?.source_type == "VIDEO"){
            setDoubtProgressMarkerVideo(timestamp);
        }
        else if(activeItem?.source_type == "DOCUMENT"){
            setDoubtProgressMarkerPdf(timestamp);
        }
        setOpen(false);
    }

    const handleMarkAsResolved = () => {
        setDoubtResolved(!doubtResolved);
        handleAddDoubt({doubt: doubt.html_text, activeItem: activeItem, addDoubt: addDoubt, status:doubtResolved ? "RESOLVED" : "ACTIVE", id: doubt.id })
    }

    const handleDeleteDoubt = () => {
        handleAddDoubt({doubt: doubt.html_text, activeItem: activeItem, addDoubt: addDoubt, status: "DELETED", id: doubt.id })
        setShowDeleteDialog(false);
        console.log("refetching")
        refetch();
    }

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setUserId(id);
        };
        fetchUserId();
    }, []);

    
    return (
        <>
            <div className="lg:px-3 md:px-1 py-3 px-3 flex flex-col gap-3 rounded-lg max-sm:text-caption">
                <div className="flex flex-col gap-2">
                    <div className="flex sm:items-center justify-between sm:flex-row flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-neutral-300">
                                {/* add image here */}
                                {imageUrl ? (
                                    <img
                                    src={imageUrl}
                                    alt={doubt.name}
                                    className="size-full rounded-lg object-cover "
                                    />
                                ) : (
                                    <></>
                                )}
                            </div>
                            <div className="text-subtitle text-neutral-700 font-semibold">
                                {doubt.name}
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                            <StatusChip text={doubt.status === "RESOLVED" ? "Resolved" : "Unresolved"} textSize="text-caption" status={doubt.status === "RESOLVED" ? "SUCCESS" : "INFO"} />
                            <p className="text-neutral-500 sm:text-body text-caption">{doubt.raised_time}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <p><span className="font-semibold">Timestamp: </span>{doubt.content_position}</p>
                            <ArrowSquareOut className="cursor-pointer mt-[3px]" onClick={()=>handleTimeStampClick(parseInt(doubt.content_position || "0"))}/>
                        </div>
                        {userId && doubt.user_id === userId && doubt.replies.length>0 && ( 
                            <div className="flex gap-2 items-center font-semibold ">
                                Mark as resolved <Switch checked={doubtResolved} onCheckedChange={() => {handleMarkAsResolved()}} />
                            </div>
                        )}
                    </div>
                    <div
                        dangerouslySetInnerHTML={{
                            __html:doubt.html_text || '',
                        }}
                        className="custom-html-content"
                    />
                    {doubt.user_id==userId && doubt.replies.length==0 && 
                        <div className="flex gap-1 items-center cursor-pointer" onClick={()=>setShowDeleteDialog(true)}>
                            <TrashSimple className="text-danger-500" />
                            <p className="text-body">Delete</p>
                        </div>
                    }
                </div>
                {doubt.replies.length>0 &&
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-2 items-center">
                            <p className="sm:text-body text-caption font-semibold">Replies <span className="text-primary-500">{doubt.replies.length}</span></p>
                            {showReplies==false && <CaretDown onClick={() => setShowReplies(true)} className="cursor-pointer"/>}
                            {showReplies==true && <CaretUp onClick={() => setShowReplies(false)} className="cursor-pointer"/>}
                        </div>
                        {showReplies &&
                            <div className="flex flex-col gap-6 p-4 border border-neutral-300 rounded-md">
                                {doubt.replies.map((reply, key) => (
                                    <Reply reply={reply} key={key} />
                                ))}
                            </div>
                        }
                    </div>
                }
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Doubt</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this doubt? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteDoubt} className="bg-danger-500 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}