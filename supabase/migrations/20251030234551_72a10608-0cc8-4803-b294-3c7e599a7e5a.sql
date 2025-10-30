-- Create official_notifications table to store all sent notifications
CREATE TABLE IF NOT EXISTS public.official_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  notification_text TEXT NOT NULL,
  template_used TEXT,
  sent_via TEXT DEFAULT 'phone', -- 'phone', 'sms', 'whatsapp', 'email'
  scheduled_date TEXT,
  scheduled_day TEXT,
  scheduled_time TEXT,
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.official_notifications ENABLE ROW LEVEL SECURITY;

-- CID and admin can view all notifications
CREATE POLICY "CID and admin can view notifications"
  ON public.official_notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'cid')
    )
  );

-- CID and admin can insert notifications
CREATE POLICY "CID and admin can insert notifications"
  ON public.official_notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'cid')
    )
  );

-- Create index for faster queries
CREATE INDEX idx_official_notifications_citizen_id ON public.official_notifications(citizen_id);
CREATE INDEX idx_official_notifications_sender_id ON public.official_notifications(sender_id);
CREATE INDEX idx_official_notifications_created_at ON public.official_notifications(created_at DESC);