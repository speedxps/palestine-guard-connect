-- Create Reports System Tables

-- Reports table for storing generated reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'monthly', 'annual', 'incident', 'patrol', 'custom'
  generated_by UUID REFERENCES public.profiles(id) NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  report_data JSONB NOT NULL,
  date_from DATE,
  date_to DATE,
  status TEXT DEFAULT 'completed' NOT NULL,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Statistics snapshots for historical tracking
CREATE TABLE IF NOT EXISTS public.statistics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  snapshot_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'annual'
  total_incidents INTEGER DEFAULT 0,
  total_patrols INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  total_violations INTEGER DEFAULT 0,
  incidents_by_type JSONB,
  incidents_by_status JSONB,
  tasks_by_status JSONB,
  additional_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Authenticated users can view reports"
ON public.reports
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()) OR generated_by = get_user_profile(auth.uid()) OR get_current_user_role() = 'officer');

CREATE POLICY "Officers can create reports"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (generated_by = get_user_profile(auth.uid()));

CREATE POLICY "Users can update their own reports"
ON public.reports
FOR UPDATE
TO authenticated
USING (generated_by = get_user_profile(auth.uid()) OR is_admin(auth.uid()));

-- RLS Policies for statistics_snapshots
CREATE POLICY "Authenticated users can view statistics"
ON public.statistics_snapshots
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()) OR get_current_user_role() = 'officer');

CREATE POLICY "Admins can manage statistics"
ON public.statistics_snapshots
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_reports_generated_by ON public.reports(generated_by);
CREATE INDEX idx_reports_generated_at ON public.reports(generated_at DESC);
CREATE INDEX idx_reports_type ON public.reports(report_type);
CREATE INDEX idx_statistics_date ON public.statistics_snapshots(snapshot_date DESC);
CREATE INDEX idx_statistics_type ON public.statistics_snapshots(snapshot_type);

-- Trigger to update updated_at
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();