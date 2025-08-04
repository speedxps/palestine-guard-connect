-- إصلاح مشكلة search_path في الدالة
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT p.role::text FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_active = true;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';