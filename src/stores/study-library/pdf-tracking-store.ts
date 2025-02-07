import { create } from 'zustand';
import { z } from 'zod';
import { Preferences } from '@capacitor/preferences';
import { TrackingDataSchema } from '@/schemas/study-library/pdf-tracking-schema';
import { ActivitySchema } from '@/schemas/study-library/pdf-tracking-schema';

const STORAGE_KEY = 'pdf_tracking_data';

interface TrackingStore {
   trackingData: z.infer<typeof TrackingDataSchema>;
   addActivity: (activity: z.infer<typeof ActivitySchema>, isUpdate?: boolean) => Promise<void>;
   syncActivities: () => Promise<void>;
   getStoredActivities: () => Promise<void>;
}


const loadFromStorage = async (): Promise<z.infer<typeof TrackingDataSchema>> => {
   try {
       const { value } = await Preferences.get({ key: STORAGE_KEY });
       return value ? JSON.parse(value) : { data: [] };
   } catch (error) {
       console.error('Failed to load from storage:', error);
       return { data: [] };
   }
};

export const useTrackingStore = create<TrackingStore>((set) => ({
    trackingData: { data: [] },

    addActivity: async (activity, isUpdate = false) => {
        try {
            const storedData = await loadFromStorage();
            const existingActivities = storedData.data;

            set(() => {
                const existingActivityIndex = existingActivities.findIndex(
                    (item) => item.activity_id === activity.activity_id
                );

                let updatedData;
                if (existingActivityIndex !== -1 && isUpdate) {
                    const existingActivity = existingActivities[existingActivityIndex];
                    updatedData = [...existingActivities];
                    
                    updatedData[existingActivityIndex] = {
                        ...existingActivity,
                        ...activity // This will ensure all properties are updated
                    };
                } else {
                    updatedData = [...existingActivities, activity];
                }

                Preferences.set({
                    key: STORAGE_KEY,
                    value: JSON.stringify({ data: updatedData })
                });

                return { trackingData: { data: updatedData } };
            });
        } catch (error) {
            console.error('Failed to add/update activity:', error);
            throw error;
        }
    },

    syncActivities: async () => {
        try {
            set((state) => {
                const updatedActivities = state.trackingData.data.map((activity) => ({
                    ...activity,
                    sync_status: 'SYNCED' as const
                }));

                Preferences.set({
                    key: STORAGE_KEY,
                    value: JSON.stringify({ data: updatedActivities })
                });

                return { trackingData: { data: updatedActivities } };
            });
        } catch (error) {
            console.error('Failed to sync activities:', error);
            throw error;
        }
    },

    getStoredActivities: async () => {
        try {
            const storedData = await loadFromStorage();
            console.log('Loaded stored activities:', storedData);
            set({ trackingData: storedData });
        } catch (error) {
            console.error('Failed to get stored activities:', error);
            throw error;
        }
    }
}));