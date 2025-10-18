-- إضافة عمود رقم الهوية الوطنية إلى جدول القضايا القضائية
ALTER TABLE public.judicial_cases
ADD COLUMN IF NOT EXISTS national_id TEXT;

-- إضافة فهرس للبحث السريع برقم الهوية
CREATE INDEX IF NOT EXISTS idx_judicial_cases_national_id 
ON public.judicial_cases(national_id);

-- إضافة تعليق على العمود
COMMENT ON COLUMN public.judicial_cases.national_id IS 'رقم الهوية الوطنية للمتهم أو المدعى عليه';