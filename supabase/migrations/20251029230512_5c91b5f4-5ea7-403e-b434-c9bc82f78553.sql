-- إضافة عمود max_devices_allowed في جدول profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS max_devices_allowed integer DEFAULT 1 NOT NULL;

COMMENT ON COLUMN public.profiles.max_devices_allowed IS 'عدد الأجهزة المسموح بها للمستخدم';

-- تحديث القيم الموجودة للتأكد من أن جميع المستخدمين لديهم قيمة افتراضية
UPDATE public.profiles 
SET max_devices_allowed = 1 
WHERE max_devices_allowed IS NULL;