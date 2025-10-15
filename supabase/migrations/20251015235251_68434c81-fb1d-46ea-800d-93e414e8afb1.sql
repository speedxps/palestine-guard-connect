-- Create notification views tracking table
CREATE TABLE IF NOT EXISTS public.notification_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- Enable RLS
ALTER TABLE public.notification_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_views
CREATE POLICY "Users can view their own notification views"
  ON public.notification_views
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification views"
  ON public.notification_views
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create news reads tracking table
CREATE TABLE IF NOT EXISTS public.news_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES public.internal_news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(news_id, user_id)
);

-- Enable RLS
ALTER TABLE public.news_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news_reads
CREATE POLICY "Users can view their own news reads"
  ON public.news_reads
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own news reads"
  ON public.news_reads
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_notification_views_notification_id ON public.notification_views(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_views_user_id ON public.notification_views(user_id);
CREATE INDEX IF NOT EXISTS idx_news_reads_news_id ON public.news_reads(news_id);
CREATE INDEX IF NOT EXISTS idx_news_reads_user_id ON public.news_reads(user_id);