import { useMutation } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { ADD_DOCUMENT_ACTIVITY } from "@/constants/urls";
import { TrackingDataType } from "@/types/tracking-data-type";

export const useAddDocumentActivity = () => {

    return useMutation({
        mutationFn: async ({
            slideId,
            userId,
            requestPayload
        }: {
            slideId: string;
            userId: string;
            requestPayload: TrackingDataType;
        }) => {
            const payload = requestPayload

            return authenticatedAxiosInstance.post(
                `${ADD_DOCUMENT_ACTIVITY}?slideId=${slideId}&userId=${userId}`,
                payload,
            );
        }
    });
};
