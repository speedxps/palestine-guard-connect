-- المرحلة 1: تثبيت pgvector وإعداد البنية التحتية لنظام التعرف على الوجوه

-- 1.1 تثبيت pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1.2 إضافة عمود face_vector إلى جدول citizens
ALTER TABLE public.citizens 
ADD COLUMN IF NOT EXISTS face_vector vector(128);

-- 1.3 إنشاء فهرس IVFFlat للبحث السريع في المتجهات
CREATE INDEX IF NOT EXISTS idx_citizens_face_vector 
ON public.citizens 
USING ivfflat (face_vector vector_cosine_ops)
WITH (lists = 100);

-- 1.4 إنشاء دالة PostgreSQL للبحث السريع بالمتجهات
CREATE OR REPLACE FUNCTION public.search_faces_by_vector(
  query_vector vector(128),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  national_id text,
  full_name text,
  photo_url text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.national_id,
    c.full_name,
    c.photo_url,
    (1 - (c.face_vector <=> query_vector))::float as similarity
  FROM public.citizens c
  WHERE c.face_vector IS NOT NULL
    AND (1 - (c.face_vector <=> query_vector)) >= match_threshold
  ORDER BY c.face_vector <=> query_vector
  LIMIT match_count;
END;
$$;

-- 1.5 إنشاء جدول لتتبع عمليات معالجة الوجوه
CREATE TABLE IF NOT EXISTS public.face_processing_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id uuid REFERENCES public.citizens(id) ON DELETE CASCADE,
  processing_status text NOT NULL DEFAULT 'pending',
  confidence_score float,
  error_message text,
  processed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- RLS policies لجدول face_processing_log
ALTER TABLE public.face_processing_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view face processing log"
ON public.face_processing_log
FOR SELECT
USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()));

CREATE POLICY "System can insert face processing log"
ON public.face_processing_log
FOR INSERT
WITH CHECK (true);

-- إضافة تعليقات توضيحية
COMMENT ON COLUMN public.citizens.face_vector IS 'Face embedding vector (128 dimensions) for facial recognition using face-api.js';
COMMENT ON FUNCTION public.search_faces_by_vector IS 'Search for similar faces using vector similarity (cosine distance)';
COMMENT ON TABLE public.face_processing_log IS 'Log of face processing operations for citizens';