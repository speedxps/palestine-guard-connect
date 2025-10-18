-- إنشاء دالة لإنشاء إشعارات المهام الجديدة للقسم
CREATE OR REPLACE FUNCTION public.create_task_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile_record RECORD;
  assigner_profile_id uuid;
BEGIN
  -- فقط إذا كانت المهمة موزعة على قسم
  IF NEW.department IS NOT NULL THEN
    
    -- الحصول على profile_id للمستخدم الذي أضاف المهمة
    SELECT id INTO assigner_profile_id
    FROM public.profiles
    WHERE id = NEW.assigned_by
    LIMIT 1;

    -- إنشاء إشعار لكل مستخدم في القسم المحدد
    FOR user_profile_record IN 
      SELECT DISTINCT p.id as profile_id
      FROM public.profiles p
      INNER JOIN public.user_roles ur ON ur.user_id = p.user_id
      WHERE ur.role = NEW.department
        AND p.is_active = true
        AND p.id != NEW.assigned_by  -- لا نرسل إشعار للمستخدم الذي أضاف المهمة
    LOOP
      INSERT INTO public.notifications (
        recipient_id,
        sender_id,
        title,
        message,
        priority,
        status,
        action_url
      )
      VALUES (
        user_profile_record.profile_id,
        assigner_profile_id,
        'مهمة جديدة لقسمك',
        'تم تعيين مهمة جديدة: ' || NEW.title || ' لقسمكم',
        'high',
        'unread',
        '/department-tasks'
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- إنشاء trigger لإطلاق الدالة عند إضافة مهمة جديدة
DROP TRIGGER IF EXISTS trigger_task_notification ON public.tasks;

CREATE TRIGGER trigger_task_notification
AFTER INSERT ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.create_task_notification();