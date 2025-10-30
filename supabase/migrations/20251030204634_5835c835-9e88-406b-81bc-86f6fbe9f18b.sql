-- حذف جميع السياسات الحالية على جدول profiles
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- سياسة SELECT: المستخدمون يمكنهم رؤية ملفهم الشخصي فقط أو إذا كانوا أدمن
CREATE POLICY "Users can view own profile or admins can view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id OR is_admin(auth.uid())
);

-- سياسة UPDATE: المستخدمون يمكنهم تحديث ملفهم الشخصي فقط أو إذا كانوا أدمن
CREATE POLICY "Users can update own profile or admins can update all"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = user_id OR is_admin(auth.uid())
)
WITH CHECK (
  auth.uid() = user_id OR is_admin(auth.uid())
);

-- سياسة INSERT: الأدمن فقط أو إنشاء الملف الشخصي الخاص
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR is_admin(auth.uid())
);

-- سياسة DELETE: الأدمن فقط
CREATE POLICY "Only admins can delete profiles"
ON public.profiles
FOR DELETE
USING (
  is_admin(auth.uid())
);