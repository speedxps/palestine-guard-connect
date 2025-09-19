-- تفعيل جميع المستخدمين التجريبيين
UPDATE profiles 
SET is_active = true 
WHERE is_active = false;

-- تحديث صلاحيات المستخدمين بناءً على أدوارهم
UPDATE profiles 
SET role = 'traffic_police'::user_role 
WHERE username = 'Test one';

UPDATE profiles 
SET role = 'cybercrime'::user_role 
WHERE username = 'noor.3rjan';

UPDATE profiles 
SET role = 'special_police'::user_role 
WHERE username = 'user';

-- تحديث دور المستخدم أحمد محمد
UPDATE profiles 
SET role = 'traffic_police'::user_role 
WHERE username = 'ahmad.officer';