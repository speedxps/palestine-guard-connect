-- إنشاء المستخدمين التجريبيين للأقسام الجديدة
-- يجب على المستخدم تشغيل هذا SQL في Supabase Dashboard لأن إنشاء المستخدمين يتطلب service_role

-- ملاحظة: هذه الاستعلامات يجب تشغيلها في Supabase Dashboard SQL Editor مع صلاحيات service_role

-- 1. مستخدم قسم العمليات وإدارة الجهاز
-- يرجى تشغيل هذا في Dashboard:
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
-- VALUES (gen_random_uuid(), 'admin_ops@test.com', crypt('123123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"operations_system"}', now(), now());

-- إضافة الملفات الشخصية والأدوار للمستخدمين الجدد في حال وُجدوا
DO $$
DECLARE
  ops_user_id uuid;
  border_user_id uuid;
  tourism_user_id uuid;
  joint_user_id uuid;
BEGIN
  -- البحث عن معرفات المستخدمين إذا كانوا موجودين
  SELECT id INTO ops_user_id FROM auth.users WHERE email = 'admin_ops@test.com' LIMIT 1;
  SELECT id INTO border_user_id FROM auth.users WHERE email = 'border_admin@test.com' LIMIT 1;
  SELECT id INTO tourism_user_id FROM auth.users WHERE email = 'tourism_admin@test.com' LIMIT 1;
  SELECT id INTO joint_user_id FROM auth.users WHERE email = 'joint_admin@test.com' LIMIT 1;

  -- إضافة الأدوار للمستخدمين إذا كانوا موجودين
  IF ops_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (ops_user_id, 'operations_system'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.profiles (user_id, email, full_name, created_at, updated_at, is_active)
    VALUES (ops_user_id, 'admin_ops@test.com', 'مدير العمليات والجهاز', now(), now(), true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  IF border_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (border_user_id, 'borders'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.profiles (user_id, email, full_name, created_at, updated_at, is_active)
    VALUES (border_user_id, 'border_admin@test.com', 'مدير المعابر والحدود', now(), now(), true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  IF tourism_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (tourism_user_id, 'tourism_police'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.profiles (user_id, email, full_name, created_at, updated_at, is_active)
    VALUES (tourism_user_id, 'tourism_admin@test.com', 'مدير الشرطة السياحية', now(), now(), true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  IF joint_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (joint_user_id, 'joint_operations'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.profiles (user_id, email, full_name, created_at, updated_at, is_active)
    VALUES (joint_user_id, 'joint_admin@test.com', 'مدير العمليات المشتركة', now(), now(), true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

END $$;