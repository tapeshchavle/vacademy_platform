import { DoubtType } from "../types/add-doubt-type";
import { StudentDetailsType } from "../types/add-doubt-type";
import { Dispatch, SetStateAction } from "react";
import { getFromStorage } from "@/components/common/LoginPages/sections/login-form";
import { toast } from "sonner";

export const handleAddDoubt = async ({doubt, activeItem, addDoubt, setDoubt, setShowInput, refetch, status, id}:{doubt: string, activeItem: any, addDoubt: any, setDoubt?: Dispatch<SetStateAction<string>>, setShowInput?: Dispatch<SetStateAction<boolean>>, refetch?: () => void, status?: 'ACTIVE' | 'RESOLVED' | 'DELETED', id?:string}) => {
    const studentDetails = await getFromStorage("StudentDetails");
    const studentDetailsData: StudentDetailsType = JSON.parse(studentDetails || "{}");

    console.log("studentDetailsData: ", studentDetailsData)

    const doubtData: DoubtType = {
        user_id: studentDetailsData.user_id,
        name: studentDetailsData.full_name,
        source: "SLIDE",
        source_id: activeItem?.id || "",
        raised_time: new Date().toISOString(),
        resolved_time: null,
        content_position: null,
        content_type: (activeItem?.source_type=="DOCUMENT" ? activeItem.document_slide?.type : activeItem?.source_type || "") as string,
        html_text: doubt,
        status: status || "ACTIVE",
        parent_id: null,
        parent_level: 0,
        doubt_assignee_request_user_ids: [],
    }

    if(id){
        doubtData.id = id;
    }

    addDoubt.mutate(doubtData, {
        onSuccess: () => {
            if (setDoubt && setShowInput && refetch) {
                setDoubt("")
                setShowInput(false)
                refetch()
            }
        },
        onError: () => {
            toast.error("Error adding doubt")
        }
    })
}