-- ============================================
-- Security Fix 1: Move 2FA from localStorage to Database
-- ============================================

-- Add 2FA columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret text,
ADD COLUMN IF NOT EXISTS two_factor_backup_codes jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS two_factor_setup_at timestamp with time zone;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_two_factor ON public.profiles(user_id) WHERE two_factor_enabled = true;

-- ============================================
-- Security Fix 2: Add Preliminary Auth for Face Login
-- ============================================

-- Add email requirement tracking for face login attempts
ALTER TABLE public.face_login_attempts 
ADD COLUMN IF NOT EXISTS email_provided text,
ADD COLUMN IF NOT EXISTS preliminary_auth_passed boolean DEFAULT false;

-- ============================================
-- Security Fix 3: Encrypt Biometric Data
-- ============================================

-- Add encryption metadata columns
ALTER TABLE public.face_data 
ADD COLUMN IF NOT EXISTS is_encrypted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS encryption_version text DEFAULT 'v1',
ADD COLUMN IF NOT EXISTS face_encoding_hash text;