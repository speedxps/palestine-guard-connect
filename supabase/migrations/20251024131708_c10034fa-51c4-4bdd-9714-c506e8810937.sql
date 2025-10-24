-- Fix RLS policies for agency_communications
-- Drop existing policy and recreate with correct permissions
DROP POLICY IF EXISTS "Users can view their communications" ON public.agency_communications;

-- Users can view communications where:
-- 1. They are the sender
-- 2. They are admin
-- 3. The message targets their department (or targets 'all')
-- 4. The message is from their department
CREATE POLICY "Users can view relevant communications"
ON public.agency_communications
FOR SELECT
USING (
  -- Sender can see their own messages
  (sender_id = get_user_profile(auth.uid())) 
  OR 
  -- Admin can see everything
  is_admin(auth.uid())
  OR
  -- Users can see messages targeted to 'all'
  (target_department = 'all')
  OR
  -- Users can see messages targeted to their department
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role::text = target_department
  ))
  OR
  -- Users can see messages from their department
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role::text = sender_department
  ))
);