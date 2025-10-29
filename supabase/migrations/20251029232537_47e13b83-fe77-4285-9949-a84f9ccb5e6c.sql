-- إنشاء جدول القائمة السوداء للأجهزة
CREATE TABLE IF NOT EXISTS public.device_blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint text NOT NULL UNIQUE,
  reason text,
  blocked_by uuid REFERENCES auth.users(id),
  blocked_at timestamptz DEFAULT now(),
  notes text,
  user_id uuid REFERENCES auth.users(id),
  device_info jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.device_blacklist ENABLE ROW LEVEL SECURITY;

-- Admins can view all blacklisted devices
CREATE POLICY "Admins can view device blacklist"
ON public.device_blacklist
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can insert into blacklist
CREATE POLICY "Admins can blacklist devices"
ON public.device_blacklist
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Admins can delete from blacklist
CREATE POLICY "Admins can remove from blacklist"
ON public.device_blacklist
FOR DELETE
USING (is_admin(auth.uid()));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_device_blacklist_fingerprint ON public.device_blacklist(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_device_blacklist_user_id ON public.device_blacklist(user_id);