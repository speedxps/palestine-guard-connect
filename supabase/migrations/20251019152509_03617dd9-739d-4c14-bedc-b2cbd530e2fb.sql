-- إنشاء trigger لإرسال إشعارات عند إنشاء قضايا بأولوية عالية
CREATE OR REPLACE FUNCTION public.notify_high_priority_cybercrime_case()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_profile_id uuid;
BEGIN
  -- فقط للقضايا بأولوية عالية أو عالية جداً
  IF NEW.priority IN ('high', 'critical') THEN
    -- الحصول على profile المنشئ
    SELECT id INTO sender_profile_id
    FROM public.profiles
    WHERE user_id = auth.uid()
    LIMIT 1;

    -- إنشاء إشعار للأدمن وجميع مستخدمي الجرائم الإلكترونية
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
      COALESCE(sender_profile_id, (SELECT id FROM public.profiles LIMIT 1)),
      '⚠️ قضية جديدة بأولوية عالية',
      'تم إنشاء قضية جديدة بأولوية ' || 
      CASE 
        WHEN NEW.priority = 'critical' THEN 'عالية جداً'
        ELSE 'عالية'
      END || ': ' || NEW.title,
      'high',
      ARRAY['admin'::app_role, 'cybercrime'::app_role],
      'unread',
      '/cybercrime-advanced'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- حذف trigger القديم إذا كان موجوداً
DROP TRIGGER IF EXISTS on_high_priority_cybercrime_case_created ON cybercrime_cases;

-- إنشاء trigger جديد
CREATE TRIGGER on_high_priority_cybercrime_case_created
  AFTER INSERT ON cybercrime_cases
  FOR EACH ROW
  WHEN (NEW.priority IN ('high', 'critical'))
  EXECUTE FUNCTION public.notify_high_priority_cybercrime_case();
