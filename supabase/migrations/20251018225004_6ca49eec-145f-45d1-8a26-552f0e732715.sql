-- إضافة RLS policy للسماح بحذف الإشعارات من قبل المرسل أو الأدمن
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete all notifications" ON public.notifications;

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (sender_id = get_user_profile(auth.uid()));

CREATE POLICY "Admins can delete all notifications" 
ON public.notifications 
FOR DELETE 
USING (is_admin(auth.uid()));