-- Create activity_logs table for recent activity tracking
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  activity_type TEXT NOT NULL, -- 'login', 'incident_created', 'password_reset_request', etc.
  activity_description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- System can insert activity logs
CREATE POLICY "System can insert activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON public.activity_logs(activity_type);