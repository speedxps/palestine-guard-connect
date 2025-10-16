-- Add news_id and action_url columns to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS news_id uuid REFERENCES internal_news(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS action_url text;

-- Update the trigger function to include news_id and action_url
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
        status,
        news_id,
        action_url
      )
      VALUES (
        sender_profile_id,
        'خبر جديد',
        'تم نشر خبر جديد: ' || NEW.title,
        'normal',
        true,
        'unread',
        NEW.id,
        '/news/' || NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;