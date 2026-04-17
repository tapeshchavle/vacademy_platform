-- Add assigned counselor fields to user_lead_profile
ALTER TABLE user_lead_profile
    ADD COLUMN IF NOT EXISTS assigned_counselor_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS assigned_counselor_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_user_lead_profile_counselor
    ON user_lead_profile (assigned_counselor_id)
    WHERE assigned_counselor_id IS NOT NULL;
