import React, { useState } from 'react';
import { Printer, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { downloadGuidePDF, printGuidePDF } from '@/utils/guidePdfExport';

interface GuidePrintButtonProps {
  sections: any[];
  currentSection?: string;
}

export const GuidePrintButton: React.FC<GuidePrintButtonProps> = ({ sections, currentSection }) => {
  const [exportType, setExportType] = useState<'all' | 'section' | 'current'>('all');
  const [actionType, setActionType] = useState<'download' | 'print'>('print');
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = () => {
    const loadingMessage = actionType === 'print' ? 'جاري التحضير للطباعة...' : 'جاري إنشاء ملف PDF...';
    toast.loading(loadingMessage, { id: 'pdf-export' });
    
    setTimeout(() => {
      try {
        const sectionToUse = (exportType === 'section' || exportType === 'current') ? currentSection : undefined;
        
        if (actionType === 'print') {
          printGuidePDF(sections, sectionToUse);
          toast.success('تم فتح نافذة الطباعة! 🖨️', { id: 'pdf-export' });
        } else {
          downloadGuidePDF(sections, sectionToUse);
          toast.success('تم تحميل الدليل بنجاح! 📄', { id: 'pdf-export' });
        }
        
        setIsOpen(false);
      } catch (error) {
        toast.error('حدث خطأ أثناء المعالجة', { id: 'pdf-export' });
        console.error('PDF error:', error);
      }
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Download className="h-5 w-5" />
          تصدير كـ PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            تصدير دليل المستخدم
          </DialogTitle>
          <DialogDescription>
            اختر نوع التصدير الذي تريده
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">نوع الإجراء:</Label>
            <RadioGroup value={actionType} onValueChange={(value: any) => setActionType(value)}>
              <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="print" id="action-print" />
                <Label htmlFor="action-print" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Printer className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">طباعة مباشرة</p>
                      <p className="text-sm text-gray-600">فتح نافذة الطباعة مباشرة</p>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="download" id="action-download" />
                <Label htmlFor="action-download" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">تحميل PDF</p>
                      <p className="text-sm text-gray-600">حفظ الملف على جهازك</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">المحتوى:</Label>
            <RadioGroup value={exportType} onValueChange={(value: any) => setExportType(value)}>
              <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="all" id="export-all" />
                <Label htmlFor="export-all" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-semibold">الدليل الكامل</p>
                    <p className="text-sm text-gray-600">جميع الأقسام والمواضيع</p>
                  </div>
                </Label>
              </div>
              
              {currentSection && (
                <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors cursor-pointer">
                  <RadioGroupItem value="current" id="export-current" />
                  <Label htmlFor="export-current" className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-semibold">القسم الحالي فقط</p>
                      <p className="text-sm text-gray-600">{currentSection}</p>
                    </div>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleExport} className="flex-1 gap-2">
            {actionType === 'print' ? (
              <>
                <Printer className="h-4 w-4" />
                طباعة الآن
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                تحميل PDF
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
