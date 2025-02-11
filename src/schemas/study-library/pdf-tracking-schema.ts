import { z } from 'zod';

// const TimestampSchema = z.object({
//     start: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/),
//     end: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/)
//  });
 
// pdf-tracking-schema.ts
export const PageViewSchema = z.object({
    id: z.string(),
    page: z.number(),
    duration: z.number(),
    start_time: z.string(),
    end_time: z.string(),
    start_time_in_millis: z.number(),
    end_time_in_millis: z.number()
});

export const ActivitySchema = z.object({
    activity_id: z.string(),
    source: z.string(),
    source_id: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    start_time_in_millis: z.number(),
    end_time_in_millis: z.number(),
    duration: z.string(),
    page_views: z.array(PageViewSchema),
    total_pages_read: z.number(),
    sync_status: z.enum(['SYNCED', 'STALE']),
    current_page: z.number().optional(),
    current_page_start_time_in_millis: z.number().optional(),
    new_activity: z.boolean()
});

export const TrackingDataSchema = z.object({
    data: z.array(ActivitySchema)
});