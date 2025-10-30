-- ============================================
-- Security Fix Part 3: Face Login Rate Limiting
-- ============================================

-- Create table to track face login attempts
CREATE TABLE IF NOT EXISTS public.face_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  was_successful BOOLEAN NOT NULL DEFAULT false,
  matched_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on face_login_attempts
ALTER TABLE public.face_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view face login attempts
CREATE POLICY "Admins can view face login attempts"
ON public.face_login_attempts
FOR SELECT
USING (is_admin(auth.uid()));

-- System can insert face login attempts (no auth required)
CREATE POLICY "System can log face login attempts"
ON public.face_login_attempts
FOR INSERT
WITH CHECK (true);

-- Add index for efficient rate limit checks
CREATE INDEX IF NOT EXISTS idx_face_login_attempts_ip_time 
ON public.face_login_attempts(ip_address, attempt_time DESC);

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION public.check_face_login_rate_limit(
  _ip_address TEXT,
  _window_minutes INTEGER DEFAULT 60,
  _max_attempts INTEGER DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count attempts in the time window
  SELECT COUNT(*)
  INTO attempt_count
  FROM public.face_login_attempts
  WHERE ip_address = _ip_address
    AND attempt_time > (now() - (_window_minutes || ' minutes')::interval);
    
  -- Return true if under limit, false if over
  RETURN attempt_count < _max_attempts;
END;
$$;