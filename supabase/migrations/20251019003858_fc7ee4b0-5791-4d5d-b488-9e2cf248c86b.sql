-- حذف الـ trigger القديم والـ function
DROP TRIGGER IF EXISTS on_task_completed ON tasks;
DROP FUNCTION IF EXISTS public.notify_admin_on_task_completion();

-- إنشاء function جديد لإرسال إشعار للأدمن عند تحديث حالة المهمة
CREATE OR REPLACE FUNCTION public.notify_admin_on_task_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_profile_id uuid;
  status_text text;
BEGIN
  -- الحصول على profile ID للمستخدم الحالي
  SELECT id INTO current_user_profile_id
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;

  -- فقط إذا تغيرت الحالة
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- تحديد نص الحالة
    CASE NEW.status
      WHEN 'in_progress' THEN status_text := 'قيد التنفيذ';
      WHEN 'completed' THEN status_text := 'مكتملة';
      ELSE status_text := NEW.status::text;
    END CASE;

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
      COALESCE(current_user_profile_id, NEW.assigned_by),
      'تحديث حالة مهمة',
      'تم تحديث حالة المهمة: ' || NEW.title || ' إلى ' || status_text || 
      CASE 
        WHEN NEW.department IS NOT NULL THEN ' من قبل قسم ' || NEW.department::text
        ELSE ''
      END,
      CASE 
        WHEN NEW.status = 'completed' THEN 'high'::text
        ELSE 'normal'::text
      END,
      ARRAY['admin'::app_role],
      'unread',
      '/department-tasks'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- إنشاء trigger جديد على جدول tasks
CREATE TRIGGER on_task_status_changed
  AFTER UPDATE ON tasks
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_admin_on_task_status_change();