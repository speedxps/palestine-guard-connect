-- إضافة سياسة INSERT و UPDATE لجدول vehicle_registrations
-- السماح للمستخدمين المصرح لهم بإضافة وتعديل المركبات

DROP POLICY IF EXISTS "Admins can manage vehicle registrations" ON public.vehicle_registrations;

-- سياسة للإدمن للقراءة والحذف
CREATE POLICY "Admins can manage vehicle registrations"
ON public.vehicle_registrations
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- سياسة للمستخدمين العاديين للإضافة
CREATE POLICY "Authenticated users can insert vehicles"
ON public.vehicle_registrations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- سياسة للمستخدمين العاديين للتحديث
CREATE POLICY "Authenticated users can update vehicles"
ON public.vehicle_registrations
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);