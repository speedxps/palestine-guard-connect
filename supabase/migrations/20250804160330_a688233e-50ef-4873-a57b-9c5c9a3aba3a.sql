-- التأكد من أن دالة has_cybercrime_access تعمل بشكل صحيح
-- يجب أن تتحقق من user_id في جدول cybercrime_access بدلاً من الاستعلام الخاطئ
CREATE OR REPLACE FUNCTION public.has_cybercrime_access(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.cybercrime_access 
    WHERE cybercrime_access.user_id = has_cybercrime_access.user_id 
    AND is_active = true
  );
$function$;