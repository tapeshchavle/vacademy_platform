import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';

const BASE = '/admin-core-service/v1/oauth/meta';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MetaPage {
    id: string;
    name: string;
}

export interface PlatformFormField {
    key: string;
    label: string;
    type: string;
    standardField: boolean;
}

export interface AdConnectorSetupRequest {
    vendor: string;
    instituteId: string;
    audienceId: string;
    platformPageId?: string;
    platformFormId: string;
    routingRulesJson?: string;
    fieldMappingJson?: string;
    producesSourceType?: string;
    sessionKey?: string;
    selectedPageId?: string;
    googleKey?: string;
}

export interface ConnectorSaveResult {
    connector_id: string;
    status: string;
    message: string;
    page_name?: string;
    webhook_url?: string;
}

// ── Meta OAuth endpoints ─────────────────────────────────────────────────────

/** Step 1: Get Meta OAuth URL. Frontend navigates browser there. */
export const initiateMetaOAuth = async (
    instituteId: string,
    audienceId?: string
): Promise<{ oauth_url: string; session_key: string }> => {
    const params: Record<string, string> = { instituteId };
    if (audienceId) params.audienceId = audienceId;
    const res = await authenticatedAxiosInstance.post(`${BASE}/initiate`, null, { params });
    return res.data;
};

/** Step 3: Fetch pages for a session (after callback). Returns safe data — no tokens. */
export const getSessionPages = async (sessionKey: string): Promise<MetaPage[]> => {
    const res = await authenticatedAxiosInstance.get(`${BASE}/session/${sessionKey}/pages`);
    return res.data;
};

/** Step 4: Fetch form fields via the session (no token exposed to frontend). */
export const getFormFields = async (
    sessionKey: string,
    formId: string,
    pageId: string
): Promise<PlatformFormField[]> => {
    const res = await authenticatedAxiosInstance.get(
        `${BASE}/session/${sessionKey}/forms/${formId}/fields`,
        { params: { pageId } }
    );
    return res.data;
};

/** Step 5: Save a Meta connector. */
export const saveMetaConnector = async (
    request: AdConnectorSetupRequest
): Promise<ConnectorSaveResult> => {
    const res = await authenticatedAxiosInstance.post(`${BASE}/connector`, request);
    return res.data;
};

// ── Google endpoints ──────────────────────────────────────────────────────────

/** Save a Google Lead Form connector (no OAuth needed). */
export const saveGoogleConnector = async (
    request: AdConnectorSetupRequest
): Promise<ConnectorSaveResult> => {
    const res = await authenticatedAxiosInstance.post(`${BASE}/google/connector`, request);
    return res.data;
};
