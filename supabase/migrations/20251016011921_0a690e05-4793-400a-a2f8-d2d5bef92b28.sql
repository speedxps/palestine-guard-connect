-- إضافة صلاحيات حذف للمستخدمين في جميع الجداول المرتبطة

-- 1. profiles table - السماح للأدمن بحذف البروفايلات
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (is_admin(auth.uid()));

-- 2. user_roles table - السماح للأدمن بحذف أدوار المستخدمين
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (is_admin(auth.uid()));

-- 3. activity_logs table - السماح للأدمن بحذف سجلات النشاط
DROP POLICY IF EXISTS "Admins can delete activity logs" ON public.activity_logs;
CREATE POLICY "Admins can delete activity logs" 
ON public.activity_logs 
FOR DELETE 
USING (is_admin(auth.uid()));

-- 4. face_data table - السماح للأدمن بحذف بيانات الوجه
DROP POLICY IF EXISTS "Admins can delete face data" ON public.face_data;
CREATE POLICY "Admins can delete face data" 
ON public.face_data 
FOR DELETE 
USING (is_admin(auth.uid()));

-- 5. التأكد من إمكانية حذف السجلات المرتبطة بالمستخدمين
-- news_reads - السماح بالحذف عند حذف المستخدم
DROP POLICY IF EXISTS "Admins can delete news reads" ON public.news_reads;
CREATE POLICY "Admins can delete news reads" 
ON public.news_reads 
FOR DELETE 
USING (is_admin(auth.uid()));

-- notification_views - السماح بالحذف عند حذف المستخدم
DROP POLICY IF EXISTS "Admins can delete notification views" ON public.notification_views;
CREATE POLICY "Admins can delete notification views" 
ON public.notification_views 
FOR DELETE 
USING (is_admin(auth.uid()));

-- cybercrime_access - السماح للأدمن بحذف صلاحيات الجرائم الإلكترونية
DROP POLICY IF EXISTS "Admins can delete cybercrime access" ON public.cybercrime_access;
CREATE POLICY "Admins can delete cybercrime access" 
ON public.cybercrime_access 
FOR DELETE 
USING (is_admin(auth.uid()));