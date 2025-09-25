-- تحديث جدول المواطنين ليحتوي على كل البيانات المطلوبة
ALTER TABLE public.citizens 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS second_name TEXT,
ADD COLUMN IF NOT EXISTS third_name TEXT,
ADD COLUMN IF NOT EXISTS family_name TEXT,
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS face_embedding TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- إنشاء جدول للممتلكات (عقارات، شركات، إلخ)
CREATE TABLE IF NOT EXISTS public.citizen_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  property_type TEXT NOT NULL, -- 'vehicle', 'real_estate', 'business', 'other'
  property_description TEXT NOT NULL,
  property_details JSONB,
  registration_number TEXT,
  value DECIMAL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول للأرشيف (تسجيل العمليات)
CREATE TABLE IF NOT EXISTS public.citizen_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id UUID REFERENCES citizens(id),
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'view'
  changed_fields TEXT[],
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES profiles(id),
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- إنشاء جدول لتخزين embeddings الوجوه المحسنة
CREATE TABLE IF NOT EXISTS public.face_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  embedding_vector DECIMAL[],
  confidence_score DECIMAL DEFAULT 0.0,
  extraction_method TEXT DEFAULT 'facenet',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_primary BOOLEAN DEFAULT true
);

-- تمكين RLS للجداول الجديدة
ALTER TABLE public.citizen_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_embeddings ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات للوصول للممتلكات
CREATE POLICY "Authorized users can view citizen properties" 
ON public.citizen_properties 
FOR SELECT 
USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()) OR get_current_user_role() = 'officer');

CREATE POLICY "Authorized users can manage citizen properties" 
ON public.citizen_properties 
FOR ALL 
USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()))
WITH CHECK (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()));

-- إنشاء سياسات للأرشيف
CREATE POLICY "Authorized users can view audit log" 
ON public.citizen_audit_log 
FOR SELECT 
USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()));

CREATE POLICY "System can insert audit log" 
ON public.citizen_audit_log 
FOR INSERT 
WITH CHECK (true);

-- إنشاء سياسات لjدول embeddings
CREATE POLICY "Authorized users can manage face embeddings" 
ON public.face_embeddings 
FOR ALL 
USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()))
WITH CHECK (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()));

-- تحديث سياسات المواطنين
DROP POLICY IF EXISTS "Public can view citizens" ON public.citizens;
DROP POLICY IF EXISTS "Admins can insert citizens" ON public.citizens;
DROP POLICY IF EXISTS "Admins can update citizens" ON public.citizens;

CREATE POLICY "Authorized users can view citizens" 
ON public.citizens 
FOR SELECT 
USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()) OR get_current_user_role() = 'officer');

CREATE POLICY "Authorized users can insert citizens" 
ON public.citizens 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()));

CREATE POLICY "Authorized users can update citizens" 
ON public.citizens 
FOR UPDATE 
USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()));

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_citizens_national_id ON citizens(national_id);
CREATE INDEX IF NOT EXISTS idx_citizens_first_name ON citizens(first_name);
CREATE INDEX IF NOT EXISTS idx_citizens_family_name ON citizens(family_name);
CREATE INDEX IF NOT EXISTS idx_citizens_father_name ON citizens(father_name);
CREATE INDEX IF NOT EXISTS idx_citizen_properties_citizen_id ON citizen_properties(citizen_id);
CREATE INDEX IF NOT EXISTS idx_face_embeddings_citizen_id ON face_embeddings(citizen_id);