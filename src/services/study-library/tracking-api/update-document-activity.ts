import { useMutation } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { UPDATE_DOCUMENT_ACTIVITY } from "@/constants/urls";
import { TrackingDataType } from "@/types/tracking-data-type";

export const useAddSubject = () => {

    return useMutation({
        mutationFn: async ({
            activityId,
            requestPayload
        }: {
            activityId: string;
            requestPayload: TrackingDataType;
        }) => {
            const payload = requestPayload

            return authenticatedAxiosInstance.put(
                `${UPDATE_DOCUMENT_ACTIVITY}?activityId=${activityId}`,
                payload,
            );
        }
    });
};
