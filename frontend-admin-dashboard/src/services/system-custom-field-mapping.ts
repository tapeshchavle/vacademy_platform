import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getInstituteId } from '@/constants/helper';

import { FIELD_MAPPING_BASE_URL, BASE_URL } from '@/constants/urls';

const API_BASE_URL = FIELD_MAPPING_BASE_URL;

export type EntityType = string;

export interface SystemField {
    entityType: string;
    fieldName: string;
    displayName: string;
    fieldType: string;
    isMapped: boolean;
    mappedCustomFieldId: string | null;
}

export interface ExistingMapping {
    id: string;
    instituteId: string;
    entityType: string;
    systemFieldName: string;
    customFieldId: string;
    customFieldName: string;
    syncDirection: 'BIDIRECTIONAL' | 'TO_SYSTEM' | 'TO_CUSTOM' | 'NONE';
    converterClass: string | null;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateMappingRequest {
    instituteId: string;
    entityType: string;
    systemFieldName: string;
    customFieldId: string;
    syncDirection: 'BIDIRECTIONAL' | 'TO_SYSTEM' | 'TO_CUSTOM' | 'NONE';
}

export interface UpdateMappingRequest {
    syncDirection?: 'BIDIRECTIONAL' | 'TO_SYSTEM' | 'TO_CUSTOM' | 'NONE';
    status?: 'ACTIVE' | 'INACTIVE';
}

export interface CustomField {
    id: string;
    name: string;
    type?: string;
}

export const fetchEntityTypes = async (): Promise<EntityType[]> => {
    const response = await authenticatedAxiosInstance.get(`${API_BASE_URL}/entity-types`);
    if (Array.isArray(response.data)) {
        return response.data;
    }
    // Handle wrapped response case if applicable
    if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }
    console.warn('fetchEntityTypes: Unexpected response format', response.data);
    return [];
};

export const fetchAvailableSystemFields = async (entityType: string): Promise<SystemField[]> => {
    const instituteId = getInstituteId();
    const response = await authenticatedAxiosInstance.get(`${API_BASE_URL}/available-fields`, {
        params: { instituteId, entityType },
    });
    return response.data;
};

export const fetchMappings = async (entityType: string): Promise<ExistingMapping[]> => {
    const instituteId = getInstituteId();
    const response = await authenticatedAxiosInstance.get(`${API_BASE_URL}`, {
        params: { instituteId, entityType },
    });
    return response.data;
};

export const createMapping = async (
    data: Omit<CreateMappingRequest, 'instituteId'>
): Promise<ExistingMapping> => {
    const instituteId = getInstituteId();
    const response = await authenticatedAxiosInstance.post(`${API_BASE_URL}`, {
        ...data,
        instituteId,
    });
    return response.data;
};

export const updateMapping = async (
    id: string,
    data: UpdateMappingRequest
): Promise<ExistingMapping> => {
    const response = await authenticatedAxiosInstance.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
};

export const deleteMapping = async (id: string): Promise<void> => {
    await authenticatedAxiosInstance.delete(`${API_BASE_URL}/${id}`);
};

// Manual Sync (if needed later, adding for completeness as per guide)
export const syncSystemToCustom = async (entityType: string, entityId: string): Promise<void> => {
    const instituteId = getInstituteId();
    await authenticatedAxiosInstance.post(`${API_BASE_URL}/sync/system-to-custom`, null, {
        params: { instituteId, entityType, entityId },
    });
};

export const syncCustomToSystem = async (entityType: string, entityId: string): Promise<void> => {
    const instituteId = getInstituteId();
    await authenticatedAxiosInstance.post(`${API_BASE_URL}/sync/custom-to-system`, null, {
        params: { instituteId, entityType, entityId },
    });
};

/**
 * Fetch the institute's custom field catalog as a flat {id, name, type} list
 * for use in the System Field ↔ Custom Field mapping dropdown.
 *
 * The backend endpoint (`GET /admin-core-service/common/custom-fields?instituteId=...`)
 * returns `List<InstituteCustomFieldDTO>` — wrapper rows with a nested
 * `custom_field` object (snake_case JSON). A single custom field can have
 * multiple rows (DEFAULT + per-feature mappings), so we deduplicate by
 * `custom_field.id` and flatten to `{id, name, type}` for the UI.
 */
export const fetchSimpleCustomFields = async (): Promise<CustomField[]> => {
    const instituteId = getInstituteId();
    const response = await authenticatedAxiosInstance.get(
        `${BASE_URL}/admin-core-service/common/custom-fields`,
        {
            params: { instituteId },
        }
    );

    const raw = response.data;
    if (!Array.isArray(raw)) {
        console.warn('fetchSimpleCustomFields: Unexpected response format', raw);
        return [];
    }

    const seen = new Set<string>();
    const result: CustomField[] = [];

    for (const row of raw) {
        // The backend serializes InstituteCustomFieldDTO with @JsonNaming snake_case,
        // so the nested field comes in as `custom_field`. Accept camelCase too just in case.
        const cf = row?.custom_field ?? row?.customField ?? row;
        const id = cf?.id;
        const name = cf?.field_name ?? cf?.fieldName;
        const type = cf?.field_type ?? cf?.fieldType;

        if (!id || !name) continue;
        if (seen.has(id)) continue;
        seen.add(id);

        result.push({ id, name, type });
    }

    return result;
};
