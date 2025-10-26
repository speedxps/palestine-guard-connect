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
import { exportGuideToPDF } from '@/utils/guidePdfExport';

interface GuidePrintButtonProps {
  sections: any[];
  currentSection?: string;
}

export const GuidePrintButton: React.FC<GuidePrintButtonProps> = ({ sections, currentSection }) => {
  const [exportType, setExportType] = useState<'all' | 'section' | 'current'>('all');
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = () => {
    toast.loading('جاري إنشاء ملف PDF...', { id: 'pdf-export' });
    
    setTimeout(() => {
      try {
        if (exportType === 'all') {
          exportGuideToPDF(sections);
        } else if (exportType === 'section' && currentSection) {
          exportGuideToPDF(sections, currentSection);
        } else if (exportType === 'current' && currentSection) {
          exportGuideToPDF(sections, currentSection);
        }
        
        toast.success('تم تصدير الدليل بنجاح! 📄', { id: 'pdf-export' });
        setIsOpen(false);
      } catch (error) {
        toast.error('حدث خطأ أثناء التصدير', { id: 'pdf-export' });
        console.error('PDF export error:', error);
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
          <RadioGroup value={exportType} onValueChange={(value: any) => setExportType(value)}>
            <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="all" id="export-all" />
              <Label htmlFor="export-all" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-semibold">الدليل الكامل</p>
                  <p className="text-sm text-gray-600">تصدير جميع الأقسام والمواضيع</p>
                </div>
              </Label>
            </div>
            
            {currentSection && (
              <div className="flex items-center space-x-2 space-x-reverse p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="current" id="export-current" />
                <Label htmlFor="export-current" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-semibold">القسم الحالي فقط</p>
                    <p className="text-sm text-gray-600">تصدير {currentSection}</p>
                  </div>
                </Label>
              </div>
            )}
          </RadioGroup>

          <div className="bg-blue-50 border-r-4 border-blue-400 p-3 rounded">
            <p className="text-sm text-blue-800">
              ℹ️ <strong>ملاحظة:</strong> سيتم حفظ الملف بصيغة PDF على جهازك.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleExport} className="flex-1 gap-2">
            <Printer className="h-4 w-4" />
            تصدير PDF
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
