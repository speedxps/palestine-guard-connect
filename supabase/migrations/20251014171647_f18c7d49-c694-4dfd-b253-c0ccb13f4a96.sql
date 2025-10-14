-- Create test users with their profiles and roles
-- Note: In production, users should be created through Supabase Auth UI
-- This is just for setting up user_roles after manual user creation

-- First, let's ensure we have the enum types we need
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'traffic_police', 'cid', 'special_police', 'cybercrime', 'judicial_police', 'officer', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create a function to safely add roles (idempotent)
CREATE OR REPLACE FUNCTION public.add_test_user_role(
  user_email TEXT,
  user_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get user_id from auth.users by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;
  
  -- If user exists, add the role
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, user_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Instructions for manual setup:
-- After creating users in Supabase Auth with these emails:
-- admin@test.com, traffic@test.com, cid@test.com, special@test.com, cyber@test.com, judicial@test.com
-- Run these commands to assign roles:

-- For future use when users are created, create a note table
CREATE TABLE IF NOT EXISTS public.test_users_setup (
  email TEXT PRIMARY KEY,
  role app_role NOT NULL,
  password_hint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test user configurations
INSERT INTO public.test_users_setup (email, role, password_hint) VALUES
  ('admin@test.com', 'admin', 'Test123!'),
  ('traffic@test.com', 'traffic_police', 'Test123!'),
  ('cid@test.com', 'cid', 'Test123!'),
  ('special@test.com', 'special_police', 'Test123!'),
  ('cyber@test.com', 'cybercrime', 'Test123!'),
  ('judicial@test.com', 'judicial_police', 'Test123!')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  password_hint = EXCLUDED.password_hint;

-- Add comment explaining setup process
COMMENT ON TABLE public.test_users_setup IS 'Configuration for test users. Users must be created manually in Supabase Auth, then roles will be auto-assigned via trigger.';

-- Create trigger to auto-assign roles when new users are created
CREATE OR REPLACE FUNCTION public.assign_test_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Check if this email is in test_users_setup
  SELECT role INTO user_role
  FROM public.test_users_setup
  WHERE email = NEW.email;
  
  -- If found, assign the role
  IF user_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_test_user_created ON auth.users;
CREATE TRIGGER on_test_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_test_user_role();