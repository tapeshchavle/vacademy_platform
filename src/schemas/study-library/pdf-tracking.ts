import { z } from 'zod';

const TimestampSchema = z.object({
    start: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/),
    end: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/)
 });
 
export const PageViewSchema = z.object({
     page: z.number(),
     duration: z.number()
 });
 
export const ActivitySchema = z.object({
    activity_id: z.string(),
    source: z.string(),
    source_id: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    duration: z.string(),
    timestamps: z.array(TimestampSchema).optional(),
    page_views: z.array(PageViewSchema).optional(),
    percentage_watched: z.string().optional(),
    percentage_read: z.string().optional(),
    sync_status: z.enum(['SYNCED', 'STALE'])
 });
 
export const TrackingDataSchema = z.object({
    data: z.array(ActivitySchema)
 });