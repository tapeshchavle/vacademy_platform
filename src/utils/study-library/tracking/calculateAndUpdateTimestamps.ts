// src/utils/study-library/tracking/calculateAndUpdateTimestamps.ts
import { v4 as uuidv4 } from 'uuid';
import { convertTimeToSeconds } from './convertTimeToSeconds';
import { formatVideoTime } from './formatVideoTime';
import { ActivitySchema } from '@/schemas/study-library/youtube-video-tracking-schema';
import { z } from 'zod';

const formatInISODateFormat = (epochTimeInMillis: number): string => {
    return new Date(epochTimeInMillis).toISOString();
};

export const calculateAndUpdateTimestamps = (activity: z.infer<typeof ActivitySchema>) => {
    const totalTimestampDuration = activity.timestamps.reduce((sum: number, timestamp: {
        start_time: string;
        end_time: string;
    }) => {
        const startSeconds = convertTimeToSeconds(timestamp.start_time);
        const endSeconds = convertTimeToSeconds(timestamp.end_time);
        return sum + (endSeconds - startSeconds);
    }, 0);

    const activityDuration = parseInt(activity.duration);

    if (activityDuration > totalTimestampDuration && activity.current_start_time) {
        const remainingDuration = activityDuration - totalTimestampDuration;
        const startTimeInSeconds = convertTimeToSeconds(activity.current_start_time);
        const endTimeInSeconds = startTimeInSeconds + remainingDuration;
        
        // Calculate the end time in epoch milliseconds
        const endTimeInEpoch = activity.current_start_time_in_epoch + (remainingDuration * 1000);

        const newTimestamp = {
            id: uuidv4(),
            start_time: activity.current_start_time,
            end_time: formatVideoTime(endTimeInSeconds),
            start: formatInISODateFormat(activity.current_start_time_in_epoch),
            end: formatInISODateFormat(endTimeInEpoch)
        };

        return {
            ...activity,
            timestamps: [...activity.timestamps, newTimestamp]
        };
    }

    return activity;
};