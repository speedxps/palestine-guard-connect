-- Create security_alerts table for cyber alerts
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create education_materials table
CREATE TABLE IF NOT EXISTS public.education_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'video', 'infographic', 'guide')),
  content TEXT,
  thumbnail_url TEXT,
  file_url TEXT,
  tags TEXT[],
  views_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create investigations table
CREATE TABLE IF NOT EXISTS public.investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cybercrime_cases(id) ON DELETE CASCADE,
  investigator_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'completed', 'suspended')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  findings TEXT,
  next_steps TEXT,
  completion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create risk_assessments table
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cybercrime_cases(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  threat_vectors TEXT[],
  impact_analysis TEXT,
  mitigation_steps TEXT,
  assessed_by UUID NOT NULL,
  assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_alerts
CREATE POLICY "Users can view active alerts"
  ON public.security_alerts FOR SELECT
  USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins and cybercrime can manage alerts"
  ON public.security_alerts FOR ALL
  USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()));

-- RLS Policies for education_materials
CREATE POLICY "Everyone can view education materials"
  ON public.education_materials FOR SELECT
  USING (true);

CREATE POLICY "Admins and cybercrime can manage education materials"
  ON public.education_materials FOR ALL
  USING (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()));

-- RLS Policies for investigations
CREATE POLICY "Users can view relevant investigations"
  ON public.investigations FOR SELECT
  USING (
    investigator_id = get_user_profile(auth.uid()) OR
    is_admin(auth.uid()) OR 
    has_cybercrime_access(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM cybercrime_cases
      WHERE cybercrime_cases.id = investigations.case_id
      AND (
        cybercrime_cases.reporter_id = get_user_profile(auth.uid()) OR
        cybercrime_cases.assigned_officer_id = get_user_profile(auth.uid())
      )
    )
  );

CREATE POLICY "Authorized users can create investigations"
  ON public.investigations FOR INSERT
  WITH CHECK (
    investigator_id = get_user_profile(auth.uid()) AND
    (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()))
  );

CREATE POLICY "Investigators can update their investigations"
  ON public.investigations FOR UPDATE
  USING (
    investigator_id = get_user_profile(auth.uid()) OR
    is_admin(auth.uid()) OR 
    has_cybercrime_access(auth.uid())
  );

-- RLS Policies for risk_assessments
CREATE POLICY "Users can view relevant risk assessments"
  ON public.risk_assessments FOR SELECT
  USING (
    assessed_by = get_user_profile(auth.uid()) OR
    is_admin(auth.uid()) OR 
    has_cybercrime_access(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM cybercrime_cases
      WHERE cybercrime_cases.id = risk_assessments.case_id
      AND (
        cybercrime_cases.reporter_id = get_user_profile(auth.uid()) OR
        cybercrime_cases.assigned_officer_id = get_user_profile(auth.uid())
      )
    )
  );

CREATE POLICY "Authorized users can create risk assessments"
  ON public.risk_assessments FOR INSERT
  WITH CHECK (
    assessed_by = get_user_profile(auth.uid()) AND
    (is_admin(auth.uid()) OR has_cybercrime_access(auth.uid()))
  );

CREATE POLICY "Assessors can update their assessments"
  ON public.risk_assessments FOR UPDATE
  USING (
    assessed_by = get_user_profile(auth.uid()) OR
    is_admin(auth.uid()) OR 
    has_cybercrime_access(auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX idx_security_alerts_active ON public.security_alerts(is_active);
CREATE INDEX idx_education_materials_type ON public.education_materials(type);
CREATE INDEX idx_investigations_case_id ON public.investigations(case_id);
CREATE INDEX idx_investigations_status ON public.investigations(status);
CREATE INDEX idx_risk_assessments_case_id ON public.risk_assessments(case_id);
CREATE INDEX idx_risk_assessments_risk_level ON public.risk_assessments(risk_level);

-- Insert sample data for security alerts
INSERT INTO public.security_alerts (title, description, severity, category, is_active) VALUES
('برنامج فدية جديد يستهدف المؤسسات', 'تم اكتشاف برنامج فدية جديد يستهدف المؤسسات الحكومية. يرجى تحديث أنظمة الحماية فوراً.', 'critical', 'malware', true),
('زيادة في نشاط التصيد الإلكتروني', 'زيادة في نشاط التصيد الإلكتروني عبر رسائل SMS. تأكد من توعية الموظفين.', 'high', 'phishing', true),
('ثغرة أمنية في متصفحات الويب', 'تم اكتشاف ثغرة أمنية خطيرة في بعض متصفحات الويب. يوصى بالتحديث فوراً.', 'high', 'vulnerability', true),
('تحذير من رسائل احتيالية', 'انتشار رسائل احتيالية تنتحل صفة البنوك. يرجى الحذر وعدم الضغط على الروابط المشبوهة.', 'medium', 'fraud', true);

-- Insert sample education materials
INSERT INTO public.education_materials (title, description, type, content, tags) VALUES
('دليل حماية كلمات المرور', 'دليل شامل لإنشاء واستخدام كلمات مرور قوية وآمنة', 'article', 'محتوى تعليمي عن كلمات المرور الآمنة...', ARRAY['أمان', 'كلمات المرور', 'حماية']),
('كيفية التعرف على التصيد الإلكتروني', 'فيديو تعليمي يشرح كيفية التعرف على محاولات التصيد الإلكتروني', 'video', 'رابط الفيديو التعليمي...', ARRAY['تصيد', 'توعية', 'أمان']),
('إنفوجرافيك: التصفح الآمن', 'إنفوجرافيك يوضح أفضل ممارسات التصفح الآمن على الإنترنت', 'infographic', 'محتوى إنفوجرافيك...', ARRAY['تصفح آمن', 'إنترنت', 'حماية']),
('دليل الأمن السيبراني للمبتدئين', 'دليل شامل للمبتدئين حول أساسيات الأمن السيبراني', 'guide', 'محتوى الدليل...', ARRAY['أمن سيبراني', 'مبتدئين', 'تعليم']);