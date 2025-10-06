-- Create table for page-level permissions
CREATE TABLE public.user_page_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  page_path TEXT NOT NULL,
  department TEXT NOT NULL,
  is_allowed BOOLEAN NOT NULL DEFAULT true,
  granted_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, page_path, department)
);

-- Enable RLS
ALTER TABLE public.user_page_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage page permissions"
ON public.user_page_permissions
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view their own permissions"
ON public.user_page_permissions
FOR SELECT
USING (user_id = get_user_profile(auth.uid()) OR is_admin(auth.uid()));

-- Create function to check page permission
CREATE OR REPLACE FUNCTION public.has_page_permission(_user_id uuid, _page_path text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_allowed 
     FROM public.user_page_permissions 
     WHERE user_id = _user_id 
       AND page_path = _page_path 
     LIMIT 1),
    true  -- Default to true if no permission record exists
  );
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_user_page_permissions_updated_at
BEFORE UPDATE ON public.user_page_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();