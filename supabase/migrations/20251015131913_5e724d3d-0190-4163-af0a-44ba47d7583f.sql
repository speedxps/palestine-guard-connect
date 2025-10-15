-- Fix roles system and unblock user creation
-- 1) Ensure enums exist with all required values
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM (
      'admin','traffic_police','cid','special_police','cybercrime','judicial_police','officer','user'
    );
  END IF;
END $$;

DO $$ BEGIN
  -- Add any missing values for user_role
  PERFORM 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
   WHERE t.typname = 'user_role' AND e.enumlabel = 'admin';
  IF NOT FOUND THEN ALTER TYPE public.user_role ADD VALUE 'admin'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'traffic_police';
  IF NOT FOUND THEN ALTER TYPE public.user_role ADD VALUE 'traffic_police'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'cid';
  IF NOT FOUND THEN ALTER TYPE public.user_role ADD VALUE 'cid'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'special_police';
  IF NOT FOUND THEN ALTER TYPE public.user_role ADD VALUE 'special_police'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'cybercrime';
  IF NOT FOUND THEN ALTER TYPE public.user_role ADD VALUE 'cybercrime'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'judicial_police';
  IF NOT FOUND THEN ALTER TYPE public.user_role ADD VALUE 'judicial_police'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'officer';
  IF NOT FOUND THEN ALTER TYPE public.user_role ADD VALUE 'officer'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'user';
  IF NOT FOUND THEN ALTER TYPE public.user_role ADD VALUE 'user'; END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM (
      'admin','traffic_police','cid','special_police','cybercrime','judicial_police','officer','user'
    );
  END IF;
END $$;

DO $$ BEGIN
  -- Add any missing values for app_role
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'admin';
  IF NOT FOUND THEN ALTER TYPE public.app_role ADD VALUE 'admin'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'traffic_police';
  IF NOT FOUND THEN ALTER TYPE public.app_role ADD VALUE 'traffic_police'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'cid';
  IF NOT FOUND THEN ALTER TYPE public.app_role ADD VALUE 'cid'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'special_police';
  IF NOT FOUND THEN ALTER TYPE public.app_role ADD VALUE 'special_police'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'cybercrime';
  IF NOT FOUND THEN ALTER TYPE public.app_role ADD VALUE 'cybercrime'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'judicial_police';
  IF NOT FOUND THEN ALTER TYPE public.app_role ADD VALUE 'judicial_police'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'officer';
  IF NOT FOUND THEN ALTER TYPE public.app_role ADD VALUE 'officer'; END IF;
  PERFORM 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'user';
  IF NOT FOUND THEN ALTER TYPE public.app_role ADD VALUE 'user'; END IF;
END $$;

-- 2) Ensure profiles.role uses user_role to avoid type mismatches
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='role'
  ) THEN
    -- If it's not already user_role, convert it
    PERFORM 1
    FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='role' AND udt_name='user_role';
    IF NOT FOUND THEN
      ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
      -- Convert via text to handle either enum name
      ALTER TABLE public.profiles ALTER COLUMN role TYPE public.user_role USING role::text::public.user_role;
      ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'officer'::public.user_role;
    END IF;
  END IF;
END $$;

-- 3) Ensure user_roles table exists and is properly secured
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4) Update helper functions to rely on user_roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = COALESCE(is_admin.user_id, auth.uid())
      AND ur.role = 'admin'
  );
$$;

-- 5) RLS policies for user_roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Users and admins can view roles'
  ) THEN
    CREATE POLICY "Users and admins can view roles"
    ON public.user_roles
    FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Admins can manage roles'
  ) THEN
    CREATE POLICY "Admins can manage roles"
    ON public.user_roles
    FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;
END $$;

-- 6) Ensure default for profiles.role is correct
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'officer'::public.user_role;
