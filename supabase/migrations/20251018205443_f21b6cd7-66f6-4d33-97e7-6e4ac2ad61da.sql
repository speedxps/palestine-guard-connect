-- Create citizen_documents table for storing document metadata
CREATE TABLE IF NOT EXISTS public.citizen_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.citizen_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for citizen_documents
CREATE POLICY "Authorized users can view citizen documents"
  ON public.citizen_documents
  FOR SELECT
  USING (
    is_admin(auth.uid()) OR 
    has_cybercrime_access(auth.uid()) OR 
    get_current_user_role() = 'officer'
  );

CREATE POLICY "Authorized users can insert citizen documents"
  ON public.citizen_documents
  FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR 
    has_cybercrime_access(auth.uid()) OR 
    get_current_user_role() = 'officer'
  );

CREATE POLICY "Authorized users can delete citizen documents"
  ON public.citizen_documents
  FOR DELETE
  USING (
    is_admin(auth.uid()) OR 
    has_cybercrime_access(auth.uid())
  );

-- Create index for faster queries
CREATE INDEX idx_citizen_documents_citizen_id ON public.citizen_documents(citizen_id);
CREATE INDEX idx_citizen_documents_uploaded_at ON public.citizen_documents(uploaded_at DESC);

-- Create storage bucket for citizen documents if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('citizen-documents', 'citizen-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for citizen-documents bucket
CREATE POLICY "Authorized users can view citizen document files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'citizen-documents' AND
    (
      is_admin(auth.uid()) OR 
      has_cybercrime_access(auth.uid()) OR 
      get_current_user_role() = 'officer'
    )
  );

CREATE POLICY "Authorized users can upload citizen document files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'citizen-documents' AND
    (
      is_admin(auth.uid()) OR 
      has_cybercrime_access(auth.uid()) OR 
      get_current_user_role() = 'officer'
    )
  );

CREATE POLICY "Authorized users can delete citizen document files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'citizen-documents' AND
    (
      is_admin(auth.uid()) OR 
      has_cybercrime_access(auth.uid())
    )
  );