-- إنشاء سياسات RLS لجدول tasks لضمان أن كل قسم يرى مهامه فقط

-- تمكين RLS على جدول tasks إذا لم يكن ممكناً
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Users can view tasks for their department" ON tasks;
DROP POLICY IF EXISTS "Users can view their assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update task status" ON tasks;

-- سياسة للسماح للمستخدمين برؤية المهام الموجهة لقسمهم
CREATE POLICY "Users can view tasks for their department"
ON tasks
FOR SELECT
USING (
  -- السماح بالرؤية إذا كانت المهمة موجهة لقسم المستخدم
  department IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = tasks.department
  )
  OR
  -- أو إذا كانت المهمة موجهة للمستخدم شخصياً
  assigned_to = get_user_profile(auth.uid())
);

-- سياسة للسماح للأدمن برؤية جميع المهام
CREATE POLICY "Admins can view all tasks"
ON tasks
FOR SELECT
USING (is_admin(auth.uid()));

-- سياسة للسماح بتحديث حالة المهمة
CREATE POLICY "Users can update task status"
ON tasks
FOR UPDATE
USING (
  -- المستخدمون يمكنهم تحديث حالة المهام الموجهة لقسمهم
  (department IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = tasks.department
  ))
  OR
  -- أو المهام الموجهة لهم شخصياً
  assigned_to = get_user_profile(auth.uid())
  OR
  -- أو إذا كانوا أدمن
  is_admin(auth.uid())
)
WITH CHECK (
  -- يمكن تحديث الحالة فقط
  (department IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = tasks.department
  ))
  OR
  assigned_to = get_user_profile(auth.uid())
  OR
  is_admin(auth.uid())
);