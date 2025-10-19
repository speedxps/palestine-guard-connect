-- إنشاء function لإرسال إشعار عند إنشاء مهمة جديدة
CREATE OR REPLACE FUNCTION public.create_task_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- فقط إذا كانت المهمة موزعة على قسم
  IF NEW.department IS NOT NULL THEN
    -- إنشاء إشعار للقسم المحدد
    INSERT INTO public.notifications (
      sender_id,
      title,
      message,
      priority,
      target_departments,
      status,
      action_url
    )
    VALUES (
      NEW.assigned_by,
      'مهمة جديدة',
      'تم تعيين مهمة جديدة: ' || NEW.title,
      'high',
      ARRAY[NEW.department],
      'unread',
      '/department-tasks'
    );
  END IF;

  -- إذا كانت المهمة موجهة لشخص محدد
  IF NEW.assigned_to IS NOT NULL THEN
    INSERT INTO public.notifications (
      sender_id,
      recipient_id,
      title,
      message,
      priority,
      status,
      action_url
    )
    VALUES (
      NEW.assigned_by,
      NEW.assigned_to,
      'مهمة جديدة موجهة لك',
      'تم تعيين مهمة جديدة لك: ' || NEW.title,
      'high',
      'unread',
      '/department-tasks'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- إنشاء trigger على جدول tasks
DROP TRIGGER IF EXISTS on_task_created ON tasks;
CREATE TRIGGER on_task_created
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_task_notification();