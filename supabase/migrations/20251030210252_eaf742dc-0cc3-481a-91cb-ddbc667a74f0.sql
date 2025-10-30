-- Fix vehicle_registrations table - Require proper authorization
DROP POLICY IF EXISTS "Public can view vehicle registrations" ON public.vehicle_registrations;

CREATE POLICY "Traffic police can view vehicle registrations"
ON public.vehicle_registrations
FOR SELECT
USING (
  is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND (ur.role = 'traffic_police'::app_role OR ur.role = 'officer'::app_role)
  )
);