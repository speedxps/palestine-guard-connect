-- Add new manager roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'traffic_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cid_manager';  
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'special_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cybercrime_manager';

-- Update profiles table role column to use the updated enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;