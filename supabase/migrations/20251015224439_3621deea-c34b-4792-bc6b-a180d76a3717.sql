
-- إضافة الأدوار المفقودة للمستخدمين الموجودين
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.user_id,
  CASE 
    WHEN p.role::text = 'admin' THEN 'admin'::app_role
    WHEN p.role::text = 'traffic_police' THEN 'traffic_police'::app_role
    WHEN p.role::text = 'cid' THEN 'cid'::app_role
    WHEN p.role::text = 'special_police' THEN 'special_police'::app_role
    WHEN p.role::text = 'cybercrime' THEN 'cybercrime'::app_role
    WHEN p.role::text = 'judicial_police' THEN 'judicial_police'::app_role
    WHEN p.role::text = 'officer' THEN 'officer'::app_role
    WHEN p.role::text = 'user' THEN 'user'::app_role
    ELSE 'officer'::app_role
  END as role
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.user_id
)
ON CONFLICT (user_id, role) DO NOTHING;
