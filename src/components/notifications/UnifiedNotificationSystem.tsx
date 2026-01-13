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
import { CalendarIcon, Copy, Trash2, Send, MessageSquare, Phone, Mail, Printer, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';
import { useTickets } from '@/hooks/useTickets';

// WhatsApp Icon Component
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              تم حفظ التبليغ بنجاح
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              اختر طريقة إرسال التبليغ للمستلم:
            </p>
            
            <div className="grid gap-3">
              <Button 
                onClick={openWhatsApp} 
                className="w-full h-14 text-lg bg-[#25D366] hover:bg-[#128C7E] text-white"
                size="lg"
              >
                <WhatsAppIcon />
                <span className="mr-3">إرسال عبر واتساب</span>
              </Button>
              
              <Button 
                onClick={openSMS} 
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <MessageSquare className="h-6 w-6" />
                <span className="mr-3">إرسال رسالة نصية SMS</span>
              </Button>
              
              <Button 
                onClick={openPhone} 
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Phone className="h-6 w-6" />
                <span className="mr-3">اتصال هاتفي مباشر</span>
              </Button>

              <Button 
                onClick={copyToClipboard} 
                className="w-full h-12"
                variant="outline"
                size="lg"
              >
                <Copy className="h-5 w-5" />
                <span className="mr-2">نسخ النص للإرسال يدوياً</span>
              </Button>
            </div>

            <div className="pt-2 border-t">
              <Button 
                onClick={() => {
                  setShowSendOptions(false);
                  onOpenChange(false);
                  setNotificationText('');
                  setSelectedTemplate('');
                }} 
                variant="ghost" 
                className="w-full"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
