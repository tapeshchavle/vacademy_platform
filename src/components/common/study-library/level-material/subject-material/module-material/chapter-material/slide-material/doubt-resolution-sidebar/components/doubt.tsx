import { DoubtType } from "../types/doubt-list-type"
import { useEffect, Dispatch, SetStateAction, useState } from "react";
import { getUserId } from "@/constants/getUserId";
import { ArrowSquareOut, CaretUp, TrashSimple } from "@phosphor-icons/react";
import { CaretDown } from "@phosphor-icons/react";
import { Reply } from "./reply";
import { getPublicUrl } from "@/services/upload_file";
import { StatusChip } from "@/components/design-system/status-chips";
import { Switch } from "@/components/ui/switch";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { useSidebar } from "@/components/ui/sidebar";

export const Doubt = ({doubt, setDoubtProgressMarkerPdf, setDoubtProgressMarkerVideo}:{doubt:DoubtType, setDoubtProgressMarkerPdf:Dispatch<SetStateAction<number | null>>, setDoubtProgressMarkerVideo:Dispatch<SetStateAction<number | null>>}) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [showReplies, setShowReplies] = useState<boolean>(false);
    const {activeItem} = useContentStore();
    const {setOpen} = useSidebar();

    const handleTimeStampClick = (timestamp: number) => {
        if(activeItem?.source_type == "VIDEO"){
            setDoubtProgressMarkerVideo(timestamp);
        }
        else if(activeItem?.source_type == "DOCUMENT"){
            setDoubtProgressMarkerPdf(timestamp);
        }
        setOpen(false);
    }

    
    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setUserId(id);
        };
        fetchUserId();
    }, []);

    useEffect(() => {
        const fetchImageUrl = async () => {
          if (doubt.face_file_id) {
            try {
              const url = await getPublicUrl(doubt.face_file_id);
              setImageUrl(url);
            } catch (error) {
              console.error("Failed to fetch image URL:", error);
            }
          }
        };
    
        fetchImageUrl();
      }, [doubt.face_file_id]);
    
    
    return (
        <div className="lg:px-3 md:px-1 py-3 px-3 flex flex-col gap-3 rounded-lg max-sm:text-caption">
            <div className="flex flex-col gap-2">
                <div className="flex sm:items-center justify-between sm:flex-row flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-neutral-300">
                            {/* add image here */}
                            {imageUrl ? (
                                <img
                                src={imageUrl}
                                alt={doubt.user_name}
                                className="size-full rounded-lg object-cover "
                                />
                            ) : (
                                <></>
                            )}
                        </div>
                        <div className="text-body font-semibold">
                            {doubt.user_name}
                        </div>
                    </div>
                    <div className="flex gap-3 items-center">
                        <StatusChip text={doubt.status === "RESOLVED" ? "Resolved" : "Unresolved"} textSize="text-caption" status={doubt.status === "RESOLVED" ? "SUCCESS" : "INFO"} />
                        <p className="text-neutral-500 sm:text-regular text-caption">{doubt.timestamp}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <p><span className="font-semibold">Timestamp: </span>{doubt.slide_progress_marker}</p>
                        <ArrowSquareOut className="cursor-pointer mt-[3px]" onClick={()=>handleTimeStampClick(doubt.slide_progress_marker)}/>
                    </div>
                    {userId && doubt.user_id === userId && ( 
                        <div className="flex gap-2 items-center font-semibold w-full ">
                            Mark as resolved <Switch checked={doubt.status === "RESOLVED"} onCheckedChange={() => {}} />
                        </div>
                    )}
                </div>
                <div
                    dangerouslySetInnerHTML={{
                        __html:doubt.doubt_text || '',
                    }}
                    className="custom-html-content"
                />
                {doubt.user_id==userId && doubt.replies.length==0 && 
                    <div className="flex gap-1 items-center cursor-pointer">
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
    )
}