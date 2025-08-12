-- 1) Enum for family relations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'family_relation') THEN
    CREATE TYPE public.family_relation AS ENUM (
      'father','mother','spouse','brother','sister','son','daughter'
    );
  END IF;
END$$;

-- 2) Citizens table
CREATE TABLE IF NOT EXISTS public.citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  photo_url TEXT,
  has_vehicle BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;

-- Policies for citizens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'citizens' AND policyname = 'Public can view citizens'
  ) THEN
    CREATE POLICY "Public can view citizens" ON public.citizens FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'citizens' AND policyname = 'Admins can insert citizens'
  ) THEN
    CREATE POLICY "Admins can insert citizens" ON public.citizens FOR INSERT WITH CHECK (is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'citizens' AND policyname = 'Admins can update citizens'
  ) THEN
    CREATE POLICY "Admins can update citizens" ON public.citizens FOR UPDATE USING (is_admin(auth.uid()));
  END IF;
END$$;

-- Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_citizens_updated_at'
  ) THEN
    CREATE TRIGGER update_citizens_updated_at
    BEFORE UPDATE ON public.citizens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 3) Vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  plate_number TEXT NOT NULL UNIQUE,
  vehicle_type TEXT,
  color TEXT,
  purchase_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicles' AND policyname = 'Public can view vehicles'
  ) THEN
    CREATE POLICY "Public can view vehicles" ON public.vehicles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicles' AND policyname = 'Admins can insert vehicles'
  ) THEN
    CREATE POLICY "Admins can insert vehicles" ON public.vehicles FOR INSERT WITH CHECK (is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicles' AND policyname = 'Admins can update vehicles'
  ) THEN
    CREATE POLICY "Admins can update vehicles" ON public.vehicles FOR UPDATE USING (is_admin(auth.uid()));
  END IF;
END$$;

-- 4) Family members table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  relative_id UUID REFERENCES public.citizens(id) ON DELETE SET NULL,
  relation public.family_relation NOT NULL,
  relative_name TEXT NOT NULL,
  relative_national_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_members_person ON public.family_members(person_id);
CREATE INDEX IF NOT EXISTS idx_family_members_relation ON public.family_members(relation);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'family_members' AND policyname = 'Public can view family members'
  ) THEN
    CREATE POLICY "Public can view family members" ON public.family_members FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'family_members' AND policyname = 'Admins can insert family members'
  ) THEN
    CREATE POLICY "Admins can insert family members" ON public.family_members FOR INSERT WITH CHECK (is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'family_members' AND policyname = 'Admins can update family members'
  ) THEN
    CREATE POLICY "Admins can update family members" ON public.family_members FOR UPDATE USING (is_admin(auth.uid()));
  END IF;
END$$;

-- 5) Wanted persons table
CREATE TABLE IF NOT EXISTS public.wanted_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  reason TEXT,
  monitor_start_date DATE NOT NULL DEFAULT now(),
  monitor_end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wanted_persons_citizen ON public.wanted_persons(citizen_id);
CREATE INDEX IF NOT EXISTS idx_wanted_persons_active ON public.wanted_persons(is_active);

ALTER TABLE public.wanted_persons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'wanted_persons' AND policyname = 'Public can view wanted persons'
  ) THEN
    CREATE POLICY "Public can view wanted persons" ON public.wanted_persons FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'wanted_persons' AND policyname = 'Admins can insert wanted persons'
  ) THEN
    CREATE POLICY "Admins can insert wanted persons" ON public.wanted_persons FOR INSERT WITH CHECK (is_admin(auth.uid()));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'wanted_persons' AND policyname = 'Admins can update wanted persons'
  ) THEN
    CREATE POLICY "Admins can update wanted persons" ON public.wanted_persons FOR UPDATE USING (is_admin(auth.uid()));
  END IF;
END$$;

-- 6) Extend traffic_records with resolution flag
ALTER TABLE public.traffic_records
  ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN NOT NULL DEFAULT false;

-- 7) Storage: public bucket for citizen photos with admin-only writes
INSERT INTO storage.buckets (id, name, public)
VALUES ('citizen-photos', 'citizen-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
  -- Public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Citizen photos are publicly accessible'
  ) THEN
    CREATE POLICY "Citizen photos are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'citizen-photos');
  END IF;
  -- Admin insert
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload citizen photos'
  ) THEN
    CREATE POLICY "Admins can upload citizen photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'citizen-photos' AND is_admin(auth.uid()));
  END IF;
  -- Admin update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update citizen photos'
  ) THEN
    CREATE POLICY "Admins can update citizen photos"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'citizen-photos' AND is_admin(auth.uid()));
  END IF;
  -- Admin delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete citizen photos'
  ) THEN
    CREATE POLICY "Admins can delete citizen photos"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'citizen-photos' AND is_admin(auth.uid()));
  END IF;
END$$;

-- 8) Seed dummy data for sample national IDs
-- Upsert citizens
INSERT INTO public.citizens (national_id, full_name, photo_url, has_vehicle)
VALUES
  ('123456789', 'خالد صالح', 'https://placehold.co/128x128?text=Khaled', true),
  ('987654321', 'نور الهادي', 'https://placehold.co/128x128?text=Noor', true),
  ('111222333', 'سارة محمد', 'https://placehold.co/128x128?text=Sara', false)
ON CONFLICT (national_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  photo_url = EXCLUDED.photo_url,
  has_vehicle = EXCLUDED.has_vehicle;

-- Vehicles for citizens
INSERT INTO public.vehicles (owner_id, plate_number, vehicle_type, color, purchase_date)
SELECT id, 'ABC-1234', 'Sedan', 'Black', '2023-03-15' FROM public.citizens WHERE national_id = '123456789'
ON CONFLICT (plate_number) DO NOTHING;

INSERT INTO public.vehicles (owner_id, plate_number, vehicle_type, color, purchase_date)
SELECT id, 'XYZ-9876', 'SUV', 'White', '2024-11-22' FROM public.citizens WHERE national_id = '987654321'
ON CONFLICT (plate_number) DO NOTHING;

-- Family relationships for 123456789 (Khaled)
INSERT INTO public.family_members (person_id, relation, relative_name, relative_national_id)
SELECT id, 'father', 'صالح أحمد', '222333444' FROM public.citizens WHERE national_id = '123456789';

INSERT INTO public.family_members (person_id, relation, relative_name, relative_national_id)
SELECT id, 'mother', 'أمينة علي', '555666777' FROM public.citizens WHERE national_id = '123456789';

INSERT INTO public.family_members (person_id, relation, relative_name, relative_national_id)
SELECT id, 'spouse', 'ليلى حسن', '999888777' FROM public.citizens WHERE national_id = '123456789';

INSERT INTO public.family_members (person_id, relation, relative_name, relative_national_id)
SELECT id, 'son', 'سامي خالد', '333222111' FROM public.citizens WHERE national_id = '123456789';

INSERT INTO public.family_members (person_id, relation, relative_name, relative_national_id)
SELECT id, 'daughter', 'هبة خالد', '444555666' FROM public.citizens WHERE national_id = '123456789';

-- Family for 987654321 (Noor)
INSERT INTO public.family_members (person_id, relation, relative_name, relative_national_id)
SELECT id, 'brother', 'هادي الهادي', '121212121' FROM public.citizens WHERE national_id = '987654321';

-- Wanted status: make Khaled wanted, active until year end
INSERT INTO public.wanted_persons (citizen_id, reason, monitor_start_date, monitor_end_date, is_active)
SELECT id, 'قضية اعتداء قيد الضبط', CURRENT_DATE, CURRENT_DATE + INTERVAL '120 days', true FROM public.citizens WHERE national_id = '123456789';

-- Update resolution flags for seeded traffic records containing specific phrases
UPDATE public.traffic_records
SET is_resolved = true
WHERE details ILIKE '%تم الصلح%' OR details ILIKE '%سددت وتم الإغلاق%';