-- المرحلة الأولى: تحسين قاعدة البيانات لدعم تسجيل الدخول بالوجه والبصمة

-- إضافة أعمدة جديدة لجدول profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS face_login_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS biometric_registered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS face_registered_at TIMESTAMP WITH TIME ZONE;

-- التأكد من أن face_data.user_id يشير بشكل صحيح إلى auth.users
-- (الجدول موجود بالفعل، نتأكد فقط من العلاقة)

-- إضافة فهرس لتحسين الأداء عند البحث عن المستخدمين الذين فعلوا تسجيل الدخول بالوجه/البصمة
CREATE INDEX IF NOT EXISTS idx_profiles_face_login ON public.profiles(face_login_enabled) WHERE face_login_enabled = true;
CREATE INDEX IF NOT EXISTS idx_profiles_biometric ON public.profiles(biometric_enabled) WHERE biometric_enabled = true;
CREATE INDEX IF NOT EXISTS idx_face_data_active ON public.face_data(user_id, is_active) WHERE is_active = true;

-- إضافة تعليق توضيحي للأعمدة الجديدة
COMMENT ON COLUMN public.profiles.biometric_enabled IS 'Indicates if biometric login (fingerprint/face id) is enabled for this user';
COMMENT ON COLUMN public.profiles.face_login_enabled IS 'Indicates if face recognition login is enabled for this user';
COMMENT ON COLUMN public.profiles.biometric_registered_at IS 'Timestamp when biometric authentication was first registered';
COMMENT ON COLUMN public.profiles.face_registered_at IS 'Timestamp when face login was first registered';