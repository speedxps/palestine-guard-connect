-- Create table for GPS location tracking
CREATE TABLE IF NOT EXISTS public.gps_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy NUMERIC,
  altitude NUMERIC,
  heading NUMERIC,
  speed NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_gps_tracking_user_id ON public.gps_tracking(user_id);
CREATE INDEX idx_gps_tracking_profile_id ON public.gps_tracking(profile_id);
CREATE INDEX idx_gps_tracking_created_at ON public.gps_tracking(created_at DESC);
CREATE INDEX idx_gps_tracking_active ON public.gps_tracking(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.gps_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own GPS location
CREATE POLICY "Users can insert their own GPS tracking data"
ON public.gps_tracking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own GPS tracking
CREATE POLICY "Users can view their own GPS tracking"
ON public.gps_tracking
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own GPS tracking
CREATE POLICY "Users can update their own GPS tracking"
ON public.gps_tracking
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Admins can view all GPS tracking
CREATE POLICY "Admins can view all GPS tracking"
ON public.gps_tracking
FOR SELECT
USING (is_admin(auth.uid()));

-- Policy: Admins can manage all GPS tracking
CREATE POLICY "Admins can manage all GPS tracking"
ON public.gps_tracking
FOR ALL
USING (is_admin(auth.uid()));

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_gps_tracking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gps_tracking_updated_at
BEFORE UPDATE ON public.gps_tracking
FOR EACH ROW
EXECUTE FUNCTION update_gps_tracking_timestamp();

-- Add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.gps_tracking;