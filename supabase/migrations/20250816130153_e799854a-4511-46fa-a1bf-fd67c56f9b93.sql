-- Create patrols table for real patrol system
CREATE TABLE public.patrols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  location_address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patrol_members table
CREATE TABLE public.patrol_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patrol_id UUID NOT NULL REFERENCES public.patrols(id) ON DELETE CASCADE,
  officer_id UUID NOT NULL,
  officer_name TEXT NOT NULL,
  officer_phone TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patrols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrol_members ENABLE ROW LEVEL SECURITY;

-- Create policies for patrols
CREATE POLICY "Officers can view all patrols" 
ON public.patrols 
FOR SELECT 
USING (true);

CREATE POLICY "Officers can create patrols" 
ON public.patrols 
FOR INSERT 
WITH CHECK (created_by = get_user_profile(auth.uid()));

CREATE POLICY "Admins can update patrols" 
ON public.patrols 
FOR UPDATE 
USING (is_admin(auth.uid()) OR created_by = get_user_profile(auth.uid()));

CREATE POLICY "Admins can delete patrols" 
ON public.patrols 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create policies for patrol_members
CREATE POLICY "Officers can view patrol members" 
ON public.patrol_members 
FOR SELECT 
USING (true);

CREATE POLICY "Officers can add patrol members" 
ON public.patrol_members 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patrols 
  WHERE id = patrol_id 
  AND (created_by = get_user_profile(auth.uid()) OR is_admin(auth.uid()))
));

CREATE POLICY "Officers can update patrol members" 
ON public.patrol_members 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.patrols 
  WHERE id = patrol_id 
  AND (created_by = get_user_profile(auth.uid()) OR is_admin(auth.uid()))
));

CREATE POLICY "Officers can delete patrol members" 
ON public.patrol_members 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.patrols 
  WHERE id = patrol_id 
  AND (created_by = get_user_profile(auth.uid()) OR is_admin(auth.uid()))
));

-- Create trigger for patrols updated_at
CREATE TRIGGER update_patrols_updated_at
BEFORE UPDATE ON public.patrols
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();