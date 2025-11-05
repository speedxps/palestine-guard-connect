-- إنشاء جدول لوجوه المستخدمين (منفصل عن جدول المواطنين)
CREATE TABLE IF NOT EXISTS public.user_face_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  face_vector vector(128),
  face_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id)
);

-- تمكين RLS
ALTER TABLE public.user_face_data ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للمستخدمين
CREATE POLICY "المستخدمون يمكنهم رؤية بياناتهم فقط" 
ON public.user_face_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم إضافة بياناتهم" 
ON public.user_face_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم تحديث بياناتهم" 
ON public.user_face_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "المستخدمون يمكنهم حذف بياناتهم" 
ON public.user_face_data 
FOR DELETE 
USING (auth.uid() = user_id);

-- سياسة للأدمن لعرض جميع البيانات
CREATE POLICY "الأدمن يمكنهم رؤية جميع البيانات"
ON public.user_face_data
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- فهرس للبحث السريع بـ vector
CREATE INDEX IF NOT EXISTS user_face_vector_idx ON public.user_face_data 
USING ivfflat (face_vector vector_cosine_ops)
WITH (lists = 100);

-- trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION public.update_user_face_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_face_data_updated_at
BEFORE UPDATE ON public.user_face_data
FOR EACH ROW
EXECUTE FUNCTION public.update_user_face_data_updated_at();

-- دالة للبحث عن وجه مطابق في بيانات المستخدمين
CREATE OR REPLACE FUNCTION public.search_user_faces_by_vector(
  query_embedding vector(128),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ufd.user_id,
    au.email,
    p.full_name,
    p.avatar_url,
    1 - (ufd.face_vector <=> query_embedding) as similarity
  FROM public.user_face_data ufd
  JOIN auth.users au ON au.id = ufd.user_id
  LEFT JOIN public.profiles p ON p.user_id = ufd.user_id
  WHERE ufd.is_active = true
    AND 1 - (ufd.face_vector <=> query_embedding) > match_threshold
  ORDER BY ufd.face_vector <=> query_embedding
  LIMIT match_count;
END;
$$;