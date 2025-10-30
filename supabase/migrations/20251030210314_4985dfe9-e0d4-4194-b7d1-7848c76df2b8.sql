-- ============================================
-- Security Fix Part 2: Notifications Table (Fixed)
-- ============================================

-- Fix notifications table - Restrict system-wide visibility
DROP POLICY IF EXISTS "Users can view relevant notifications" ON public.notifications;

CREATE POLICY "Users can view their own or department notifications"
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