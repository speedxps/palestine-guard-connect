-- إنشاء جدول لتخزين ملفات الوصول الخارجي للإداريين
CREATE TABLE IF NOT EXISTS public.external_access_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  version TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.external_access_files ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة - الجميع يمكنهم رؤية الملف النشط
CREATE POLICY "Anyone can view active external access files"
ON public.external_access_files
FOR SELECT
USING (is_active = true);

-- سياسة للإدراج - فقط الأدمن وقسم الجرائم الإلكترونية
CREATE POLICY "Admins and cybercrime can upload external access files"
ON public.external_access_files
FOR INSERT
WITH CHECK (
  is_admin(auth.uid()) OR has_cybercrime_access(auth.uid())
);

-- سياسة للتحديث - فقط الأدمن وقسم الجرائم الإلكترونية
CREATE POLICY "Admins and cybercrime can update external access files"
ON public.external_access_files
FOR UPDATE
USING (
  is_admin(auth.uid()) OR has_cybercrime_access(auth.uid())
);

-- سياسة للحذف - فقط الأدمن
CREATE POLICY "Only admins can delete external access files"
ON public.external_access_files
FOR DELETE
USING (is_admin(auth.uid()));

-- إنشاء bucket للملفات (إذا لم يكن موجوداً)
INSERT INTO storage.buckets (id, name, public)
VALUES ('external-access-apps', 'external-access-apps', true)
ON CONFLICT (id) DO NOTHING;

-- سياسات Storage للقراءة - الجميع
CREATE POLICY "Anyone can download external access files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'external-access-apps');

-- سياسات Storage للإدراج - فقط الأدمن والجرائم الإلكترونية
CREATE POLICY "Admins and cybercrime can upload to external-access-apps"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'external-access-apps' AND
  (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()))
);

-- سياسات Storage للحذف - فقط الأدمن
CREATE POLICY "Only admins can delete from external-access-apps"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'external-access-apps' AND
  is_admin(auth.uid())
);