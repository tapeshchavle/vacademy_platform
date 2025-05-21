import { getPublicUrl } from "@/services/upload_file";
import { useEffect, useState } from "react";
import { ReplyType } from "../types/doubt-list-type"

export const Reply = ({reply}:{reply: ReplyType}) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);


    useEffect(() => {
        const fetchImageUrl = async () => {
          if (reply.face_file_id) {
            try {
              const url = await getPublicUrl(reply.face_file_id);
              setImageUrl(url);
            } catch (error) {
              console.error("Failed to fetch image URL:", error);
            }
          }
        };
    
        fetchImageUrl();
      }, [reply.face_file_id]);
      
    return (
        <div className="flex flex-col gap-3 text-regular max-sm:text-caption">
            <div className="flex gap-2 sm:items-center justify-between sm:flex-row flex-col">
                <div className="flex gap-2 items-center">
                    <div className="sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-neutral-300">
                        {/* add image here */}
                        {imageUrl ? (
                            <img
                            src={imageUrl}
                            alt={reply.user_name}
                            className="size-full rounded-lg object-cover "
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                    <p className="text-subtitle text-neutral-700 font-semibold">{reply.user_name}</p>
                    {/* <StatusChip text={reply.role_type} textSize="text-caption" status="INFO" showIcon={false}/> */}
                </div>
                <div className="flex items-center gap-3">
                    <p>{reply.timestamp}</p>
                </div>
            </div>
            {/* <p>{reply.reply_text}</p> */}
            <div
                dangerouslySetInnerHTML={{
                    __html:reply.reply_text || '',
                }}
                className="custom-html-content"
            />
        </div>
    )
}