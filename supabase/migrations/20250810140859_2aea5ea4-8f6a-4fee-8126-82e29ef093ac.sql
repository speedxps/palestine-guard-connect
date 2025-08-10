-- Create enum for record type if not exists
DO $$ BEGIN
  CREATE TYPE public.traffic_record_type AS ENUM ('violation', 'case');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create table for traffic violations and cases
CREATE TABLE IF NOT EXISTS public.traffic_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id text NOT NULL,
  citizen_name text NOT NULL,
  record_type public.traffic_record_type NOT NULL,
  record_date date NOT NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.traffic_records ENABLE ROW LEVEL SECURITY;

-- Policies (first creation)
CREATE POLICY "Public can view traffic records"
ON public.traffic_records
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert traffic records"
ON public.traffic_records
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update traffic records"
ON public.traffic_records
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete traffic records"
ON public.traffic_records
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Trigger to keep updated_at fresh
DO $$ BEGIN
  CREATE TRIGGER update_traffic_records_updated_at
  BEFORE UPDATE ON public.traffic_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_traffic_records_national_id ON public.traffic_records (national_id);
CREATE INDEX IF NOT EXISTS idx_traffic_records_type ON public.traffic_records (record_type);
CREATE INDEX IF NOT EXISTS idx_traffic_records_date ON public.traffic_records (record_date);

-- Realtime configuration
ALTER TABLE public.traffic_records REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.traffic_records;

-- Seed demo data
INSERT INTO public.traffic_records (national_id, citizen_name, record_type, record_date, details)
VALUES
  ('401234567','Ahmed Mohammed','violation','2025-07-15','Speed limit exceeded'),
  ('402345678','Layla Khaled','case','2025-06-10','Property dispute'),
  ('404706285','Samer Youssef','violation','2025-08-01','Parking in a prohibited area')
ON CONFLICT DO NOTHING;