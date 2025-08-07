-- Add some sample posts for testing
INSERT INTO public.posts (user_id, content, privacy_level, created_at) VALUES
(
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'مرحباً بكم في منصة الشرطة الجديدة! نحن نعمل معاً لخدمة المجتمع وضمان الأمن والسلامة للجميع.',
  'public',
  now() - interval '2 hours'
),
(
  (SELECT id FROM public.profiles WHERE role = 'officer' LIMIT 1),
  'تم الانتهاء من دورية اليوم بنجاح. جميع المناطق آمنة ولا توجد حوادث تُذكر.',
  'public',
  now() - interval '1 hour'
),
(
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'تذكير: اجتماع الفريق غداً الساعة 9 صباحاً لمناقشة الخطة الأمنية الجديدة.',
  'admin_only',
  now() - interval '30 minutes'
),
(
  (SELECT id FROM public.profiles WHERE role = 'officer' LIMIT 1),
  'شكراً للمواطنين على تعاونهم المستمر مع رجال الأمن. معاً نبني مجتمعاً أكثر أماناً.',
  'public',
  now() - interval '15 minutes'
);