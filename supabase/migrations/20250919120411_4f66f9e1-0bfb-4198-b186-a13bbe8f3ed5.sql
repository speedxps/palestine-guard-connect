-- تفعيل جميع المستخدمين التجريبيين وتحديث صلاحياتهم
UPDATE profiles 
SET is_active = true 
WHERE is_active = false;

-- تحديث صلاحيات المستخدمين بناءً على أدوارهم
UPDATE profiles 
SET role = 'traffic_police'::user_role 
WHERE username IN ('ahmad.officer') AND role = 'officer';

UPDATE profiles 
SET role = 'cybercrime'::user_role 
WHERE full_name LIKE '%سايبر%' OR username LIKE '%cyber%';

UPDATE profiles 
SET role = 'special_police'::user_role 
WHERE full_name LIKE '%خاص%' OR username LIKE '%special%';

-- إنشاء بيانات وصول للجرائم السيبرانية للمستخدمين المناسبين
INSERT INTO cybercrime_access (user_id, granted_by, is_active)
SELECT 
    p.id as user_id,
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1) as granted_by,
    true as is_active
FROM profiles p
WHERE p.role IN ('admin', 'cybercrime')
AND NOT EXISTS (
    SELECT 1 FROM cybercrime_access ca WHERE ca.user_id = p.id
);

-- تحديث أدوار المستخدمين التجريبيين لتكون متنوعة
UPDATE profiles 
SET role = 'traffic_police'::user_role 
WHERE username = 'Test one';

UPDATE profiles 
SET role = 'cybercrime'::user_role 
WHERE username = 'noor.3rjan';

UPDATE profiles 
SET role = 'special_police'::user_role 
WHERE username = 'user';