-- تحديث كلمات المرور لجميع المستخدمين الموجودين لتكون 123123
UPDATE auth.users 
SET encrypted_password = crypt('123123', gen_salt('bf'))
WHERE email IN (
  'noor-khallaf@hotmail.com',
  'omar@police.com', 
  'ahmad@police.com',
  'sara@police.com',
  '192059@ppu.edu.ps',
  'user@police.ps'
);

-- تحديث تاريخ آخر تحديث
UPDATE auth.users 
SET updated_at = now()
WHERE email IN (
  'noor-khallaf@hotmail.com',
  'omar@police.com', 
  'ahmad@police.com',
  'sara@police.com',
  '192059@ppu.edu.ps',
  'user@police.ps'
);