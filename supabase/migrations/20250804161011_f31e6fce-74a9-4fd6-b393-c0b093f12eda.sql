-- إصلاح سياسة RLS لجدول cybercrime_access
-- المشكلة أن الإدراج يتطلب granted_by كـ profile id وليس user_id

-- أولاً إزالة السياسة الحالية الخاطئة وإنشاء سياسة صحيحة
DROP POLICY IF EXISTS "Users can view their own cybercrime access" ON public.cybercrime_access;

-- سياسة للعرض - المستخدمون يمكنهم رؤية صلاحياتهم
CREATE POLICY "Users can view their own cybercrime access"
ON public.cybercrime_access
FOR SELECT
USING (user_id = auth.uid());

-- سياسة للإدراج - فقط المديرون يمكنهم منح الصلاحيات
CREATE POLICY "Admins can grant cybercrime access"
ON public.cybercrime_access
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- سياسة للتحديث - فقط المديرون يمكنهم تعديل الصلاحيات
CREATE POLICY "Admins can update cybercrime access"
ON public.cybercrime_access
FOR UPDATE
USING (is_admin(auth.uid()));