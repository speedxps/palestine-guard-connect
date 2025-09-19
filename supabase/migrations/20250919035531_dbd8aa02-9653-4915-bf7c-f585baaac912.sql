-- Create vehicles table for comprehensive vehicle management
CREATE TABLE IF NOT EXISTS public.vehicle_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plate_number TEXT NOT NULL UNIQUE,
  vehicle_type TEXT NOT NULL,
  color TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  engine_number TEXT,
  chassis_number TEXT,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicle owners table (current and previous owners)
CREATE TABLE IF NOT EXISTS public.vehicle_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicle_registrations(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  national_id TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  ownership_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ownership_end_date DATE,
  is_current_owner BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicle violations table
CREATE TABLE IF NOT EXISTS public.vehicle_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicle_registrations(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL,
  violation_date DATE NOT NULL,
  location TEXT,
  fine_amount DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  officer_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create internal news table
CREATE TABLE IF NOT EXISTS public.internal_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  privacy_level TEXT NOT NULL DEFAULT 'public',
  target_groups TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cybercrime cases table
CREATE TABLE IF NOT EXISTS public.cybercrime_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT NOT NULL UNIQUE,
  case_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reporter_id UUID NOT NULL,
  assigned_officer_id UUID,
  evidence_files TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cybercrime evidence table
CREATE TABLE IF NOT EXISTS public.cybercrime_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cybercrime_cases(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL,
  file_url TEXT,
  description TEXT,
  collected_by UUID NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vehicle_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cybercrime_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cybercrime_evidence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicle tables
CREATE POLICY "Public can view vehicle registrations" ON public.vehicle_registrations FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicle registrations" ON public.vehicle_registrations FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Public can view vehicle owners" ON public.vehicle_owners FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicle owners" ON public.vehicle_owners FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Public can view vehicle violations" ON public.vehicle_violations FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicle violations" ON public.vehicle_violations FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for internal news
CREATE POLICY "Users can view published internal news" ON public.internal_news 
FOR SELECT USING (
  is_published = true AND
  CASE
    WHEN privacy_level = 'public' THEN true
    WHEN privacy_level = 'admin_only' THEN is_admin(auth.uid())
    WHEN privacy_level = 'specific_groups' THEN (is_admin(auth.uid()) OR get_current_user_role() = ANY(target_groups))
    ELSE false
  END
);

CREATE POLICY "Admins can manage internal news" ON public.internal_news FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for cybercrime tables
CREATE POLICY "Users can view relevant cybercrime cases" ON public.cybercrime_cases 
FOR SELECT USING (
  reporter_id = get_user_profile(auth.uid()) OR 
  assigned_officer_id = get_user_profile(auth.uid()) OR 
  is_admin(auth.uid()) OR 
  has_cybercrime_access(auth.uid())
);

CREATE POLICY "Users can create cybercrime cases" ON public.cybercrime_cases 
FOR INSERT WITH CHECK (reporter_id = get_user_profile(auth.uid()));

CREATE POLICY "Authorized users can update cybercrime cases" ON public.cybercrime_cases 
FOR UPDATE USING (
  assigned_officer_id = get_user_profile(auth.uid()) OR 
  is_admin(auth.uid()) OR 
  has_cybercrime_access(auth.uid())
);

CREATE POLICY "Users can view relevant cybercrime evidence" ON public.cybercrime_evidence 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.cybercrime_cases 
    WHERE cybercrime_cases.id = cybercrime_evidence.case_id 
    AND (
      cybercrime_cases.reporter_id = get_user_profile(auth.uid()) OR 
      cybercrime_cases.assigned_officer_id = get_user_profile(auth.uid()) OR 
      is_admin(auth.uid()) OR 
      has_cybercrime_access(auth.uid())
    )
  )
);

CREATE POLICY "Authorized users can add cybercrime evidence" ON public.cybercrime_evidence 
FOR INSERT WITH CHECK (collected_by = get_user_profile(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_vehicle_registrations_updated_at
BEFORE UPDATE ON public.vehicle_registrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_internal_news_updated_at
BEFORE UPDATE ON public.internal_news
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cybercrime_cases_updated_at
BEFORE UPDATE ON public.cybercrime_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample vehicle data for testing
INSERT INTO public.vehicle_registrations (plate_number, vehicle_type, color, model, year, engine_number, chassis_number) VALUES
('H2001', 'سيارة', 'أبيض', 'تويوتا كامري', 2020, 'ENG123456', 'CHS789012'),
('123456789', 'شاحنة', 'أزرق', 'هيونداي', 2019, 'ENG654321', 'CHS210987'),
('A5555', 'دراجة نارية', 'أحمر', 'هوندا', 2021, 'ENG111222', 'CHS333444');

-- Insert sample vehicle owners
INSERT INTO public.vehicle_owners (vehicle_id, owner_name, national_id, phone, address, is_current_owner) VALUES
((SELECT id FROM public.vehicle_registrations WHERE plate_number = 'H2001'), 'أحمد محمد علي', '123456789', '0599123456', 'غزة - الرمال', true),
((SELECT id FROM public.vehicle_registrations WHERE plate_number = '123456789'), 'فاطمة أحمد', '987654321', '0598765432', 'رام الله - المنارة', true),
((SELECT id FROM public.vehicle_registrations WHERE plate_number = 'A5555'), 'محمد سالم', '456789123', '0597456789', 'نابلس - وسط البلد', true);

-- Insert sample violations
INSERT INTO public.vehicle_violations (vehicle_id, violation_type, violation_date, location, fine_amount, status) VALUES
((SELECT id FROM public.vehicle_registrations WHERE plate_number = 'H2001'), 'تجاوز السرعة المقررة', '2024-01-15', 'شارع الجلاء - غزة', 200.00, 'مدفوع'),
((SELECT id FROM public.vehicle_registrations WHERE plate_number = '123456789'), 'وقوف في مكان ممنوع', '2024-01-10', 'رام الله - المنارة', 100.00, 'pending');