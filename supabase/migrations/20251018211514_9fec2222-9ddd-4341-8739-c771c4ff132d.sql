-- إضافة حقول الموقع الجغرافي لجدول citizens
ALTER TABLE public.citizens
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- إضافة فهرس للبحث السريع بالموقع
CREATE INDEX IF NOT EXISTS idx_citizens_location ON public.citizens(latitude, longitude);