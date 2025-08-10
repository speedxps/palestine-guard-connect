-- Seed additional dummy traffic records for testing
-- This migration inserts sample data with fake national IDs like 123456789
INSERT INTO public.traffic_records (national_id, citizen_name, record_type, record_date, details)
VALUES
  ('123456789', 'خالد صالح', 'violation', '2025-07-01', 'تجاوز الإشارة الحمراء'),
  ('123456789', 'خالد صالح', 'case', '2025-07-20', 'مشاجرة بسيطة - تم الصلح'),
  ('123456789', 'خالد صالح', 'violation', '2025-08-05', 'تجاوز السرعة المحددة'),

  ('987654321', 'نور الهادي', 'violation', '2025-06-18', 'وقوف خاطئ'),
  ('987654321', 'نور الهادي', 'case', '2025-08-02', 'قضية مدنية - قيد المتابعة'),

  ('111222333', 'سارة محمد', 'violation', '2025-05-12', 'عدم ربط حزام الأمان'),
  ('111222333', 'سارة محمد', 'case', '2025-07-28', 'قضية مالية - سددت وتم الإغلاق');