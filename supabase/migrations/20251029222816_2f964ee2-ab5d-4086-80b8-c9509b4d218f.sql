-- Create user_devices table for device fingerprint management
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  device_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  login_count INTEGER NOT NULL DEFAULT 0,
  added_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, device_fingerprint)
);

-- Create device_access_log table for tracking all access attempts
CREATE TABLE IF NOT EXISTS public.device_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.user_devices(id) ON DELETE SET NULL,
  device_fingerprint TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('login_success', 'login_blocked', 'login_attempt')),
  was_allowed BOOLEAN NOT NULL,
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  geolocation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_fingerprint ON public.user_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_devices_active ON public.user_devices(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_device_access_log_user ON public.device_access_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_device_access_log_device ON public.device_access_log(device_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_devices
CREATE POLICY "Admins can manage all devices"
  ON public.user_devices
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own devices"
  ON public.user_devices
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert devices"
  ON public.user_devices
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for device_access_log
CREATE POLICY "Admins can view all access logs"
  ON public.device_access_log
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own access logs"
  ON public.device_access_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert access logs"
  ON public.device_access_log
  FOR INSERT
  WITH CHECK (true);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_user_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_devices_updated_at
  BEFORE UPDATE ON public.user_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_devices_updated_at();