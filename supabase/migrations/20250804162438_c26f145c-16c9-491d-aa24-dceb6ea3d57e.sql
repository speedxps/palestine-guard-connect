-- إضافة بيانات وهمية للجرائم الإلكترونية عن محافظة الخليل وفلسطين
WITH random_users AS (
  SELECT user_id FROM public.profiles WHERE is_active = true ORDER BY random() LIMIT 5
)
INSERT INTO public.cybercrime_reports (id, reporter_id, crime_type, description, status, platform, evidence_files, created_at, updated_at) 
SELECT 
  gen_random_uuid(),
  (SELECT user_id FROM random_users OFFSET 0 LIMIT 1),
  'harassment'::cybercrime_type,
  'قضية ابتزاز إلكتروني في الخليل - تم تهديد المواطن بنشر صور شخصية مقابل مبلغ مالي',
  'in_progress'::incident_status,
  'واتس آب',
  ARRAY['screenshot1.jpg', 'conversation_log.txt'],
  now() - interval '5 days',
  now() - interval '1 day'

UNION ALL

SELECT 
  gen_random_uuid(),
  (SELECT user_id FROM random_users OFFSET 1 LIMIT 1),
  'fraud'::cybercrime_type,
  'احتيال مالي عبر الإنترنت - محاولة سرقة بيانات حسابات بنكية من مواطنين في بني نعيم',
  'in_progress'::incident_status,
  'فيسبوك',
  ARRAY['fake_page_screenshot.jpg', 'victim_statement.pdf'],
  now() - interval '3 days',
  now() - interval '6 hours'

UNION ALL

SELECT 
  gen_random_uuid(),
  (SELECT user_id FROM random_users OFFSET 2 LIMIT 1),
  'other'::cybercrime_type,
  'اختراق حسابات شخصية لطلاب جامعة الخليل وسرقة بيانات شخصية',
  'new'::incident_status,
  'إنستغرام',
  ARRAY['hacked_account_evidence.jpg'],
  now() - interval '1 day',
  now() - interval '1 day'

UNION ALL

SELECT 
  gen_random_uuid(),
  (SELECT user_id FROM random_users OFFSET 3 LIMIT 1),
  'harassment'::cybercrime_type,
  'ابتزاز جنسي لفتاة في دورا - تهديد بنشر مقاطع فيديو خاصة',
  'resolved'::incident_status,
  'تيليجرام',
  ARRAY['chat_evidence.jpg', 'police_report.pdf'],
  now() - interval '10 days',
  now() - interval '2 days'

UNION ALL

SELECT 
  gen_random_uuid(),
  (SELECT user_id FROM random_users OFFSET 4 LIMIT 1),
  'fraud'::cybercrime_type,
  'نصب واحتيال في بيع سيارات وهمية عبر المواقع الإلكترونية - ضحايا من الخليل وبيت لحم',
  'in_progress'::incident_status,
  'أوليكس',
  ARRAY['fake_ads.jpg', 'money_transfer_receipts.pdf'],
  now() - interval '7 days',
  now() - interval '3 days';