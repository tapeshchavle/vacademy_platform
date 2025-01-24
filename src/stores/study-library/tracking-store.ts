import { create } from 'zustand';
import { z } from 'zod';
import { Preferences } from '@capacitor/preferences';

const TimestampSchema = z.object({
    start: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/),
    end: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/)
});

const ActivitySchema = z.object({
 activity_id: z.string(),
 source: z.string(), 
 source_id: z.string(),
 start_time: z.string(),
 end_time: z.string(),
 duration: z.string(),
 timestamps: z.array(TimestampSchema),
 percentage_watched: z.string(),
 sync_status: z.enum(['SYNCED', 'STALE'])
});

const TrackingDataSchema = z.object({
 data: z.array(ActivitySchema)
});

interface TrackingStore {
 trackingData: z.infer<typeof TrackingDataSchema>;
 addActivity: (activity: z.infer<typeof ActivitySchema>) => Promise<void>;
 syncActivities: () => Promise<void>;
 getStoredActivities: () => Promise<void>;
}

const STORAGE_KEY = 'video_tracking_data';

const loadFromStorage = async () => {
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

 addActivity: async (activity) => {
   try {
     set((state) => {
       const newState = {
         trackingData: { data: [...state.trackingData.data, activity] }
       };
       Preferences.set({
         key: STORAGE_KEY,
         value: JSON.stringify(newState.trackingData)
       });
       return newState;
     });
   } catch (error) {
     console.error('Failed to add activity:', error);
     throw error;
   }
 },

 syncActivities: async () => {
   try {
     set((state) => {
    //    const activitiesToSync = state.trackingData.data.filter(
    //      activity => activity.sync_status === 'STALE'
    //    );

       // Future API implementation here
       // const response = await api.post('/tracking', activitiesToSync);
       
       const updatedActivities = state.trackingData.data.map(activity => ({
         ...activity,
         sync_status: 'SYNCED' as const
       }));

       const newState = {
         trackingData: { data: updatedActivities }
       };

       Preferences.set({
         key: STORAGE_KEY,
         value: JSON.stringify(newState.trackingData)
       });

       return newState;
     });
   } catch (error) {
     console.error('Failed to sync activities:', error);
     throw error;
   }
 },

 getStoredActivities: async () => {
   try {
     const storedData = await loadFromStorage();
     set({ trackingData: storedData });
   } catch (error) {
     console.error('Failed to get stored activities:', error);
     throw error;
   }
 }
}));

// Initialize store with stored data
loadFromStorage().then((data) => {
 useTrackingStore.setState({ trackingData: data });
});

export type { ActivitySchema };