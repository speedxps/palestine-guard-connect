-- إنشاء جدول للأجهزة الأمنية
CREATE TABLE IF NOT EXISTS public.security_agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  headquarters_address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- إنشاء جدول للتواصل مع الأجهزة
CREATE TABLE IF NOT EXISTS public.agency_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES public.security_agencies(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'read', 'replied', 'archived')),
  attachments JSONB DEFAULT '[]'::jsonb,
  reply_to UUID REFERENCES public.agency_communications(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- إنشاء جدول للعمليات المشتركة
CREATE TABLE IF NOT EXISTS public.joint_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_name TEXT NOT NULL,
  operation_code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  participating_agencies UUID[] NOT NULL DEFAULT '{}'::UUID[],
  commander_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  location TEXT,
  coordinates JSONB,
  objectives TEXT[],
  resources_needed TEXT[],
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- إنشاء جدول لتحديثات العمليات
CREATE TABLE IF NOT EXISTS public.operation_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id UUID REFERENCES public.joint_operations(id) ON DELETE CASCADE NOT NULL,
  update_type TEXT NOT NULL CHECK (update_type IN ('status', 'progress', 'alert', 'completion')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- إضافة RLS policies
ALTER TABLE public.security_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joint_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operation_updates ENABLE ROW LEVEL SECURITY;

-- Policies for security_agencies
CREATE POLICY "Everyone can view active agencies"
  ON public.security_agencies FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage agencies"
  ON public.security_agencies FOR ALL
  USING (is_admin(auth.uid()));

-- Policies for agency_communications
CREATE POLICY "Users can view their communications"
  ON public.agency_communications FOR SELECT
  USING (sender_id = get_user_profile(auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Users can send communications"
  ON public.agency_communications FOR INSERT
  WITH CHECK (sender_id = get_user_profile(auth.uid()));

CREATE POLICY "Admins can manage all communications"
  ON public.agency_communications FOR ALL
  USING (is_admin(auth.uid()));

-- Policies for joint_operations
CREATE POLICY "Authorized users can view operations"
  ON public.joint_operations FOR SELECT
  USING (
    is_admin(auth.uid()) OR 
    created_by = get_user_profile(auth.uid()) OR
    commander_id = get_user_profile(auth.uid())
  );

CREATE POLICY "Authorized users can create operations"
  ON public.joint_operations FOR INSERT
  WITH CHECK (is_admin(auth.uid()) OR created_by = get_user_profile(auth.uid()));

CREATE POLICY "Operation creators and commanders can update"
  ON public.joint_operations FOR UPDATE
  USING (
    is_admin(auth.uid()) OR 
    created_by = get_user_profile(auth.uid()) OR
    commander_id = get_user_profile(auth.uid())
  );

-- Policies for operation_updates
CREATE POLICY "Users can view operation updates"
  ON public.operation_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.joint_operations
      WHERE id = operation_updates.operation_id
      AND (
        is_admin(auth.uid()) OR
        created_by = get_user_profile(auth.uid()) OR
        commander_id = get_user_profile(auth.uid())
      )
    )
  );

CREATE POLICY "Authorized users can add updates"
  ON public.operation_updates FOR INSERT
  WITH CHECK (
    updated_by = get_user_profile(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.joint_operations
      WHERE id = operation_updates.operation_id
      AND (
        is_admin(auth.uid()) OR
        created_by = get_user_profile(auth.uid()) OR
        commander_id = get_user_profile(auth.uid())
      )
    )
  );

-- إدراج الأجهزة الأمنية الأساسية
INSERT INTO public.security_agencies (name, name_en, slug, description) VALUES
('الأمن الوقائي', 'Preventive Security', 'preventive-security', 'جهاز الأمن الوقائي الفلسطيني'),
('المخابرات العامة', 'General Intelligence', 'general-intelligence', 'جهاز المخابرات العامة الفلسطيني'),
('قوات الأمن الوطني', 'National Security Forces', 'national-security', 'قوات الأمن الوطني الفلسطيني'),
('الحرس الرئاسي', 'Presidential Guard', 'presidential-guard', 'جهاز الحرس الرئاسي الفلسطيني'),
('الدفاع المدني', 'Civil Defense', 'civil-defense', 'جهاز الدفاع المدني الفلسطيني'),
('قوات حماية المنشآت', 'Facility Protection Forces', 'facility-protection', 'قوات حماية المنشآت الحيوية'),
('الضابطة الجمركية', 'Customs Police', 'customs-police', 'الضابطة الجمركية الفلسطينية'),
('الاستخبارات العسكرية', 'Military Intelligence', 'military-intelligence', 'جهاز الاستخبارات العسكرية')
ON CONFLICT (slug) DO NOTHING;

-- إنشاء trigger للتحديث التلقائي
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_agencies_updated_at
  BEFORE UPDATE ON public.security_agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_communications_updated_at
  BEFORE UPDATE ON public.agency_communications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_joint_operations_updated_at
  BEFORE UPDATE ON public.joint_operations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();