-- Add cybercrime officer role to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'cyber_officer';

-- Create cybercrime_access table for tracking cyber officer permissions
CREATE TABLE IF NOT EXISTS public.cybercrime_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.cybercrime_access ENABLE ROW LEVEL SECURITY;

-- Create policies for cybercrime access (simplified without is_admin check for now)
CREATE POLICY "Users can view their own cybercrime access" 
ON public.cybercrime_access 
FOR SELECT 
USING (user_id = auth.uid());

-- Create function to check if user has cybercrime access
CREATE OR REPLACE FUNCTION public.has_cybercrime_access(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.cybercrime_access 
    WHERE cybercrime_access.user_id = has_cybercrime_access.user_id 
    AND is_active = true
  );
$function$;