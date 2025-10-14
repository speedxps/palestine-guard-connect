-- Enable RLS on test_users_setup table
ALTER TABLE public.test_users_setup ENABLE ROW LEVEL SECURITY;

-- Only admins can view test user configurations
CREATE POLICY "Only admins can view test users setup"
ON public.test_users_setup
FOR SELECT
TO authenticated
USING (is_admin_role(auth.uid()));

-- Only admins can manage test users setup
CREATE POLICY "Only admins can manage test users setup"
ON public.test_users_setup
FOR ALL
TO authenticated
USING (is_admin_role(auth.uid()))
WITH CHECK (is_admin_role(auth.uid()));