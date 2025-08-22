-- Fix cybercrime_access RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Admins can grant cybercrime access" ON public.cybercrime_access;
DROP POLICY IF EXISTS "Admins can update cybercrime access" ON public.cybercrime_access;
DROP POLICY IF EXISTS "Users can view their own cybercrime access" ON public.cybercrime_access;

-- Create new policies that work correctly
CREATE POLICY "Admins can manage cybercrime access" 
ON public.cybercrime_access 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Allow users to view their own access and admins to view all access
CREATE POLICY "Users can view cybercrime access" 
ON public.cybercrime_access 
FOR SELECT 
USING (
  user_id = auth.uid() OR is_admin(auth.uid())
);