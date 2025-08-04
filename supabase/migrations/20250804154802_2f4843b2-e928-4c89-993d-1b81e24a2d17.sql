-- إضافة مستخدمين تجريبيين جدد مباشرة في قاعدة البيانات

-- إدراج مستخدمين جدد في جدول profiles
INSERT INTO public.profiles (user_id, username, full_name, role, phone, badge_number, is_active) VALUES
-- مستخدم ضابط 1
(gen_random_uuid(), 'khalil.officer', 'خليل أحمد', 'officer', '0599123456', 'OFF001', true),
-- مستخدم ضابط 2  
(gen_random_uuid(), 'fatima.cyber', 'فاطمة محمد', 'officer', '0598654321', 'CYB002', true),
-- مدير جديد
(gen_random_uuid(), 'admin.system', 'مدير النظام', 'admin', '0597111222', 'ADM003', true),
-- ضابط متخصص
(gen_random_uuid(), 'hassan.detective', 'حسن المحقق', 'officer', '0596333444', 'DET004', true),
-- مستخدم عادي
(gen_random_uuid(), 'user.citizen', 'مواطن عادي', 'user', '0595555666', NULL, true)
ON CONFLICT (user_id) DO NOTHING;

-- منح صلاحية الجرائم الإلكترونية لضابط واحد
INSERT INTO public.cybercrime_access (user_id, granted_by, is_active)
SELECT 
  p1.user_id,
  p2.user_id as granted_by,
  true
FROM profiles p1, profiles p2 
WHERE p1.username = 'fatima.cyber' 
  AND p2.role = 'admin' 
  AND p2.is_active = true
LIMIT 1
ON CONFLICT (user_id) DO UPDATE SET is_active = true;