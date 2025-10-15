-- Fix user creation issues by aligning role types and triggers

-- First, drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a new trigger that creates profile and adds role to user_roles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Extract role from metadata, default to 'officer'
  user_role := COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'officer'::app_role);
  
  -- Create profile without role (role is managed in user_roles table)
  INSERT INTO public.profiles (user_id, username, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = NEW.email;
  
  -- Add role to user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Failed to create profile/role for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also ensure the migrate_profile_roles trigger is dropped (no longer needed)
DROP TRIGGER IF EXISTS migrate_profile_roles_trigger ON public.profiles;

-- Make role column in profiles nullable and add comment explaining it's deprecated
COMMENT ON COLUMN public.profiles.role IS 'DEPRECATED: Roles are now managed in user_roles table. This column is kept for backward compatibility only.';