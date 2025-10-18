import React from 'react';
import { CitizenRecordLayout } from '@/components/CitizenRecordLayout';
import { 
  Car, FileText, MapPin, Camera, User, 
  FolderOpen, Bell, Settings 
} from 'lucide-react';
import { toast } from 'sonner';

const TrafficCitizenRecord = () => {
  const handleAction = (actionName: string) => {
    toast.info(`تم النقر على: ${actionName}`);
  };

  const fields = [
    { label: 'ID', value: '1-28486423598', highlighted: true },
    { label: 'Cabinet', value: 'FKRY004', highlighted: true },
    { label: 'رقم الهوية', value: '404706285' },
    { label: 'رقم المركبة', value: '7-2234-09' },
    { label: 'نوع المركبة', value: 'Hyundai Tucson' },
    { label: 'الحالة', value: 'فعالة' },
    { label: 'آخر مخالفة', value: '12 أكتوبر 2025' },
  ];

  const actions = [
    {
      icon: <Car className="h-12 w-12" />,
      label: 'تفاصيل المركبة',
      onClick: () => handleAction('تفاصيل المركبة'),
      color: 'text-primary'
    },
    {
      icon: <FileText className="h-12 w-12" />,
      label: 'سجل المخالفات',
      onClick: () => handleAction('سجل المخالفات'),
      color: 'text-pink-500'
    },
    {
      icon: <MapPin className="h-12 w-12" />,
      label: 'تتبع المركبة',
      onClick: () => handleAction('تتبع المركبة'),
      color: 'text-primary'
    },
    {
      icon: <Camera className="h-12 w-12" />,
      label: 'رصد مخالفة',
      onClick: () => handleAction('رصد مخالفة'),
      color: 'text-pink-500'
    },
    {
      icon: <User className="h-12 w-12" />,
      label: 'بيانات المالك',
      onClick: () => handleAction('بيانات المالك'),
      color: 'text-primary'
    },
    {
      icon: <FolderOpen className="h-12 w-12" />,
      label: 'الوثائق',
      onClick: () => handleAction('الوثائق'),
      color: 'text-orange-500'
    },
    {
      icon: <Bell className="h-12 w-12" />,
      label: 'إرسال إشعار',
      onClick: () => handleAction('إرسال إشعار'),
      color: 'text-primary'
    },
    {
      icon: <Settings className="h-12 w-12" />,
      label: 'إجراءات إدارية',
      onClick: () => handleAction('إجراءات إدارية'),
      color: 'text-pink-500'
    },
  ];

  return (
    <CitizenRecordLayout
      title="المواطن: عصمت عبد الفتاح عبد العزيز دراويش"
      subtitle="🚗 Vehicle & Violation Summary"
      fields={fields}
      actions={actions}
      onCallClick={() => toast.info('الاتصال بالمواطن')}
    />
  );
};

export default TrafficCitizenRecord;
