-- ============================================
-- Security Fix Part 1: Patrols, Vehicles, and Security Alerts
-- ============================================

-- 1. Fix patrols table - Only admins, creators, and assigned officers can view
DROP POLICY IF EXISTS "Officers can view all patrol data" ON public.patrols;
DROP POLICY IF EXISTS "Officers can view all patrols" ON public.patrols;

CREATE POLICY "Admins, creators, and patrol members can view patrols"
ON public.patrols
FOR SELECT
USING (
  is_admin(auth.uid()) OR 
  created_by = get_user_profile(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM patrol_members
    WHERE patrol_members.patrol_id = patrols.id
    AND patrol_members.officer_id = get_user_profile(auth.uid())
  )
);

-- 2. Fix vehicle_registrations table - Require proper authorization
DROP POLICY IF EXISTS "Public can view vehicle registrations" ON public.vehicle_registrations;

CREATE POLICY "Authorized users can view vehicle registrations"
ON public.vehicle_registrations
FOR SELECT
USING (
  is_admin(auth.uid()) OR
  has_role(auth.uid(), 'traffic_police'::app_role) OR
  has_role(auth.uid(), 'officer'::app_role)
);

-- 3. Fix vehicle_violations table - Require proper authorization
DROP POLICY IF EXISTS "Public can view vehicle violations" ON public.vehicle_violations;

CREATE POLICY "Authorized users can view vehicle violations"
ON public.vehicle_violations
FOR SELECT
USING (
  is_admin(auth.uid()) OR
  has_role(auth.uid(), 'traffic_police'::app_role) OR
  has_role(auth.uid(), 'officer'::app_role)
);

-- 4. Fix security_alerts table - Require proper authorization
DROP POLICY IF EXISTS "Users can view active alerts" ON public.security_alerts;

CREATE POLICY "Authorized users can view security alerts"
ON public.security_alerts
FOR SELECT
USING (
  is_admin(auth.uid()) OR
  has_cybercrime_access(auth.uid())
);