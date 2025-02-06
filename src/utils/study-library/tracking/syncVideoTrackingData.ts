import { useAddVideoActivity } from '@/services/study-library/tracking-api/add-video-activity';
import { useUpdateVideoActivity } from '@/services/study-library/tracking-api/update-video-activity';
import { TrackingDataType } from '@/types/tracking-data-type';
import { ActivitySchema } from '@/schemas/study-library/youtube-video-tracking-schema';
import { calculateAndUpdateTimestamps } from '@/utils/study-library/tracking/calculateAndUpdateTimestamps';
import { z } from 'zod';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'video_tracking_data';
const USER_ID_KEY = 'StudentDetails';

export const syncVideoTrackingData = async () => {
    try {
        const userDetailsStr = await Preferences.get({ key: USER_ID_KEY });
        const userDetails = userDetailsStr.value ? JSON.parse(userDetailsStr.value) : null;
        const userId = userDetails?.user_id;

        if (!userId) {
            throw new Error('User ID not found in storage');
        }

        const { value } = await Preferences.get({ key: STORAGE_KEY });
        if (!value) return;

        const trackingData = JSON.parse(value);
        const activities = trackingData.data as Array<z.infer<typeof ActivitySchema>>;
        const addVideoActivity = useAddVideoActivity();
        const updateVideoActivity = useUpdateVideoActivity();

        const updatedActivities = [];

        for (let i = 0; i < activities.length; i++) {
            let activity = activities[i];
            
            if (activity.sync_status === 'SYNCED') {
                if (i === activities.length - 1) {
                    updatedActivities.push(activity);
                }
                continue;
            }

            activity = calculateAndUpdateTimestamps(activity);

            // Ensure we have at least one timestamp
            const timestamps = activity.timestamps.length > 0 
                ? activity.timestamps 
                : [{
                    id: activity.activity_id,
                    start_time: activity.start_time,
                    end_time: activity.end_time
                }];

            const apiPayload: TrackingDataType = {
                id: activity.activity_id,
                source_id: activity.source_id,
                source_type: activity.source,
                user_id: userId,
                slide_id: "",
                start_time: activity.start_time,
                end_time: activity.end_time,
                percentage_watched: parseFloat(activity.percentage_watched),
                videos: [timestamps[0]], // Ensure we always have exactly one element
                documents: null
            };

            try {
                if (activity.new_activity) {
                    await addVideoActivity.mutateAsync({
                        slideId: "",
                        userId,
                        requestPayload: apiPayload
                    });
                } else {
                    await updateVideoActivity.mutateAsync({
                        activityId: activity.activity_id,
                        requestPayload: apiPayload
                    });
                }

                activity.sync_status = 'SYNCED';
                updatedActivities.push(activity);
            } catch (error) {
                console.error('API call failed:', error);
                updatedActivities.push(activity);
            }
        }

        await Preferences.set({
            key: STORAGE_KEY,
            value: JSON.stringify({ data: updatedActivities })
        });

    } catch (error) {
        console.error('Failed to sync video tracking data:', error);
        throw error;
    }
};