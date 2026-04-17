-- V201: Ad Platform Integration (Meta Lead Ads + Google Lead Form Extensions)
-- Extends form_webhook_connector to support OAuth-based ad platform connectors
-- and adds supporting tables for OAuth state management and page subscriptions.

-- ─── Extend form_webhook_connector ──────────────────────────────────────────

-- Encrypted OAuth access token (AES-256-GCM, base64-encoded)
ALTER TABLE form_webhook_connector
    ADD COLUMN IF NOT EXISTS oauth_access_token_enc TEXT;

-- When the OAuth token expires (null for non-expiring tokens like Google key)
ALTER TABLE form_webhook_connector
    ADD COLUMN IF NOT EXISTS oauth_token_expires_at TIMESTAMP;

-- Platform page/account ID (Meta: Page ID, Google: Customer ID)
ALTER TABLE form_webhook_connector
    ADD COLUMN IF NOT EXISTS platform_page_id VARCHAR(255);

-- Platform form ID (Meta: Lead Gen Form ID, Google: Campaign ID)
-- Used as the primary lookup key when a webhook arrives
ALTER TABLE form_webhook_connector
    ADD COLUMN IF NOT EXISTS platform_form_id VARCHAR(255);

-- JSON routing rules — maps field values to different audience IDs
-- Format: {"rules":[{"priority":1,"conditions":[{"field_key":"course","operator":"EQUALS","value":"Math"}],"condition_logic":"AND","target_audience_id":"uuid"}],"default_audience_id":"uuid","no_match_action":"USE_DEFAULT"}
ALTER TABLE form_webhook_connector
    ADD COLUMN IF NOT EXISTS routing_rules_json TEXT;

-- JSON field mapping — maps platform field keys to standard/custom target fields
-- Format: {"mappings":[{"platform_key":"full_name","target":"STANDARD:parent_name"},{"platform_key":"email","target":"STANDARD:parent_email"}],"unmapped_field_action":"DISCARD"}
ALTER TABLE form_webhook_connector
    ADD COLUMN IF NOT EXISTS field_mapping_json TEXT;

-- Connection lifecycle status
ALTER TABLE form_webhook_connector
    ADD COLUMN IF NOT EXISTS connection_status VARCHAR(30) DEFAULT 'ACTIVE';

-- Which source_type to tag leads with (FACEBOOK_ADS, INSTAGRAM_ADS, GOOGLE_ADS)
ALTER TABLE form_webhook_connector
    ADD COLUMN IF NOT EXISTS produces_source_type VARCHAR(50);

-- Webhook verify token for Meta hub challenge verification
ALTER TABLE form_webhook_connector
    ADD COLUMN IF NOT EXISTS webhook_verify_token VARCHAR(255);

-- Index for fast lookup by platform_form_id + vendor on webhook arrival
CREATE INDEX IF NOT EXISTS idx_fwc_platform_form_vendor
    ON form_webhook_connector (platform_form_id, vendor)
    WHERE platform_form_id IS NOT NULL AND is_active = TRUE;

-- Index for finding all connectors belonging to a Meta page
CREATE INDEX IF NOT EXISTS idx_fwc_platform_page_id
    ON form_webhook_connector (platform_page_id)
    WHERE platform_page_id IS NOT NULL;

-- ─── OAuth state table (CSRF protection for OAuth initiation) ────────────────

CREATE TABLE IF NOT EXISTS oauth_connect_state (
    id              VARCHAR(255) PRIMARY KEY,           -- UUID state token
    institute_id    VARCHAR(255) NOT NULL,
    vendor          VARCHAR(50)  NOT NULL,              -- META_LEAD_ADS, etc.
    audience_id     VARCHAR(255),                       -- pre-selected audience (optional)
    initiated_by    VARCHAR(255),                       -- user ID who started OAuth
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMP    NOT NULL               -- short-lived (10 minutes)
);

CREATE INDEX IF NOT EXISTS idx_oauth_state_expires
    ON oauth_connect_state (expires_at);

-- ─── Ad platform page subscription tracking ──────────────────────────────────
-- Tracks which Meta pages have been subscribed to receive webhook events

CREATE TABLE IF NOT EXISTS ad_platform_page_subscription (
    id              VARCHAR(255) PRIMARY KEY,           -- UUID
    institute_id    VARCHAR(255) NOT NULL,
    vendor          VARCHAR(50)  NOT NULL,
    platform_page_id VARCHAR(255) NOT NULL,
    platform_page_name VARCHAR(500),
    subscribed_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    subscription_status VARCHAR(30) DEFAULT 'ACTIVE',  -- ACTIVE, REVOKED
    CONSTRAINT uq_page_subscription UNIQUE (vendor, platform_page_id)
);

CREATE INDEX IF NOT EXISTS idx_page_sub_institute
    ON ad_platform_page_subscription (institute_id, vendor);
