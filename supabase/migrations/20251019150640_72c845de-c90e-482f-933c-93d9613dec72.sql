-- جدول لتخزين محاولات الدخول المشبوهة
CREATE TABLE IF NOT EXISTS public.suspicious_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  country TEXT,
  city TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  user_agent TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked BOOLEAN NOT NULL DEFAULT true,
  severity TEXT NOT NULL DEFAULT 'high',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.suspicious_login_attempts ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للأدمن بمشاهدة جميع المحاولات المشبوهة
CREATE POLICY "Admins can view suspicious login attempts"
ON public.suspicious_login_attempts
FOR SELECT
USING (is_admin(auth.uid()));

-- سياسة للسماح بإضافة محاولات مشبوهة (من edge function)
CREATE POLICY "System can insert suspicious login attempts"
ON public.suspicious_login_attempts
FOR INSERT
WITH CHECK (true);

-- سياسة للأدمن لتحديث المحاولات المشبوهة
CREATE POLICY "Admins can update suspicious login attempts"
ON public.suspicious_login_attempts
FOR UPDATE
USING (is_admin(auth.uid()));

-- جدول لتخزين ملفات القضايا
CREATE TABLE IF NOT EXISTS public.cybercrime_case_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cybercrime_cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.cybercrime_case_files ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح بعرض ملفات القضايا
CREATE POLICY "Users can view case files they have access to"
ON public.cybercrime_case_files
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cybercrime_cases
    WHERE cybercrime_cases.id = cybercrime_case_files.case_id
    AND (
      cybercrime_cases.reporter_id = get_user_profile(auth.uid())
      OR cybercrime_cases.assigned_officer_id = get_user_profile(auth.uid())
      OR is_admin(auth.uid())
      OR has_cybercrime_access(auth.uid())
    )
  )
);

-- سياسة للسماح برفع ملفات للقضايا
CREATE POLICY "Authorized users can upload case files"
ON public.cybercrime_case_files
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM cybercrime_cases
    WHERE cybercrime_cases.id = cybercrime_case_files.case_id
    AND (
      cybercrime_cases.reporter_id = get_user_profile(auth.uid())
      OR cybercrime_cases.assigned_officer_id = get_user_profile(auth.uid())
      OR is_admin(auth.uid())
      OR has_cybercrime_access(auth.uid())
    )
  )
);

-- سياسة للسماح بحذف الملفات
CREATE POLICY "Authorized users can delete case files"
ON public.cybercrime_case_files
FOR DELETE
USING (
  is_admin(auth.uid()) 
  OR uploaded_by = get_user_profile(auth.uid())
);

-- إنشاء bucket للملفات إذا لم يكن موجوداً
INSERT INTO storage.buckets (id, name, public)
VALUES ('cybercrime-case-files', 'cybercrime-case-files', false)
ON CONFLICT (id) DO NOTHING;

-- سياسات التخزين للملفات
CREATE POLICY "Users can view case files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'cybercrime-case-files'
  AND (
    is_admin(auth.uid())
    OR has_cybercrime_access(auth.uid())
  )
);

CREATE POLICY "Users can upload case files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'cybercrime-case-files'
  AND (
    is_admin(auth.uid())
    OR has_cybercrime_access(auth.uid())
  )
);

CREATE POLICY "Users can delete their case files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'cybercrime-case-files'
  AND (
    is_admin(auth.uid())
    OR has_cybercrime_access(auth.uid())
  )
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_suspicious_logins_user_id ON public.suspicious_login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_logins_status ON public.suspicious_login_attempts(status);
CREATE INDEX IF NOT EXISTS idx_case_files_case_id ON public.cybercrime_case_files(case_id);
