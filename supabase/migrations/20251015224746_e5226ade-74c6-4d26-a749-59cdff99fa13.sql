
-- حذف الـ triggers والدوال الموجودة
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_test_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.assign_test_user_role() CASCADE;

-- إنشاء دالة جديدة لإنشاء المستخدمين بشكل صحيح
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value text;
  profile_role_value user_role;
BEGIN
  -- استخراج الدور من البيانات الوصفية
  user_role_value := COALESCE(NEW.raw_user_meta_data ->> 'role', 'officer');
  
  -- تحويل إلى user_role للبروفايل
  CASE user_role_value
    WHEN 'admin' THEN profile_role_value := 'admin'::user_role;
    WHEN 'traffic_police' THEN profile_role_value := 'traffic_police'::user_role;
    WHEN 'cid' THEN profile_role_value := 'cid'::user_role;
    WHEN 'special_police' THEN profile_role_value := 'special_police'::user_role;
    WHEN 'cybercrime' THEN profile_role_value := 'cybercrime'::user_role;
    WHEN 'judicial_police' THEN profile_role_value := 'officer'::user_role;
    WHEN 'officer' THEN profile_role_value := 'officer'::user_role;
    WHEN 'user' THEN profile_role_value := 'officer'::user_role;
    ELSE profile_role_value := 'officer'::user_role;
  END CASE;
  
  -- إنشاء البروفايل
  INSERT INTO public.profiles (user_id, username, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    profile_role_value
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  
  -- إضافة الدور إلى جدول user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    user_role_value::app_role
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- تسجيل الخطأ والمتابعة
    RAISE WARNING 'خطأ في إنشاء بروفايل للمستخدم %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- إعادة إنشاء الـ trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- منح الصلاحيات اللازمة
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO supabase_auth_admin;
