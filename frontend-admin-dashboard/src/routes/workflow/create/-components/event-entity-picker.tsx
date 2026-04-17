import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { authenticatedAxiosInstance } from '@/lib/auth/axiosInstance';
import { INSTITUTE_ID } from '@/constants/api';

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

/**
 * Smart entity picker that loads the right dropdown based on event_applied_type.
 * Replaces the raw text input for "Event ID" in the workflow trigger setup.
 */
interface EventEntityPickerProps {
    eventAppliedType: string;
    value: string | undefined;
    onChange: (id: string | undefined) => void;
    instituteId: string;
}

interface EntityOption {
    id: string;
    label: string;
    subtitle?: string;
}

// Fetch package sessions (batches) for the institute
async function fetchPackageSessions(instituteId: string): Promise<EntityOption[]> {
    const response = await authenticatedAxiosInstance.post(
        `${BASE_URL}/admin-core-service/v1/admin/package/session/list?pageNo=0&pageSize=100`,
        { institute_id: instituteId, statuses: ['ACTIVE'] }
    );
    const content = response.data?.content ?? response.data ?? [];
    return Array.isArray(content)
        ? content.map((item: Record<string, string>) => ({
            id: item.id ?? item.package_session_id ?? '',
            label: item.package_name ?? item.name ?? item.id ?? 'Unknown',
            subtitle: item.level_name ? `${item.level_name} / ${item.session_name ?? ''}` : undefined,
        }))
        : [];
}

// Fetch audiences/campaigns for the institute
async function fetchAudiences(instituteId: string): Promise<EntityOption[]> {
    const response = await authenticatedAxiosInstance.post(
        `${BASE_URL}/admin-core-service/v1/audience-manager/campaigns/list`,
        { institute_id: instituteId, page: 0, size: 100, status: ['ACTIVE', 'INACTIVE'] }
    );
    const content = response.data?.content ?? response.data ?? [];
    return Array.isArray(content)
        ? content.map((item: Record<string, string>) => ({
            id: item.campaign_id ?? item.id ?? '',
            label: item.campaign_name ?? item.name ?? item.id ?? 'Unknown',
            subtitle: item.campaign_type ?? undefined,
        }))
        : [];
}

// Fetch live sessions for the institute
async function fetchLiveSessions(instituteId: string): Promise<EntityOption[]> {
    const response = await authenticatedAxiosInstance.get(
        `${BASE_URL}/admin-core-service/v1/live-session/sessions/upcoming?instituteId=${instituteId}`
    );
    const data = response.data ?? [];
    const sessions: EntityOption[] = [];
    // API may return grouped by date or flat list
    if (Array.isArray(data)) {
        for (const item of data) {
            if (item.sessions && Array.isArray(item.sessions)) {
                for (const s of item.sessions) {
                    sessions.push({
                        id: s.session_id ?? s.sessionId ?? s.id ?? '',
                        label: s.title ?? 'Untitled Session',
                        subtitle: s.subject ?? undefined,
                    });
                }
            } else {
                sessions.push({
                    id: item.session_id ?? item.sessionId ?? item.id ?? '',
                    label: item.title ?? 'Untitled Session',
                    subtitle: item.subject ?? undefined,
                });
            }
        }
    }
    return sessions;
}

// Fetch enroll invites for the institute
async function fetchEnrollInvites(instituteId: string): Promise<EntityOption[]> {
    const response = await authenticatedAxiosInstance.post(
        `${BASE_URL}/admin-core-service/v1/admin/enroll-invite/list?pageNo=0&pageSize=100`,
        { institute_id: instituteId, statuses: ['ACTIVE'] }
    );
    const content = response.data?.content ?? response.data ?? [];
    return Array.isArray(content)
        ? content.map((item: Record<string, string>) => ({
            id: item.id ?? '',
            label: item.name ?? item.invite_code ?? item.id ?? 'Unknown',
            subtitle: item.invite_code ? `Code: ${item.invite_code}` : undefined,
        }))
        : [];
}

function useEntityOptions(eventAppliedType: string, instituteId: string) {
    return useQuery({
        queryKey: ['workflow-entity-picker', eventAppliedType, instituteId],
        queryFn: async () => {
            switch (eventAppliedType) {
                case 'PACKAGE_SESSION':
                    return fetchPackageSessions(instituteId);
                case 'AUDIENCE':
                    return fetchAudiences(instituteId);
                case 'LIVE_SESSION':
                    return fetchLiveSessions(instituteId);
                case 'ENROLL_INVITE':
                    return fetchEnrollInvites(instituteId);
                default:
                    return [];
            }
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!instituteId && !!eventAppliedType && eventAppliedType !== 'INSTITUTE' && eventAppliedType !== 'ASSESSMENT',
    });
}

const TYPE_LABELS: Record<string, string> = {
    PACKAGE_SESSION: 'Batch / Package Session',
    AUDIENCE: 'Audience / Campaign',
    LIVE_SESSION: 'Live Session',
    ENROLL_INVITE: 'Enrollment Invite',
    INSTITUTE: 'Institute',
    ASSESSMENT: 'Assessment',
    USER_PLAN: 'Membership / User Plan',
    PAYMENT: 'Payment',
};

export function EventEntityPicker({ eventAppliedType, value, onChange, instituteId }: EventEntityPickerProps) {
    const [showManual, setShowManual] = useState(false);
    const { data: options = [], isLoading } = useEntityOptions(eventAppliedType, instituteId);

    const typeLabel = TYPE_LABELS[eventAppliedType] ?? eventAppliedType.replace(/_/g, ' ').toLowerCase();

    // For INSTITUTE and ASSESSMENT — no entity picker (institute-wide or cross-service)
    if (eventAppliedType === 'INSTITUTE') {
        return (
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                This trigger applies to the entire institute. No specific entity selection needed.
            </div>
        );
    }

    if (eventAppliedType === 'ASSESSMENT') {
        return (
            <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">Assessment ID (optional)</Label>
                <Input
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value || undefined)}
                    className="text-sm"
                    placeholder="Leave empty to apply to all assessments"
                />
                <p className="text-[10px] text-gray-400">
                    Assessments are managed in a separate service. Enter the assessment ID manually, or leave empty for all.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-600">
                    Restrict to a specific {typeLabel} (optional)
                </Label>
                <button
                    className="text-[10px] text-primary-500 hover:underline"
                    onClick={() => setShowManual(!showManual)}
                >
                    {showManual ? 'Pick from list' : 'Enter ID manually'}
                </button>
            </div>

            {showManual ? (
                <Input
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value || undefined)}
                    className="text-sm font-mono"
                    placeholder="Paste entity ID here"
                />
            ) : (
                <select
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value || undefined)}
                >
                    <option value="">All {typeLabel}s (no restriction)</option>
                    {isLoading && <option disabled>Loading...</option>}
                    {options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                            {opt.label}{opt.subtitle ? ` — ${opt.subtitle}` : ''}
                        </option>
                    ))}
                    {!isLoading && options.length === 0 && (
                        <option disabled>No {typeLabel}s found</option>
                    )}
                </select>
            )}

            <p className="text-[10px] text-gray-400">
                {value
                    ? `This workflow will only fire for the selected ${typeLabel}.`
                    : `Leave as "All" and the workflow fires for every ${typeLabel} in your institute.`
                }
            </p>
        </div>
    );
}
