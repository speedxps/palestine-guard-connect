-- إضافة صلاحية DELETE للمستخدمين المخولين في جدول citizens
DROP POLICY IF EXISTS "Authorized users can delete citizens" ON public.citizens;

CREATE POLICY "Authorized users can delete citizens" 
ON public.citizens 
FOR DELETE 
USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()));