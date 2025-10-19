-- إضافة حقول معلومات التواصل لجدول cybercrime_cases
ALTER TABLE public.cybercrime_cases
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS national_id TEXT;

-- إضافة فهرس للبحث برقم الهوية
CREATE INDEX IF NOT EXISTS idx_cybercrime_cases_national_id 
ON public.cybercrime_cases(national_id);