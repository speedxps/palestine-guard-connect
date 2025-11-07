-- إضافة RLS policies لإدارة user_face_data من قبل الأدمن

-- السماح للأدمن بعرض جميع السجلات
CREATE POLICY "Admin can view all face data"
ON user_face_data
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- السماح للأدمن بتحديث جميع السجلات
CREATE POLICY "Admin can update all face data"
ON user_face_data
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- السماح للأدمن بحذف جميع السجلات
CREATE POLICY "Admin can delete all face data"
ON user_face_data
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- السماح للمستخدمين بعرض وتحديث بياناتهم الخاصة
CREATE POLICY "Users can view own face data"
ON user_face_data
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own face data"
ON user_face_data
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());