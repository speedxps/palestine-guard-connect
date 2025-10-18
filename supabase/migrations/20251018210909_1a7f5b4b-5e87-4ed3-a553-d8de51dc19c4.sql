-- تحديث سياسات RLS لجدول citizens للسماح لجميع المستخدمين المسجلين بالعرض
DROP POLICY IF EXISTS "Authorized users can view citizens" ON public.citizens;

CREATE POLICY "Authenticated users can view citizens"
ON public.citizens
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- تحديث سياسات التعديل لتبقى مقتصرة على الإدمن
DROP POLICY IF EXISTS "Authorized users can update citizens" ON public.citizens;

CREATE POLICY "Admin and cybercrime can update citizens"
ON public.citizens
FOR UPDATE
USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()))
WITH CHECK (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()));