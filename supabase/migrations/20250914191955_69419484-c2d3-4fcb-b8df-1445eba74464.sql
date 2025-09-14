-- تحديث نوع user_role لتضمين الأقسام الجديدة
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'traffic_police';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cid';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'special_police';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cybercrime';

-- حذف القيم القديمة إذا لزم الأمر (يتطلب تحديث البيانات الموجودة أولاً)
-- يمكن تطبيق هذا لاحقاً إذا أردنا تنظيف الأدوار القديمة
UPDATE profiles SET role = 'admin'::user_role WHERE role = 'admin'::user_role;
UPDATE profiles SET role = 'officer'::user_role WHERE role = 'officer'::user_role;
UPDATE profiles SET role = 'cybercrime'::user_role WHERE role = 'cyber_officer'::user_role;