-- Fix the trigger to properly handle role types

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function that handles both role types correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role_for_user_roles app_role;
  user_role_for_profile user_role;
BEGIN
  -- Extract role from metadata, default to 'officer'
  user_role_for_user_roles := COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'officer'::app_role);
  
  -- Convert to user_role enum for the profile (for backward compatibility)
  -- Only use values that exist in both enums
  CASE user_role_for_user_roles::text
    WHEN 'admin' THEN user_role_for_profile := 'admin'::user_role;
    WHEN 'traffic_police' THEN user_role_for_profile := 'traffic_police'::user_role;
    WHEN 'cid' THEN user_role_for_profile := 'cid'::user_role;
    WHEN 'special_police' THEN user_role_for_profile := 'special_police'::user_role;
    WHEN 'cybercrime' THEN user_role_for_profile := 'cybercrime'::user_role;
    WHEN 'judicial_police' THEN user_role_for_profile := 'officer'::user_role; -- Map judicial_police to officer
    ELSE user_role_for_profile := 'officer'::user_role;
  END CASE;
  
  -- Create profile with the user_role enum
  INSERT INTO public.profiles (user_id, username, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    user_role_for_profile
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = NEW.email;
  
  -- Add role to user_roles table (using app_role enum)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role_for_user_roles)
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