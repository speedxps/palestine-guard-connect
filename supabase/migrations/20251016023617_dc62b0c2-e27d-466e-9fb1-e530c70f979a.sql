-- Enable realtime for internal_news table
ALTER TABLE internal_news REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE internal_news;

-- Enable realtime for notifications table
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Function to create notification when news is published
CREATE OR REPLACE FUNCTION public.create_news_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_profile_id uuid;
BEGIN
  -- Only create notification if the news is published
  IF NEW.is_published = true AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.is_published = false)) THEN
    -- Get the profile id of the author
    SELECT id INTO sender_profile_id
    FROM public.profiles
    WHERE user_id = NEW.author_id
    LIMIT 1;

    -- Create system-wide notification if profile exists
    IF sender_profile_id IS NOT NULL THEN
      INSERT INTO public.notifications (
        sender_id,
        title,
        message,
        priority,
        is_system_wide,
        status
      )
      VALUES (
        sender_profile_id,
        'خبر جديد',
        'تم نشر خبر جديد: ' || NEW.title,
        'normal',
        true,
        'unread'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for new news notifications
DROP TRIGGER IF EXISTS trigger_create_news_notification ON internal_news;
CREATE TRIGGER trigger_create_news_notification
  AFTER INSERT OR UPDATE ON internal_news
  FOR EACH ROW
  EXECUTE FUNCTION public.create_news_notification();