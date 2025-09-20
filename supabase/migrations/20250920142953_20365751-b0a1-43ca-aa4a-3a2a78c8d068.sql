-- إنشاء المستخدمين التجريبيين في نظام الشرطة الفلسطينية
-- سيتم إنشاء user_ids وهمية ولكن مع إزالة قيد المفتاح الأجنبي مؤقتاً

-- تعطيل قيد المفتاح الأجنبي مؤقتاً لإدراج البيانات التجريبية
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- إدراج المستخدمين التجريبيين
INSERT INTO public.profiles (user_id, username, full_name, role, badge_number, phone, is_active) VALUES
-- المديرون
('11111111-1111-1111-1111-111111111111', 'noor-khallaf@hotmail.com', 'نور خلاف', 'admin', 'A001', '+970-591-123456', true),
('22222222-2222-2222-2222-222222222222', 'omar@police.com', 'عمر علي', 'admin', 'A002', '+970-591-123457', true),

-- مديرو الأقسام  
('33333333-3333-3333-3333-333333333333', 'traffic-manager@police.com', 'ياسر المرور', 'traffic_police', 'TM001', '+970-591-123458', true),
('44444444-4444-4444-4444-444444444444', 'cid-manager@police.com', 'خالد المباحث', 'cid', 'CM001', '+970-591-123459', true),
('55555555-5555-5555-5555-555555555555', 'special-manager@police.com', 'سمير الخاصة', 'special_police', 'SM001', '+970-591-123460', true),
('66666666-6666-6666-6666-666666666666', 'cyber-manager@police.com', 'علي السيبراني', 'cybercrime', 'CYM001', '+970-591-123461', true),

-- موظفو الأقسام
('77777777-7777-7777-7777-777777777777', 'ahmad@police.com', 'أحمد محمد', 'traffic_police', 'T001', '+970-591-123462', true),
('88888888-8888-8888-8888-888888888888', 'sara@police.com', 'سارة أحمد', 'cid', 'C001', '+970-591-123463', true),
('99999999-9999-9999-9999-999999999999', '192059@ppu.edu.ps', 'محمد علي', 'special_police', 'S001', '+970-591-123464', true),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user@police.ps', 'فاطمة خالد', 'cybercrime', 'CY001', '+970-591-123465', true)

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

-- إعادة إضافة قيد المفتاح الأجنبي (اختيارياً - يمكن إزالته للحسابات التجريبية)
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;