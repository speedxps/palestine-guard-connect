-- Remove the old triggers with CASCADE
DROP TRIGGER IF EXISTS migrate_profile_roles_trigger ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS sync_profile_roles ON public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.migrate_profile_roles() CASCADE;

-- Grant admin role to noor-khallaf@hotmail.com
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find the user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'noor-khallaf@hotmail.com';
  
  IF v_user_id IS NOT NULL THEN
    -- Add admin role to user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Also add all department roles for full access
    INSERT INTO public.user_roles (user_id, role)
    VALUES 
      (v_user_id, 'traffic_police'::app_role),
      (v_user_id, 'cid'::app_role),
      (v_user_id, 'special_police'::app_role),
      (v_user_id, 'cybercrime'::app_role),
      (v_user_id, 'judicial_police'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update profile role (backward compatibility)
    UPDATE public.profiles
    SET role = 'admin'::user_role
    WHERE user_id = v_user_id;
    
    -- Grant cybercrime access
    INSERT INTO public.cybercrime_access (user_id, granted_by, is_active)
    VALUES (v_user_id, v_user_id, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET is_active = true;
    
    RAISE NOTICE 'Successfully granted admin and all department roles to noor-khallaf@hotmail.com';
  ELSE
    RAISE WARNING 'User noor-khallaf@hotmail.com not found in auth.users';
  END IF;
END $$;