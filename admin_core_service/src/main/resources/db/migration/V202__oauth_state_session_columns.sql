-- V202: Add server-side session columns to oauth_connect_state.
-- Enables the OAuth callback to store encrypted tokens in the DB instead of
-- returning them to the browser. The frontend only ever receives a session UUID.

ALTER TABLE oauth_connect_state
    -- Encrypted long-lived user access token (set after /callback exchange)
    ADD COLUMN IF NOT EXISTS user_token_enc TEXT,

    -- Encrypted JSON array of connectable pages with per-page encrypted tokens:
    -- [{"id":"123","name":"My Page","token_enc":"<enc>"},...]
    -- Frontend receives only id+name; server resolves token from here on /connector save.
    ADD COLUMN IF NOT EXISTS pages_json_enc TEXT,

    -- Lifecycle: PENDING → AUTHORIZED → CONSUMED | EXPIRED
    ADD COLUMN IF NOT EXISTS session_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

-- Cleanup index: expired / consumed sessions are safe to purge
CREATE INDEX IF NOT EXISTS idx_oauth_state_status
    ON oauth_connect_state (session_status, expires_at);
