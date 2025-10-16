-- تفعيل realtime على جدول tickets
ALTER TABLE public.tickets REPLICA IDENTITY FULL;

-- إضافة جدول tickets إلى publication لـ realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;