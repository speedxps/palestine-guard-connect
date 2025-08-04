-- إضافة بعض المستخدمين التجريبيين الحقيقيين
-- أولاً نضيف المستخدمين إلى auth.users باستخدام SQL مباشر

-- إدراج مستخدمين في auth.users مع تشفير كلمات المرور
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
-- ضابط جديد 1
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'khalil.officer@police.ps',
  crypt('123123', gen_salt('bf')),
  now(),
  '{"username": "khalil.officer", "full_name": "خليل أحمد", "role": "officer"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
),
-- ضابط جديد 2 (متخصص جرائم إلكترونية)
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 
  'authenticated',
  'fatima.cyber@police.ps',
  crypt('123123', gen_salt('bf')),
  now(),
  '{"username": "fatima.cyber", "full_name": "فاطمة محمد", "role": "officer"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
),
-- مدير جديد
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated', 
  'admin.system@police.ps',
  crypt('123123', gen_salt('bf')),
  now(),
  '{"username": "admin.system", "full_name": "مدير النظام", "role": "admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;