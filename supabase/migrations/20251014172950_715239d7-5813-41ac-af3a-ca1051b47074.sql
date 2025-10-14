-- Ensure RLS for user_roles to allow users to read their own roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='user_roles'
  ) THEN
    -- Create user_roles table if missing (should already exist)
    CREATE TABLE public.user_roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      role app_role NOT NULL,
      UNIQUE (user_id, role)
    );
  END IF;
END $$;

-- Enable RLS (idempotent)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='user_roles' AND policyname='Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR is_admin(auth.uid()));
  END IF;
END $$;
