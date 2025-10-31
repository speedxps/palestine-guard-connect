-- المرحلة 5: إصلاح الجداول غير المرتبطة (مصحح)

-- 1. إضافة national_id إلى جدول incidents
ALTER TABLE public.incidents
ADD COLUMN IF NOT EXISTS reporter_national_id TEXT;

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_incidents_reporter_national_id 
ON public.incidents(reporter_national_id);

-- 2. إضافة national_id إلى جدول patrols (للضباط)
ALTER TABLE public.patrols
ADD COLUMN IF NOT EXISTS officer_national_id TEXT;

CREATE INDEX IF NOT EXISTS idx_patrols_officer_national_id 
ON public.patrols(officer_national_id);

-- 3. إضافة national_id إلى official_notifications
ALTER TABLE public.official_notifications
ADD COLUMN IF NOT EXISTS recipient_national_id TEXT;

CREATE INDEX IF NOT EXISTS idx_official_notifications_national_id
ON public.official_notifications(recipient_national_id);

-- 4. إضافة national_id إلى investigation_notes
ALTER TABLE public.investigation_notes
ADD COLUMN IF NOT EXISTS subject_national_id TEXT;

CREATE INDEX IF NOT EXISTS idx_investigation_notes_national_id
ON public.investigation_notes(subject_national_id);

-- تعليق: سيتم ملء هذه الحقول تدريجياً من خلال التطبيق
-- عند إضافة سجلات جديدة أو تحديث السجلات الموجودة