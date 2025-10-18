import React from 'react';
import { CitizenRecordLayout } from '@/components/CitizenRecordLayout';
import { 
  FileText, TestTube, Users, ScanFace, 
  FileEdit, FolderOpen, Megaphone, Trash2 
} from 'lucide-react';
import { toast } from 'sonner';

const CIDSuspectRecord = () => {
  const handleAction = (actionName: string) => {
    toast.info(`تم النقر على: ${actionName}`);
  };

  const fields = [
    { label: 'ID', value: '1-28486423598', highlighted: true },
    { label: 'Cabinet', value: 'FKRY004', highlighted: true },
    { label: 'رقم الهوية', value: '404706285' },
    { label: 'الحالة', value: 'قيد التحقيق' },
    { label: 'رقم البلاغ', value: 'CID-2025-088' },
    { label: 'آخر تحديث', value: '16 أكتوبر 2025' },
  ];

  const actions = [
    {
      icon: <FileText className="h-12 w-12" />,
      label: 'تقرير الحادث',
      onClick: () => handleAction('تقرير الحادث'),
      color: 'text-primary'
    },
    {
      icon: <TestTube className="h-12 w-12" />,
      label: 'الأدلة الجنائية',
      onClick: () => handleAction('الأدلة الجنائية'),
      color: 'text-pink-500'
    },
    {
      icon: <Users className="h-12 w-12" />,
      label: 'الأشخاص المرتبطون',
      onClick: () => handleAction('الأشخاص المرتبطون'),
      color: 'text-primary'
    },
    {
      icon: <ScanFace className="h-12 w-12" />,
      label: 'التعرف على الوجه',
      onClick: () => handleAction('التعرف على الوجه'),
      color: 'text-pink-500'
    },
    {
      icon: <FileEdit className="h-12 w-12" />,
      label: 'ملاحظات التحقيق',
      onClick: () => handleAction('ملاحظات التحقيق'),
      color: 'text-primary'
    },
    {
      icon: <FolderOpen className="h-12 w-12" />,
      label: 'ملفات القضية',
      onClick: () => handleAction('ملفات القضية'),
      color: 'text-orange-500'
    },
    {
      icon: <Megaphone className="h-12 w-12" />,
      label: 'إرسال تبليغ',
      onClick: () => handleAction('إرسال تبليغ'),
      color: 'text-primary'
    },
    {
      icon: <Trash2 className="h-12 w-12" />,
      label: 'إغلاق القضية',
      onClick: () => handleAction('إغلاق القضية'),
      color: 'text-red-500'
    },
  ];

  return (
    <CitizenRecordLayout
      title="المشتبه: عصمت عبد الفتاح عبد العزيز دراويش"
      subtitle="🕵️ Criminal Investigation Overview"
      fields={fields}
      actions={actions}
      onCallClick={() => toast.info('الاتصال بالمشتبه')}
    />
  );
};

export default CIDSuspectRecord;
