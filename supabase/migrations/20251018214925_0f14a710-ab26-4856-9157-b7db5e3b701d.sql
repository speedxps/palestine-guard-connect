-- Create investigation_notes table
CREATE TABLE IF NOT EXISTS public.investigation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investigation_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investigation_notes
CREATE POLICY "CID and admins can view investigation notes"
ON public.investigation_notes
FOR SELECT
USING (
  is_admin(auth.uid()) OR
  has_cybercrime_access(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'cid'
  )
);

CREATE POLICY "CID can create investigation notes"
ON public.investigation_notes
FOR INSERT
WITH CHECK (
  created_by = get_user_profile(auth.uid()) AND
  (
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'cid'
    )
  )
);

-- Create investigation_closure_requests table
CREATE TABLE IF NOT EXISTS public.investigation_closure_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by UUID NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investigation_closure_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investigation_closure_requests
CREATE POLICY "Users can view their own closure requests"
ON public.investigation_closure_requests
FOR SELECT
USING (
  is_admin(auth.uid()) OR
  requested_by = get_user_profile(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('cid', 'admin')
  )
);

CREATE POLICY "CID can create closure requests"
ON public.investigation_closure_requests
FOR INSERT
WITH CHECK (
  requested_by = get_user_profile(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'cid'
  )
);

CREATE POLICY "Admins can update closure requests"
ON public.investigation_closure_requests
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_investigation_notes_citizen ON public.investigation_notes(citizen_id);
CREATE INDEX idx_investigation_notes_created_by ON public.investigation_notes(created_by);
CREATE INDEX idx_closure_requests_citizen ON public.investigation_closure_requests(citizen_id);
CREATE INDEX idx_closure_requests_status ON public.investigation_closure_requests(status);

-- Trigger for updated_at
CREATE TRIGGER update_investigation_notes_updated_at
BEFORE UPDATE ON public.investigation_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_closure_requests_updated_at
BEFORE UPDATE ON public.investigation_closure_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();