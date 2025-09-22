-- تحديث أدوار المستخدمين ليتطابق مع التوقعات
UPDATE profiles SET role = 'traffic_manager'::user_role WHERE username = 'traffic-manager@police.com';
UPDATE profiles SET role = 'cid_manager'::user_role WHERE username = 'cid-manager@police.com'; 
UPDATE profiles SET role = 'special_manager'::user_role WHERE username = 'special-manager@police.com';
UPDATE profiles SET role = 'cybercrime_manager'::user_role WHERE username = 'cyber-manager@police.com';

-- تحديث الأدوار الحالية لتتطابق مع هيكل الأقسام
UPDATE profiles SET role = 'traffic_manager'::user_role WHERE username = 'ahmad@police.com';
UPDATE profiles SET role = 'cid_manager'::user_role WHERE username = 'sara@police.com';