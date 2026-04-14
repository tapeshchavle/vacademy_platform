import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { handleFetchStudentTimeline } from '@/routes/admissions/-services/timeline-services';
import { TimelineEventItem } from '@/routes/admissions/enquiries/-components/enquiry-side-view/timeline-panel';
import { Button } from '@/components/ui/button';
import { ClipboardText } from '@phosphor-icons/react';

interface StudentFullHistoryProps {
    studentUserId: string;
}

export const StudentFullHistory = ({ studentUserId }: StudentFullHistoryProps) => {
    const [page, setPage] = useState(0);
    const pageSize = 20;

    const { data, isLoading, error } = useQuery(
        handleFetchStudentTimeline(studentUserId, page, pageSize)
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <div className="size-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                    Loading history…
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                Failed to load activity history.
            </div>
        );
    }

    if (!data || data.content.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 py-8 text-center">
                <ClipboardText weight="fill" className="size-8 text-neutral-400" />
                <p className="text-sm font-medium text-neutral-500">No history yet</p>
                <p className="text-xs text-neutral-400">
                    Events from all stages will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <div className="h-3.5 w-1 rounded-full bg-primary-500" />
                <h4 className="text-sm font-semibold text-neutral-700">Full History</h4>
                {data.totalElements !== undefined && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
                        {data.totalElements}
                    </span>
                )}
            </div>

            <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
                {data.content.map((event) => (
                    <TimelineEventItem key={event.id} event={event} />
                ))}

                {data.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                        <span className="text-[11px] text-neutral-400">
                            Page {page + 1} of {data.totalPages}
                        </span>
                        <div className="flex gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-[11px]"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-[11px]"
                                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                                disabled={page >= data.totalPages - 1}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
