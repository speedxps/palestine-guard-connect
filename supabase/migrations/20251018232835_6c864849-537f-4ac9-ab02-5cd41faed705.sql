-- إضافة عمود القسم إلى جدول المهام
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS department app_role;

-- إضافة عمود القسم إلى جدول الدوريات
ALTER TABLE patrols
ADD COLUMN IF NOT EXISTS department app_role;

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_tasks_department ON tasks(department);
CREATE INDEX IF NOT EXISTS idx_patrols_department ON patrols(department);

-- تحديث RLS policies للمهام لتشمل الأقسام
DROP POLICY IF EXISTS "Officers can view tasks they reported or are assigned to" ON tasks;

CREATE POLICY "Officers can view tasks in their department or assigned to them"
ON tasks
FOR SELECT
USING (
  (assigned_to = get_user_profile(auth.uid())) 
  OR (assigned_by = get_user_profile(auth.uid()))
  OR is_admin(auth.uid())
  OR (department IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() 
    AND role = tasks.department
  ))
);

-- تحديث RLS policies للدوريات لتشمل الأقسام
DROP POLICY IF EXISTS "Users can view patrols" ON patrols;

CREATE POLICY "Users can view patrols in their department"
ON patrols
FOR SELECT
USING (
  is_admin(auth.uid())
  OR (department IS NOT NULL AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() 
    AND role = patrols.department
  ))
  OR created_by = get_user_profile(auth.uid())
);

-- السماح بإنشاء المهام مع تحديد القسم
DROP POLICY IF EXISTS "Officers can create tasks" ON tasks;

CREATE POLICY "Officers can create tasks"
ON tasks
FOR INSERT
WITH CHECK (assigned_by = get_user_profile(auth.uid()));

-- السماح بإنشاء الدوريات مع تحديد القسم
DROP POLICY IF EXISTS "Users can create patrols" ON patrols;

CREATE POLICY "Users can create patrols"
ON patrols
FOR INSERT
WITH CHECK (
  is_admin(auth.uid())
  OR created_by = get_user_profile(auth.uid())
);