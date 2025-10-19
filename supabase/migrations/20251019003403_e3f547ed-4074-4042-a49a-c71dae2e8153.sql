-- إنشاء function لإرسال إشعار للأدمن عند اكتمال مهمة
CREATE OR REPLACE FUNCTION public.notify_admin_on_task_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- فقط إذا تغيرت الحالة إلى completed
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed' THEN
    -- إنشاء إشعار للأدمن
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
      NEW.assigned_to,
      'تم إكمال مهمة',
      'تم اكتمال تنفيذ المهمة الأمنية: ' || NEW.title || ' من قبل قسم ' || NEW.department::text,
      'high',
      ARRAY['admin'::app_role],
      'unread',
      '/department-tasks'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- إنشاء trigger على جدول tasks للتحديثات
DROP TRIGGER IF EXISTS on_task_completed ON tasks;
CREATE TRIGGER on_task_completed
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_task_completion();