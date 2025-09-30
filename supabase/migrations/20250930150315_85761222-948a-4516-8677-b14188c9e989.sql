-- Fix Remaining Critical Security Issues: Restrict Public Access to Sensitive Data

-- 1. Fix family_members table - Remove public read access
-- This table contains sensitive family relationships and national IDs
DROP POLICY IF EXISTS "Public can view family members" ON family_members;

CREATE POLICY "Authorized users can view family members"
ON family_members
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()) OR get_current_user_role() = 'officer');

-- 2. Fix wanted_persons table - Remove public read access
-- This table contains sensitive law enforcement investigation data
DROP POLICY IF EXISTS "Public can view wanted persons" ON wanted_persons;

CREATE POLICY "Authorized users can view wanted persons"
ON wanted_persons
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()) OR get_current_user_role() = 'officer');