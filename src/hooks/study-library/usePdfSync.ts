// usePDFSync.ts
import { ActivitySchema } from '@/schemas/study-library/pdf-tracking-schema';
import { useAddDocumentActivity } from '@/services/study-library/tracking-api/add-document-activity';
import { useUpdateDocumentActivity } from '@/services/study-library/tracking-api/update-document-activity';
import { useContentStore } from '@/stores/study-library/chapter-sidebar-store';
import { TrackingDataType } from '@/types/tracking-data-type';
import { calculateAndUpdatePageViews } from '@/utils/study-library/tracking/calculateAndUpdatePageViews';
import { Preferences } from '@capacitor/preferences';
import { z } from 'zod';

const STORAGE_KEY = 'pdf_tracking_data';
const USER_ID_KEY = 'StudentDetails';

export const usePDFSync = () => {
    const addDocumentActivity = useAddDocumentActivity();
    const updateDocumentActivity = useUpdateDocumentActivity();
    const {activeItem} = useContentStore();

    const syncPDFTrackingData = async () => {
        try {
            const userDetailsStr = await Preferences.get({ key: USER_ID_KEY });
            const userDetails = userDetailsStr.value ? JSON.parse(userDetailsStr.value) : null;
            const userId = userDetails[0]?.user_id;

            if (!userId) {
                throw new Error('User ID not found in storage');
            }

            const { value } = await Preferences.get({ key: STORAGE_KEY });
            if (!value) return;

            const trackingData = JSON.parse(value);
            const activities = trackingData.data as Array<z.infer<typeof ActivitySchema>>;
            const updatedActivities = [];

            for (let activity of activities) {
                if (activity.sync_status === 'SYNCED') {
                    updatedActivities.push(activity);
                    continue;
                }

                activity = calculateAndUpdatePageViews(activity);

                const apiPayload: TrackingDataType = {
                    id: activity.activity_id,
                    source_id: activity.source_id,
                    source_type: activity.source,
                    user_id: userId,
                    slide_id: activeItem?.slide_id || "",
                    start_time_in_millis: activity.start_time_in_millis,
                    end_time_in_millis: activity.end_time_in_millis,
                    percentage_watched: activity.total_pages_read,
                    videos: null,
                    documents: activity.page_views.map(view => ({
                        id: view.id,
                        start_time_in_millis: view.start_time_in_millis,
                        end_time_in_millis: view.end_time_in_millis,
                        page_number: view.page
                    }))
                };

                try {
                    if (activity.page_views.length === 1) {
                        await addDocumentActivity.mutateAsync({
                            slideId: activeItem?.slide_id || "",
                            userId,
                            requestPayload: apiPayload
                        });
                    } else {
                        await updateDocumentActivity.mutateAsync({
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
            console.error('Failed to sync PDF tracking data:', error);
            throw error;
        }
    };

    return { syncPDFTrackingData };
};