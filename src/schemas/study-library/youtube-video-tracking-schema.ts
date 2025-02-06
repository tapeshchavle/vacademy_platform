import { z } from 'zod';

// Define schemas using zod for validation
const TimestampSchema = z.object({
    id: z.string(),
    start_time: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/),
    end_time: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/)
});

export const ActivitySchema = z.object({
    activity_id: z.string(),
    source: z.string(),
    source_id: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    duration: z.string(),
    timestamps: z.array(TimestampSchema),
    percentage_watched: z.string(),
    sync_status: z.enum(['SYNCED', 'STALE']),
    current_start_time: z.string().optional()
});

export const TrackingDataSchema = z.object({
    data: z.array(ActivitySchema)
});

// Define the TrackingStore interface
export interface TrackingStore {
    trackingData: z.infer<typeof TrackingDataSchema>;
    addActivity: (activity: z.infer<typeof ActivitySchema>, isUpdate?: boolean) => Promise<void>;
    syncActivities: () => Promise<void>;
    getStoredActivities: () => Promise<void>;
}