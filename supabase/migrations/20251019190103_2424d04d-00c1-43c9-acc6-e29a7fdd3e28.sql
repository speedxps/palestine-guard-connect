-- إضافة الأدوار الجديدة لـ app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'operations_system';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'borders';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tourism_police';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'joint_operations';

-- تحديث user_role enum أيضاً إن وجد
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'operations_system';
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'borders';
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'tourism_police';
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'joint_operations';
  END IF;
END $$;