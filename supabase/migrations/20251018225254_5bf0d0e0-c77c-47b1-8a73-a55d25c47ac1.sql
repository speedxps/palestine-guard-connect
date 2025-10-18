-- إصلاح policy إدراج الإشعارات للسماح للمستخدمين بإنشاء إشعارات
DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;

CREATE POLICY "Users can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  -- السماح للمستخدم بإنشاء إشعار إذا كان sender_id يطابق profile_id الخاص به
  sender_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  OR is_admin(auth.uid())
);