-- Create table for login events
CREATE TABLE IF NOT EXISTS public.login_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  x_forwarded_for TEXT,
  cf_connecting_ip TEXT,
  forwarded TEXT,
  user_agent TEXT,
  referer TEXT,
  route TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  session_id TEXT,
  geolocation JSONB,
  device_info JSONB,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  is_suspicious BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own login events
CREATE POLICY "Users can view their own login events"
ON public.login_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all login events
CREATE POLICY "Admins can view all login events"
ON public.login_events
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- System can insert login events
CREATE POLICY "System can insert login events"
ON public.login_events
FOR INSERT
WITH CHECK (true);

-- Users can update their own login events (acknowledge)
CREATE POLICY "Users can update their own login events"
ON public.login_events
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create index for performance
CREATE INDEX idx_login_events_user_id ON public.login_events(user_id);
CREATE INDEX idx_login_events_timestamp ON public.login_events(timestamp DESC);
CREATE INDEX idx_login_events_is_acknowledged ON public.login_events(is_acknowledged) WHERE is_acknowledged = false;