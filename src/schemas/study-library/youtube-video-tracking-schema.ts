import { z } from 'zod';

// Define schemas using zod for validation
export const TimestampSchema = z.object({
    id: z.string(),
    start_time: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/),
    end_time: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/),
    start: z.string().datetime(),
    end: z.string().datetime()
});

export const ActivitySchema = z.object({
    activity_id: z.string(),
    source: z.string(),
    source_id: z.string(),
    start_time: z.number(),
    end_time: z.number(),
    duration: z.string(),
    timestamps: z.array(TimestampSchema),
    percentage_watched: z.string(),
    sync_status: z.enum(['SYNCED', 'STALE']),
    current_start_time: z.string().optional(),
    current_start_time_in_epoch: z.number(),
    new_activity: z.boolean()
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