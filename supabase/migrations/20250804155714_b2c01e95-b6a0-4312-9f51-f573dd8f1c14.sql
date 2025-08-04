-- تحسين RLS policies لجدول profiles للسماح بمشاهدة جميع المستخدمين للمديرين والضباط
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- السماح للمستخدمين برؤية ملفهم الشخصي فقط
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (user_id = auth.uid());

-- تحديث السياسة للسماح للمديرين والضباط برؤية جميع الملفات الشخصية
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins and Officers can view all profiles" 
ON profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role IN ('admin', 'officer') 
    AND p.is_active = true
  )
  OR user_id = auth.uid()
);