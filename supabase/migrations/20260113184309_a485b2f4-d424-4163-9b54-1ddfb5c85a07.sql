-- زيادة الحد الأقصى للأجهزة لجميع المستخدمين إلى 5
UPDATE profiles 
SET max_devices_allowed = 5 
WHERE max_devices_allowed < 5;