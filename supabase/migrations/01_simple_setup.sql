-- =============================================
-- SIMPLIFIED Database Setup for AZ-Genes
-- Run this FIRST to create basic tables
-- =============================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  user_role TEXT NOT NULL CHECK (user_role IN ('patient', 'doctor', 'researcher')),
  subscription_tier TEXT DEFAULT 'F1' CHECK (subscription_tier IN ('F1', 'F2', 'F3')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  auth_type TEXT DEFAULT 'email' CHECK (auth_type IN ('email', 'wallet')),
  wallet_address TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create indexes on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_type ON profiles(auth_type);
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);

-- 3. Create OTP verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes on OTP table
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_verified ON otp_verifications(verified);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_verifications(expires_at);

-- 5. Auto-delete expired OTPs function
CREATE OR REPLACE FUNCTION delete_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_verifications
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 6. Add comments
COMMENT ON TABLE profiles IS 'User profiles supporting both email and wallet authentication';
COMMENT ON TABLE otp_verifications IS 'Stores OTP codes for email verification during signup';

-- ✅ Basic Setup Complete!
-- You can add RLS policies later if needed
