-- تحديث أسماء الأقسام القديمة إلى المعرفات الجديدة
UPDATE public.tickets
SET section = CASE 
  WHEN section = 'المخالفات والقضايا' THEN 'traffic_police'
  WHEN section = 'الإستعلام عن المركبات' THEN 'traffic_police'
  WHEN section = 'إدارة المركبات' THEN 'traffic_police'
  WHEN section = 'سجلات المواطنين' THEN 'cid'
  WHEN section = 'الحوادث والبلاغات' THEN 'cid'
  WHEN section = 'الدوريات' THEN 'special_police'
  WHEN section = 'المهام والدوريات' THEN 'special_police'
  WHEN section = 'الأخبار' THEN 'admin'
  WHEN section = 'التقارير والإحصائيات' THEN 'admin'
  WHEN section = 'صلاحيات المستخدمين' THEN 'admin'
  ELSE section
END
WHERE section IN (
  'المخالفات والقضايا',
  'الإستعلام عن المركبات',
  'إدارة المركبات',
  'سجلات المواطنين',
  'الحوادث والبلاغات',
  'الدوريات',
  'المهام والدوريات',
  'الأخبار',
  'التقارير والإحصائيات',
  'صلاحيات المستخدمين'
);