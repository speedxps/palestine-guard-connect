-- إضافة المستخدمين التجريبيين لنظام الشرطة الفلسطينية

-- إدراج المستخدمين في جدول auth.users (محاكاة إنشاء الحسابات)
-- ملاحظة: في التطبيق الحقيقي، يتم إنشاء هذه الحسابات عبر API التسجيل

-- إدراج البروفايلات للمستخدمين التجريبيين
INSERT INTO public.profiles (user_id, username, full_name, role, badge_number, phone, is_active) VALUES
-- المديرون
(gen_random_uuid(), 'noor-khallaf@hotmail.com', 'نور خلاف', 'admin', 'A001', '+970-591-123456', true),
(gen_random_uuid(), 'omar@police.com', 'عمر علي', 'admin', 'A002', '+970-591-123457', true),

-- مديرو الأقسام  
(gen_random_uuid(), 'traffic-manager@police.com', 'ياسر المرور', 'traffic_police', 'TM001', '+970-591-123458', true),
(gen_random_uuid(), 'cid-manager@police.com', 'خالد المباحث', 'cid', 'CM001', '+970-591-123459', true),
(gen_random_uuid(), 'special-manager@police.com', 'سمير الخاصة', 'special_police', 'SM001', '+970-591-123460', true),
(gen_random_uuid(), 'cyber-manager@police.com', 'علي السيبراني', 'cybercrime', 'CYM001', '+970-591-123461', true),

-- موظفو الأقسام
(gen_random_uuid(), 'ahmad@police.com', 'أحمد محمد', 'traffic_police', 'T001', '+970-591-123462', true),
(gen_random_uuid(), 'sara@police.com', 'سارة أحمد', 'cid', 'C001', '+970-591-123463', true),
(gen_random_uuid(), '192059@ppu.edu.ps', 'محمد علي', 'special_police', 'S001', '+970-591-123464', true),
(gen_random_uuid(), 'user@police.ps', 'فاطمة خالد', 'cybercrime', 'CY001', '+970-591-123465', true)

ON CONFLICT (username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  badge_number = EXCLUDED.badge_number,
  phone = EXCLUDED.phone,
  is_active = true,
  updated_at = now();

-- إضافة صلاحيات الجرائم الإلكترونية للمستخدمين المناسبين
INSERT INTO public.cybercrime_access (user_id, granted_by, is_active)
SELECT 
  p.id as user_id,
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1) as granted_by,
  true as is_active
FROM public.profiles p 
WHERE p.role IN ('cybercrime', 'admin')
  AND NOT EXISTS (
    SELECT 1 FROM public.cybercrime_access ca 
    WHERE ca.user_id = p.id
  );

-- تحديث جميع المستخدمين التجريبيين ليكونوا نشطين
UPDATE public.profiles 
SET is_active = true, updated_at = now()
WHERE username IN (
  'noor-khallaf@hotmail.com',
  'omar@police.com', 
  'traffic-manager@police.com',
  'cid-manager@police.com',
  'special-manager@police.com',
  'cyber-manager@police.com',
  'ahmad@police.com',
  'sara@police.com',
  '192059@ppu.edu.ps',
  'user@police.ps'
);