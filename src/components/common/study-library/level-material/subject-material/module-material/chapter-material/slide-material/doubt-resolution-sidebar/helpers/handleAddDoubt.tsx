import { DoubtType } from "../types/add-doubt-type";
import { StudentDetailsType } from "../types/add-doubt-type";
import { Dispatch, SetStateAction } from "react";
import { getFromStorage } from "@/components/common/LoginPages/sections/login-form";
import { toast } from "sonner";

export const handleAddDoubt = async (doubt: string, activeItem: any, setDoubt: Dispatch<SetStateAction<string>>, setShowInput: Dispatch<SetStateAction<boolean>>, addDoubt: any, refetch: () => void) => {
    const studentDetails = await getFromStorage("StudentDetails");
    const studentDetailsData: StudentDetailsType = JSON.parse(studentDetails || "{}");

    const doubtData: DoubtType = {
        user_id: studentDetailsData.user_id,
        name: studentDetailsData.full_name,
        source: "SLIDE",
        source_id: activeItem?.id || "",
        raised_time: new Date().toISOString(),
        resolved_time: null,
        content_position: "",
        content_type: (activeItem?.source_type=="DOCUMENT" ? activeItem.document_slide?.type : activeItem?.source_type || "") as string,
        html_text: doubt,
        status: "ACTIVE",
        parent_id: null,
        parent_level: 0,
        doubt_assignee_request_user_ids: [],
    }
    addDoubt.mutate(doubtData, {
        onSuccess: () => {
            setDoubt("")
            setShowInput(false)
            refetch()
        },
        onError: () => {
            toast.error("Error adding doubt")
        }
    })
}