import { useMutation } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { UPDATE_VIDEO_ACTIVITY } from "@/constants/urls";
import { TrackingDataType } from "@/types/tracking-data-type";

export const useUpdateVideoActivity = () => {

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
                `${UPDATE_VIDEO_ACTIVITY}/${activityId}`,
                payload,
            );
        }
    });
};
