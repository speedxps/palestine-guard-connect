-- Create password reset requests table
CREATE TABLE IF NOT EXISTS public.password_resets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by TEXT NOT NULL,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Create policies for password resets
CREATE POLICY "Users can create password reset requests" 
ON public.password_resets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own requests" 
ON public.password_resets 
FOR SELECT 
USING (email = auth.email() OR is_admin(auth.uid()));

CREATE POLICY "Admins can update password reset requests" 
ON public.password_resets 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Add trigger for timestamps
CREATE TRIGGER update_password_resets_updated_at
BEFORE UPDATE ON public.password_resets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create initial admin user (you'll need to sign up with this email first)
-- This is just a placeholder - the actual user creation will happen through the signup process