-- ============================================
-- Security Fix Part 2B: Notifications Table (Fixed)
-- ============================================

-- Drop all existing notification policies to ensure clean slate
DROP POLICY IF EXISTS "Users can view relevant notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own or department notifications" ON public.notifications;

CREATE POLICY "Restrict notification access to authorized users"
ON public.notifications
FOR SELECT
USING (
  recipient_id = get_user_profile(auth.uid()) OR
  is_admin(auth.uid()) OR
  (
    target_departments IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM unnest(target_departments) AS dept
      WHERE has_role(auth.uid(), dept::app_role)
    )
  )
);