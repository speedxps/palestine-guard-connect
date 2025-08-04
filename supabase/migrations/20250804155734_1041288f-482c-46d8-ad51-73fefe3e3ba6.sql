-- إزالة السياسة المشكلة وإنشاء دالة آمنة
DROP POLICY IF EXISTS "Admins and Officers can view all profiles" ON profiles;

-- إنشاء دالة آمنة للتحقق من دور المستخدم الحالي
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT p.role::text FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_active = true;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- إنشاء سياسة جديدة آمنة باستخدام الدالة
CREATE POLICY "Role based profile access" 
ON profiles FOR SELECT 
USING (
  CASE 
    WHEN public.get_current_user_role() IN ('admin', 'officer') THEN true
    WHEN user_id = auth.uid() THEN true
    ELSE false
  END
);