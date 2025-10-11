-- Check if app_role enum exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM (
          'admin',
          'traffic_police',
          'cid',
          'special_police',
          'cybercrime',
          'judicial_police',
          'officer',
          'user'
        );
    ELSE
        -- Add judicial_police if it doesn't exist
        ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'judicial_police';
    END IF;
END $$;

-- Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  );
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid() OR is_admin_role(auth.uid()));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (is_admin_role(auth.uid()))
WITH CHECK (is_admin_role(auth.uid()));

-- Update notifications table
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS target_departments TEXT[],
ADD COLUMN IF NOT EXISTS is_system_wide BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- Add check constraint for priority if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notifications_priority_check'
    ) THEN
        ALTER TABLE public.notifications 
        ADD CONSTRAINT notifications_priority_check 
        CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
    END IF;
END $$;

-- Update RLS policy for notifications
DROP POLICY IF EXISTS "Authenticated users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view relevant notifications" ON public.notifications;

CREATE POLICY "Users can view relevant notifications"
ON public.notifications
FOR SELECT
USING (
  is_system_wide = true OR
  recipient_id = get_user_profile(auth.uid()) OR
  recipient_id IS NULL OR
  is_admin_role(auth.uid()) OR
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role::text = ANY(target_departments)
  )
);

-- Create trigger to migrate existing profile roles
CREATE OR REPLACE FUNCTION public.migrate_profile_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, NEW.role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_roles ON public.profiles;
CREATE TRIGGER sync_profile_roles
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.migrate_profile_roles();