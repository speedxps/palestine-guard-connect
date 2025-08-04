-- منح صلاحية الجرائم الإلكترونية لبعض الضباط
INSERT INTO cybercrime_access (user_id, granted_by, is_active)
SELECT 
  sara_profile.user_id,
  admin_profile.user_id,
  true
FROM profiles sara_profile, profiles admin_profile
WHERE sara_profile.username = 'sara.officer'
  AND admin_profile.role = 'admin'
  AND admin_profile.is_active = true
LIMIT 1
ON CONFLICT (user_id) DO UPDATE SET is_active = true;

-- منح صلاحية الجرائم الإلكترونية لضابط آخر
INSERT INTO cybercrime_access (user_id, granted_by, is_active)
SELECT 
  noor_profile.user_id,
  admin_profile.user_id,
  true
FROM profiles noor_profile, profiles admin_profile
WHERE noor_profile.username = 'noor.3rjan'
  AND admin_profile.role = 'admin'
  AND admin_profile.is_active = true
LIMIT 1
ON CONFLICT (user_id) DO UPDATE SET is_active = true;