-- Create judicial_documents table
CREATE TABLE IF NOT EXISTS public.judicial_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.judicial_cases(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.judicial_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authorized users can view judicial documents"
ON public.judicial_documents
FOR SELECT
USING (
  is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.judicial_cases
    WHERE judicial_cases.id = judicial_documents.case_id
    AND (
      judicial_cases.created_by = get_user_profile(auth.uid()) OR
      judicial_cases.assigned_to = get_user_profile(auth.uid())
    )
  )
);

CREATE POLICY "Authorized users can upload judicial documents"
ON public.judicial_documents
FOR INSERT
WITH CHECK (
  uploaded_by = get_user_profile(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.judicial_cases
    WHERE judicial_cases.id = judicial_documents.case_id
    AND (
      judicial_cases.created_by = get_user_profile(auth.uid()) OR
      judicial_cases.assigned_to = get_user_profile(auth.uid()) OR
      is_admin(auth.uid())
    )
  )
);

CREATE POLICY "Authorized users can delete judicial documents"
ON public.judicial_documents
FOR DELETE
USING (
  is_admin(auth.uid()) OR
  uploaded_by = get_user_profile(auth.uid())
);

-- Create index
CREATE INDEX idx_judicial_documents_case_id ON public.judicial_documents(case_id);

-- Create storage bucket for judicial documents if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('judicial-documents', 'judicial-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for judicial documents
CREATE POLICY "Authorized users can view judicial document files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'judicial-documents' AND
  (
    is_admin(auth.uid()) OR
    auth.uid()::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Authorized users can upload judicial document files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'judicial-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authorized users can delete judicial document files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'judicial-documents' AND
  (
    is_admin(auth.uid()) OR
    auth.uid()::text = (storage.foldername(name))[1]
  )
);