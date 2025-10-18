import React from 'react';
import { CitizenRecordLayout } from '@/components/CitizenRecordLayout';
import { 
  FolderOpen, Scale, FileText, Mail, 
  Clock, BarChart3, FileSignature, CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';

const JudicialCaseRecord = () => {
  const handleAction = (actionName: string) => {
    toast.info(`تم النقر على: ${actionName}`);
  };

  const fields = [
    { label: 'ID', value: '1-28486423598', highlighted: true },
    { label: 'Cabinet', value: 'FKRY004', highlighted: true },
    { label: 'رقم القضية', value: 'JP-2025-145' },
    { label: 'نوع القضية', value: 'مدنية' },
    { label: 'الحالة', value: 'جارية' },
    { label: 'المحكمة', value: 'رام الله العليا' },
    { label: 'الجلسة القادمة', value: '22 أكتوبر 2025' },
  ];

  const actions = [
    {
      icon: <FolderOpen className="h-12 w-12" />,
      label: 'تفاصيل القضية',
      onClick: () => handleAction('تفاصيل القضية'),
      color: 'text-primary'
    },
    {
      icon: <Scale className="h-12 w-12" />,
      label: 'القاضي المسؤول',
      onClick: () => handleAction('القاضي المسؤول'),
      color: 'text-pink-500'
    },
    {
      icon: <FileText className="h-12 w-12" />,
      label: 'المستندات القضائية',
      onClick: () => handleAction('المستندات القضائية'),
      color: 'text-primary'
    },
    {
      icon: <Mail className="h-12 w-12" />,
      label: 'إشعار المحكمة',
      onClick: () => handleAction('إشعار المحكمة'),
      color: 'text-pink-500'
    },
    {
      icon: <Clock className="h-12 w-12" />,
      label: 'تتبع القضية',
      onClick: () => handleAction('تتبع القضية'),
      color: 'text-primary'
    },
    {
      icon: <BarChart3 className="h-12 w-12" />,
      label: 'إحصائيات القضية',
      onClick: () => handleAction('إحصائيات القضية'),
      color: 'text-orange-500'
    },
    {
      icon: <FileSignature className="h-12 w-12" />,
      label: 'التوقيع الرقمي',
      onClick: () => handleAction('التوقيع الرقمي'),
      color: 'text-primary'
    },
    {
      icon: <CheckCircle className="h-12 w-12" />,
      label: 'إنهاء القضية',
      onClick: () => handleAction('إنهاء القضية'),
      color: 'text-green-500'
    },
  ];

  return (
    <CitizenRecordLayout
      title="القضية رقم: JP-2025-145"
      subtitle="⚖️ Judicial Case Overview"
      fields={fields}
      actions={actions}
      showCallButton={false}
    />
  );
};

export default JudicialCaseRecord;
