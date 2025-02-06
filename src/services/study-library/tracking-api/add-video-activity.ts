import { useMutation } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { ADD_VIDEO_ACTIVITY } from "@/constants/urls";
import { TrackingDataType } from "@/types/tracking-data-type";

export const useAddVideoActivity = () => {

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
                `${ADD_VIDEO_ACTIVITY}?slideId=${slideId}&userId=${userId}`,
                payload,
            );
        }
    });
};
