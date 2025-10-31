import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Copy, Trash2, Send, MessageSquare, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';
import { useTickets } from '@/hooks/useTickets';

interface UnifiedNotificationSystemProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientType: 'citizen' | 'vehicle_owner' | 'incident_party' | 'patrol_member';
  recipientId: string;
  recipientName: string;
  recipientNationalId?: string;
  recipientPhone?: string;
  contextType: 'citizen' | 'vehicle' | 'incident' | 'patrol' | 'cybercrime' | 'judicial';
  contextId: string;
}

const notificationTemplates = [
  { value: 'court_summons', label: 'استدعاء محكمة', text: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنفيدكم بضرورة الحضور إلى المحكمة بتاريخ {date} يوم {day} الساعة {time} وذلك للنظر في القضية رقم [رقم القضية].\n\nمع وافر الاحترام،\nالشرطة الفلسطينية' },
  { value: 'police_station_summons', label: 'استدعاء مركز شرطة', text: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنفيدكم بضرورة الحضور إلى مركز الشرطة بتاريخ {date} يوم {day} الساعة {time} وذلك للإدلاء بإفادتكم حول [الموضوع].\n\nمع التقدير،\nالشرطة الفلسطينية' },
  { value: 'payment_notice', label: 'إشعار دفع مخالفة', text: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنفيدكم بوجود مخالفة مرورية بحقكم بمبلغ [المبلغ] شيكل، يرجى المبادرة بالدفع خلال [عدد الأيام] يوم من تاريخ هذا الإشعار.\n\nالشرطة الفلسطينية' },
  { value: 'case_closure', label: 'إشعار إغلاق قضية', text: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنفيدكم بأنه تم إغلاق القضية رقم [رقم القضية] بتاريخ {date}.\n\nمع وافر الاحترام،\nالشرطة الفلسطينية' },
  { value: 'investigation_update', label: 'تحديث تحقيق', text: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنفيدكم بتحديث حالة التحقيق في القضية رقم [رقم القضية]. للاستفسار يرجى التواصل معنا.\n\nالشرطة الفلسطينية' },
  { value: 'witness_summons', label: 'استدعاء شاهد', text: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنطلب منكم الحضور بصفتكم شاهداً في القضية رقم [رقم القضية] بتاريخ {date} يوم {day} الساعة {time}.\n\nمع التقدير،\nالشرطة الفلسطينية' },
  { value: 'address_update', label: 'طلب تحديث عنوان', text: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنرجو منكم تحديث بيانات عنوانكم لدى سجلاتنا في أقرب وقت ممكن.\n\nالشرطة الفلسطينية' },
  { value: 'document_request', label: 'طلب مستندات', text: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nيرجى تزويدنا بالمستندات التالية: [قائمة المستندات] وذلك قبل تاريخ {date}.\n\nالشرطة الفلسطينية' },
  { value: 'appointment_reminder', label: 'تذكير بموعد', text: 'السيد/ة {fullName}\nرقم الهوية: {nationalId}\n\nنذكركم بموعدكم المحدد بتاريخ {date} يوم {day} الساعة {time} في [المكان].\n\nالشرطة الفلسطينية' },
  { value: 'custom', label: 'رسالة مخصصة', text: '' },
];

const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const UnifiedNotificationSystem: React.FC<UnifiedNotificationSystemProps> = ({
  open,
  onOpenChange,
  recipientType,
  recipientId,
  recipientName,
  recipientNationalId,
  recipientPhone,
  contextType,
  contextId,
}) => {
  const [notificationText, setNotificationText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customDate, setCustomDate] = useState<Date>();
  const [customDay, setCustomDay] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [showSendOptions, setShowSendOptions] = useState(false);

  const { sendNotification } = useNotifications({ contextType, contextId });
  const { logTicket } = useTickets();

  const fillTemplate = () => {
    const template = notificationTemplates.find(t => t.value === selectedTemplate);
    if (!template) return;

    let filledText = template.text
      .replace(/{fullName}/g, recipientName)
      .replace(/{nationalId}/g, recipientNationalId || 'غير متوفر')
      .replace(/{date}/g, customDate ? format(customDate, 'dd/MM/yyyy', { locale: ar }) : '[التاريخ]')
      .replace(/{day}/g, customDay || '[اليوم]')
      .replace(/{time}/g, customTime || '[الوقت]');

    setNotificationText(filledText);
    toast.success('تم ملء القالب بنجاح');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(notificationText);
    toast.success('تم نسخ النص');
  };

  const clearNotification = () => {
    setNotificationText('');
    setSelectedTemplate('');
    setCustomDate(undefined);
    setCustomDay('');
    setCustomTime('');
    toast.info('تم مسح النموذج');
  };

  const handleSendNotification = async () => {
    if (!notificationText.trim()) {
      toast.error('يرجى إدخال نص التبليغ');
      return;
    }

    const success = await sendNotification(
      recipientId,
      notificationText,
      selectedTemplate,
      customDate,
      customDay,
      customTime
    );

    if (success) {
      await logTicket({
        section: contextType,
        action_type: 'create',
        description: `إرسال تبليغ رسمي إلى ${recipientName}`,
        metadata: {
          recipientId,
          template: selectedTemplate,
          notificationLength: notificationText.length,
        },
      });

      setShowSendOptions(true);
    }
  };

  const openWhatsApp = () => {
    if (!recipientPhone) {
      toast.error('رقم الهاتف غير متوفر');
      return;
    }
    const encodedText = encodeURIComponent(notificationText);
    window.open(`https://wa.me/${recipientPhone}?text=${encodedText}`, '_blank');
    onOpenChange(false);
  };

  const openSMS = () => {
    if (!recipientPhone) {
      toast.error('رقم الهاتف غير متوفر');
      return;
    }
    const encodedText = encodeURIComponent(notificationText);
    window.open(`sms:${recipientPhone}?body=${encodedText}`, '_blank');
    onOpenChange(false);
  };

  const openPhone = () => {
    if (!recipientPhone) {
      toast.error('رقم الهاتف غير متوفر');
      return;
    }
    window.open(`tel:${recipientPhone}`, '_blank');
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !showSendOptions} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إرسال تبليغ رسمي</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Recipient Info */}
            <Card className="p-4 bg-muted/50">
              <div className="space-y-2 text-sm">
                <div><strong>المستلم:</strong> {recipientName}</div>
                {recipientNationalId && <div><strong>رقم الهوية:</strong> {recipientNationalId}</div>}
                {recipientPhone && <div><strong>الهاتف:</strong> {recipientPhone}</div>}
              </div>
            </Card>

            {/* Template Selection */}
            <div className="space-y-2">
              <Label>القالب</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر قالب جاهز" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTemplates.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {customDate ? format(customDate, 'dd/MM/yyyy', { locale: ar }) : 'اختر التاريخ'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customDate}
                      onSelect={setCustomDate}
                      locale={ar}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>اليوم</Label>
                <Select value={customDay} onValueChange={setCustomDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر اليوم" />
                  </SelectTrigger>
                  <SelectContent>
                    {arabicDays.map((day) => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الوقت</Label>
                <Input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                />
              </div>
            </div>

            {/* Notification Text */}
            <div className="space-y-2">
              <Label>نص التبليغ</Label>
              <Textarea
                value={notificationText}
                onChange={(e) => setNotificationText(e.target.value)}
                rows={10}
                placeholder="اكتب نص التبليغ هنا..."
                dir="rtl"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={fillTemplate} variant="outline" disabled={!selectedTemplate}>
                ملء القالب
              </Button>
              <Button onClick={copyToClipboard} variant="outline" disabled={!notificationText}>
                <Copy className="h-4 w-4 ml-2" />
                نسخ
              </Button>
              <Button onClick={clearNotification} variant="outline">
                <Trash2 className="h-4 w-4 ml-2" />
                مسح
              </Button>
              <Button onClick={handleSendNotification} className="mr-auto">
                <Send className="h-4 w-4 ml-2" />
                حفظ وإرسال
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Options Dialog */}
      <Dialog open={showSendOptions} onOpenChange={setShowSendOptions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>اختر طريقة الإرسال</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">تم حفظ التبليغ بنجاح. اختر طريقة الإرسال:</p>
            
            <Button onClick={openWhatsApp} className="w-full" variant="outline" size="lg">
              <MessageSquare className="h-5 w-5 ml-2" />
              إرسال عبر WhatsApp
            </Button>
            
            <Button onClick={openSMS} className="w-full" variant="outline" size="lg">
              <MessageSquare className="h-5 w-5 ml-2" />
              إرسال رسالة نصية (SMS)
            </Button>
            
            <Button onClick={openPhone} className="w-full" variant="outline" size="lg">
              <Phone className="h-5 w-5 ml-2" />
              اتصال هاتفي
            </Button>

            <Button 
              onClick={() => {
                setShowSendOptions(false);
                onOpenChange(false);
              }} 
              variant="ghost" 
              className="w-full"
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
