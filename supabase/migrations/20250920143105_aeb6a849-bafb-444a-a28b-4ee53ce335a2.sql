-- تحديث المستخدمين الموجودين لتطابق الحسابات التجريبية (بدون cybercrime_access)

-- تحديث الحسابات الموجودة لتطابق التسجيلات التجريبية
UPDATE public.profiles SET 
  username = 'noor-khallaf@hotmail.com',
  full_name = 'نور خلاف', 
  role = 'admin',
  badge_number = 'A001',
  phone = '+970-591-123456',
  is_active = true,
  updated_at = now()
WHERE username = 'noor.admin';

UPDATE public.profiles SET 
  username = 'omar@police.com',
  full_name = 'عمر علي', 
  role = 'admin',
  badge_number = 'A002', 
  phone = '+970-591-123457',
  is_active = true,
  updated_at = now()
WHERE username = 'omar.officer';

UPDATE public.profiles SET 
  username = 'ahmad@police.com',
  full_name = 'أحمد محمد', 
  role = 'traffic_police',
  badge_number = 'T001',
  phone = '+970-591-123462',
  is_active = true,
  updated_at = now()
WHERE username = 'ahmad.officer';

UPDATE public.profiles SET 
  username = 'sara@police.com',
  full_name = 'سارة أحمد', 
  role = 'cid',
  badge_number = 'C001',
  phone = '+970-591-123463',
  is_active = true,
  updated_at = now()
WHERE username = 'sara.officer';

UPDATE public.profiles SET 
  username = '192059@ppu.edu.ps',
  full_name = 'محمد علي', 
  role = 'special_police',
  badge_number = 'S001',
  phone = '+970-591-123464',
  is_active = true,
  updated_at = now()
WHERE username = 'ad.off';

UPDATE public.profiles SET 
  username = 'user@police.ps',
  full_name = 'فاطمة خالد', 
  role = 'cybercrime',
  badge_number = 'CY001',
  phone = '+970-591-123465',
  is_active = true,
  updated_at = now()
WHERE username = 'user';

UPDATE public.profiles SET 
  username = 'traffic-manager@police.com',
  full_name = 'ياسر المرور', 
  role = 'traffic_police',
  badge_number = 'TM001',
  phone = '+970-591-123458',
  is_active = true,
  updated_at = now()
WHERE username = 'Test one ';

UPDATE public.profiles SET 
  username = 'cid-manager@police.com',
  full_name = 'خالد المباحث', 
  role = 'cid',
  badge_number = 'CM001',
  phone = '+970-591-123459',
  is_active = true,
  updated_at = now()
WHERE full_name = 'عمر يوزر تجريبي';

UPDATE public.profiles SET 
  username = 'special-manager@police.com',
  full_name = 'سمير الخاصة', 
  role = 'special_police',
  badge_number = 'SM001',
  phone = '+970-591-123460',
  is_active = true,
  updated_at = now()
WHERE full_name = 'قفف';

UPDATE public.profiles SET 
  username = 'cyber-manager@police.com',
  full_name = 'علي السيبراني', 
  role = 'cybercrime',
  badge_number = 'CYM001',
  phone = '+970-591-123461',
  is_active = true,
  updated_at = now()
WHERE username = 'cyber-manager' OR full_name = 'محمد علي سيبراني';

-- تأكد من أن جميع المستخدمين مفعلين
UPDATE public.profiles 
SET is_active = true, updated_at = now();

-- حذف أي حسابات مكررة أو غير مرغوب فيها  
DELETE FROM public.profiles 
WHERE username IN ('لبلبلبابلا')
  OR full_name IN ('لبيلبللب');