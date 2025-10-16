-- إسقاط السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Users can insert their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Users can view relevant tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can delete tickets" ON public.tickets;

-- السماح لجميع المستخدمين المصادق عليهم بإدراج tickets
CREATE POLICY "Authenticated users can insert tickets"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- السماح للمستخدمين برؤية tickets الخاصة بهم أو للـ admin برؤية الكل
CREATE POLICY "Users can view their tickets or admins can view all"
ON public.tickets
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND (
      (tickets.section = 'traffic_police' AND ur.role = 'traffic_police')
      OR (tickets.section = 'cid' AND ur.role = 'cid')
      OR (tickets.section = 'special_police' AND ur.role = 'special_police')
      OR (tickets.section = 'cybercrime' AND ur.role = 'cybercrime')
      OR (tickets.section = 'judicial_police' AND ur.role = 'judicial_police')
      OR (tickets.section = 'admin' AND ur.role = 'admin')
    )
  )
);

-- السماح للـ admin بحذف tickets
CREATE POLICY "Admins can delete tickets"
ON public.tickets
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));