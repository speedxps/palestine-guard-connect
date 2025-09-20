-- تحديث وتفعيل جميع المستخدمين التجريبيين

-- إضافة المستخدم المفقود نور خلاف إذا لم يكن موجوداً
INSERT INTO public.profiles (user_id, username, full_name, role, badge_number, phone, is_active) 
VALUES (gen_random_uuid(), 'noor-khallaf@hotmail.com', 'نور خلاف', 'admin', 'A001', '+970-591-123456', true)
ON CONFLICT (username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  badge_number = EXCLUDED.badge_number,
  phone = EXCLUDED.phone,
  is_active = true,
  updated_at = now();

-- تحديث بيانات المستخدمين الموجودين مع الأدوار والأرقام التشغيلية
UPDATE public.profiles SET
  full_name = CASE 
    WHEN username = 'omar@police.com' THEN 'عمر علي'
    WHEN username = 'traffic-manager@police.com' THEN 'ياسر المرور'
    WHEN username = 'cid-manager@police.com' THEN 'خالد المباحث'
    WHEN username = 'special-manager@police.com' THEN 'سمير الخاصة'
    WHEN username = 'cyber-manager@police.com' THEN 'علي السيبراني'
    WHEN username = 'ahmad@police.com' THEN 'أحمد محمد'
    WHEN username = 'sara@police.com' THEN 'سارة أحمد'
    WHEN username = '192059@ppu.edu.ps' THEN 'محمد علي'
    WHEN username = 'user@police.ps' THEN 'فاطمة خالد'
    ELSE full_name
  END,
  role = CASE 
    WHEN username = 'omar@police.com' THEN 'admin'
    WHEN username = 'traffic-manager@police.com' THEN 'traffic_police'
    WHEN username = 'cid-manager@police.com' THEN 'cid'
    WHEN username = 'special-manager@police.com' THEN 'special_police'
    WHEN username = 'cyber-manager@police.com' THEN 'cybercrime'
    WHEN username = 'ahmad@police.com' THEN 'traffic_police'
    WHEN username = 'sara@police.com' THEN 'cid'
    WHEN username = '192059@ppu.edu.ps' THEN 'special_police'
    WHEN username = 'user@police.ps' THEN 'cybercrime'
    ELSE role
  END,
  badge_number = CASE 
    WHEN username = 'omar@police.com' THEN 'A002'
    WHEN username = 'traffic-manager@police.com' THEN 'TM001'
    WHEN username = 'cid-manager@police.com' THEN 'CM001'
    WHEN username = 'special-manager@police.com' THEN 'SM001'
    WHEN username = 'cyber-manager@police.com' THEN 'CYM001'
    WHEN username = 'ahmad@police.com' THEN 'T001'
    WHEN username = 'sara@police.com' THEN 'C001'
    WHEN username = '192059@ppu.edu.ps' THEN 'S001'
    WHEN username = 'user@police.ps' THEN 'CY001'
    ELSE badge_number
  END,
  phone = CASE 
    WHEN username = 'omar@police.com' THEN '+970-591-123457'
    WHEN username = 'traffic-manager@police.com' THEN '+970-591-123458'
    WHEN username = 'cid-manager@police.com' THEN '+970-591-123459'
    WHEN username = 'special-manager@police.com' THEN '+970-591-123460'
    WHEN username = 'cyber-manager@police.com' THEN '+970-591-123461'
    WHEN username = 'ahmad@police.com' THEN '+970-591-123462'
    WHEN username = 'sara@police.com' THEN '+970-591-123463'
    WHEN username = '192059@ppu.edu.ps' THEN '+970-591-123464'
    WHEN username = 'user@police.ps' THEN '+970-591-123465'
    ELSE phone
  END,
  is_active = true,
  updated_at = now()
WHERE username IN (
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

-- إضافة صلاحيات الجرائم الإلكترونية للمستخدمين الذين يحتاجونها
INSERT INTO public.cybercrime_access (user_id, granted_by, is_active)
SELECT 
  p.user_id,
  (SELECT user_id FROM public.profiles WHERE role = 'admin' AND is_active = true LIMIT 1) as granted_by,
  true as is_active
FROM public.profiles p 
WHERE p.role IN ('cybercrime', 'admin') 
  AND p.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.cybercrime_access ca 
    WHERE ca.user_id = p.user_id AND ca.is_active = true
  );

-- التأكد من تفعيل جميع المستخدمين التجريبيين
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