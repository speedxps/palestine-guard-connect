-- Create the app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM (
        'admin', 
        'traffic_police', 
        'cid', 
        'special_police', 
        'cybercrime', 
        'officer', 
        'user',
        'traffic_manager',
        'cid_manager',
        'special_manager', 
        'cybercrime_manager'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the profiles table to use the enum if it's not already using it
DO $$ BEGIN
    ALTER TABLE public.profiles 
    ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;
EXCEPTION
    WHEN others THEN
        -- If column doesn't exist or other error, add the column
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS role public.app_role DEFAULT 'officer';
END $$;