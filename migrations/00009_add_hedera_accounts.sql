-- Add hedera_account_id and hedera_private_key to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hedera_account_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hedera_private_key TEXT;

-- Try to create a dummy 'profiles' table if it doesn't already exist, otherwise add to it.
-- This ensures 'profiles' used in the auth routes supports the new columns.
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    name TEXT,
    email TEXT,
    user_role TEXT,
    auth_type TEXT,
    subscription_tier TEXT,
    email_verified BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    hedera_account_id TEXT,
    hedera_private_key TEXT
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hedera_account_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hedera_private_key TEXT;
