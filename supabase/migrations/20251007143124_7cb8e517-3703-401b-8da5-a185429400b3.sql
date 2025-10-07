-- Create enums for judicial system
CREATE TYPE evidence_type AS ENUM ('dna', 'fingerprint', 'photo', 'document', 'video', 'audio', 'other');
CREATE TYPE case_status AS ENUM ('open', 'under_investigation', 'sent_to_court', 'sent_to_prosecution', 'closed');
CREATE TYPE transfer_status AS ENUM ('pending', 'received', 'reviewed', 'completed');
CREATE TYPE judicial_role AS ENUM ('judicial_police', 'court', 'prosecution', 'forensic_lab');

-- Forensic Evidence table
CREATE TABLE public.forensic_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  evidence_type evidence_type NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT,
  analysis_report TEXT,
  collected_by UUID NOT NULL,
  analyzed_by UUID,
  collection_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  analysis_date TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT false,
  chain_of_custody JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Judicial Cases table
CREATE TABLE public.judicial_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  case_type TEXT NOT NULL,
  parties JSONB NOT NULL,
  description TEXT NOT NULL,
  attachments TEXT[],
  notes TEXT,
  status case_status NOT NULL DEFAULT 'open',
  created_by UUID NOT NULL,
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Judicial Transfers table
CREATE TABLE public.judicial_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.judicial_cases(id) ON DELETE CASCADE NOT NULL,
  from_department TEXT NOT NULL,
  to_department TEXT NOT NULL,
  transfer_type TEXT NOT NULL,
  message TEXT,
  attachments TEXT[],
  status transfer_status NOT NULL DEFAULT 'pending',
  digital_signature TEXT,
  transferred_by UUID NOT NULL,
  received_by UUID,
  transferred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Judicial Messages table
CREATE TABLE public.judicial_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.judicial_cases(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  sender_department TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT[],
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forensic_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judicial_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judicial_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judicial_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forensic_evidence
CREATE POLICY "Authorized users can view forensic evidence"
  ON public.forensic_evidence FOR SELECT
  USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()) OR collected_by = get_user_profile(auth.uid()));

CREATE POLICY "Authorized users can insert forensic evidence"
  ON public.forensic_evidence FOR INSERT
  WITH CHECK (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()));

CREATE POLICY "Authorized users can update forensic evidence"
  ON public.forensic_evidence FOR UPDATE
  USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()) OR collected_by = get_user_profile(auth.uid()));

-- RLS Policies for judicial_cases
CREATE POLICY "Authorized users can view judicial cases"
  ON public.judicial_cases FOR SELECT
  USING (is_admin(auth.uid()) OR created_by = get_user_profile(auth.uid()) OR assigned_to = get_user_profile(auth.uid()));

CREATE POLICY "Judicial police can create cases"
  ON public.judicial_cases FOR INSERT
  WITH CHECK (is_admin(auth.uid()) OR created_by = get_user_profile(auth.uid()));

CREATE POLICY "Authorized users can update cases"
  ON public.judicial_cases FOR UPDATE
  USING (is_admin(auth.uid()) OR created_by = get_user_profile(auth.uid()) OR assigned_to = get_user_profile(auth.uid()));

-- RLS Policies for judicial_transfers
CREATE POLICY "Users can view relevant transfers"
  ON public.judicial_transfers FOR SELECT
  USING (is_admin(auth.uid()) OR transferred_by = get_user_profile(auth.uid()) OR received_by = get_user_profile(auth.uid()));

CREATE POLICY "Users can create transfers"
  ON public.judicial_transfers FOR INSERT
  WITH CHECK (transferred_by = get_user_profile(auth.uid()));

CREATE POLICY "Recipients can update transfers"
  ON public.judicial_transfers FOR UPDATE
  USING (is_admin(auth.uid()) OR received_by = get_user_profile(auth.uid()));

-- RLS Policies for judicial_messages
CREATE POLICY "Users can view case messages"
  ON public.judicial_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.judicial_cases
      WHERE id = judicial_messages.case_id
      AND (created_by = get_user_profile(auth.uid()) OR assigned_to = get_user_profile(auth.uid()) OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can send messages"
  ON public.judicial_messages FOR INSERT
  WITH CHECK (sender_id = get_user_profile(auth.uid()));

CREATE POLICY "Users can mark messages as read"
  ON public.judicial_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.judicial_cases
      WHERE id = judicial_messages.case_id
      AND (created_by = get_user_profile(auth.uid()) OR assigned_to = get_user_profile(auth.uid()) OR is_admin(auth.uid()))
    )
  );

-- Create indexes
CREATE INDEX idx_forensic_evidence_case_id ON public.forensic_evidence(case_id);
CREATE INDEX idx_judicial_cases_status ON public.judicial_cases(status);
CREATE INDEX idx_judicial_transfers_case_id ON public.judicial_transfers(case_id);
CREATE INDEX idx_judicial_transfers_status ON public.judicial_transfers(status);
CREATE INDEX idx_judicial_messages_case_id ON public.judicial_messages(case_id);

-- Triggers for updated_at
CREATE TRIGGER update_forensic_evidence_updated_at
  BEFORE UPDATE ON public.forensic_evidence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_judicial_cases_updated_at
  BEFORE UPDATE ON public.judicial_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();