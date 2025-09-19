import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FileText, Printer } from 'lucide-react';

interface ReportData {
  reportNumber: string;
  date: string;
  time: string;
  location: string;
  incidentType: string;
  description: string;
  officer: string;
  witnesses: string;
  actions: string;
  recommendations: string;
}

interface PoliceReportGeneratorProps {
  onReportGenerated?: (report: string) => void;
}

const PoliceReportGenerator: React.FC<PoliceReportGeneratorProps> = ({ onReportGenerated }) => {
  const [reportData, setReportData] = useState<ReportData>({
    reportNumber: `${new Date().toISOString().split('T')[0].replace(/-/g, '')}/${Math.floor(Math.random() * 1000)}`,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    location: '',
    incidentType: '',
    description: '',
    officer: '',
    witnesses: '',
    actions: '',
    recommendations: ''
  });

  const incidentTypes = [
    'حادث مروري',
    'سرقة',
    'اعتداء',
    'مشاجرة',
    'تخريب ممتلكات',
    'جريمة إلكترونية',
    'تظاهرة غير مرخصة',
    'مخالفة مرورية',
    'أخرى'
  ];

  const generateReport = () => {
    const report = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    تقرير شرطة فلسطين
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

رقم التقرير: ${reportData.reportNumber}
التاريخ: ${new Date(reportData.date).toLocaleDateString('ar-PS')}
الوقت: ${reportData.time}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                 بيانات الحادث
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

موقع الحادث: ${reportData.location}
نوع الحادث: ${reportData.incidentType}

وصف الحادث:
${reportData.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                   الضابط المحرر
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

الضابط: ${reportData.officer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                     الشهود
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${reportData.witnesses || 'لا يوجد شهود'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
               الإجراءات المتخذة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${reportData.actions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                   التوصيات
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${reportData.recommendations}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                 توقيع الضابط المحرر
                 
التوقيع: ____________________

التاريخ: ${new Date().toLocaleDateString('ar-PS')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    onReportGenerated?.(report);
    return report;
  };

  const handlePrint = () => {
    const report = generateReport();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>تقرير شرطة - ${reportData.reportNumber}</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                margin: 20px;
                line-height: 1.6;
                direction: rtl;
              }
              pre {
                white-space: pre-wrap;
                font-family: 'Courier New', monospace;
                font-size: 12px;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <pre>${report}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleInputChange = (field: keyof ReportData, value: string) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-arabic flex items-center gap-2">
          <FileText className="h-5 w-5" />
          مولد تقارير الشرطة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reportNumber" className="font-arabic">رقم التقرير</Label>
            <Input
              id="reportNumber"
              value={reportData.reportNumber}
              onChange={(e) => handleInputChange('reportNumber', e.target.value)}
              className="font-arabic"
            />
          </div>
          
          <div>
            <Label htmlFor="officer" className="font-arabic">اسم الضابط المحرر</Label>
            <Input
              id="officer"
              value={reportData.officer}
              onChange={(e) => handleInputChange('officer', e.target.value)}
              className="font-arabic"
              placeholder="اسم الضابط المحرر للتقرير"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date" className="font-arabic">التاريخ</Label>
            <Input
              id="date"
              type="date"
              value={reportData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="time" className="font-arabic">الوقت</Label>
            <Input
              id="time"
              type="time"
              value={reportData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location" className="font-arabic">موقع الحادث</Label>
          <Input
            id="location"
            value={reportData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="font-arabic"
            placeholder="العنوان التفصيلي لموقع الحادث"
          />
        </div>

        <div>
          <Label htmlFor="incidentType" className="font-arabic">نوع الحادث</Label>
          <Select onValueChange={(value) => handleInputChange('incidentType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الحادث" />
            </SelectTrigger>
            <SelectContent>
              {incidentTypes.map(type => (
                <SelectItem key={type} value={type} className="font-arabic">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description" className="font-arabic">وصف الحادث</Label>
          <Textarea
            id="description"
            value={reportData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="font-arabic min-h-[100px]"
            placeholder="وصف مفصل لتفاصيل الحادث وملابساته"
          />
        </div>

        <div>
          <Label htmlFor="witnesses" className="font-arabic">الشهود</Label>
          <Textarea
            id="witnesses"
            value={reportData.witnesses}
            onChange={(e) => handleInputChange('witnesses', e.target.value)}
            className="font-arabic"
            placeholder="أسماء وبيانات الشهود إن وجدوا"
          />
        </div>

        <div>
          <Label htmlFor="actions" className="font-arabic">الإجراءات المتخذة</Label>
          <Textarea
            id="actions"
            value={reportData.actions}
            onChange={(e) => handleInputChange('actions', e.target.value)}
            className="font-arabic"
            placeholder="الإجراءات التي تم اتخاذها في موقع الحادث"
          />
        </div>

        <div>
          <Label htmlFor="recommendations" className="font-arabic">التوصيات</Label>
          <Textarea
            id="recommendations"
            value={reportData.recommendations}
            onChange={(e) => handleInputChange('recommendations', e.target.value)}
            className="font-arabic"
            placeholder="التوصيات والإجراءات المقترحة"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handlePrint}
            className="font-arabic flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            طباعة التقرير
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              const report = generateReport();
              navigator.clipboard.writeText(report);
              toast.success('تم نسخ التقرير إلى الحافظة');
            }}
            className="font-arabic"
          >
            نسخ التقرير
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoliceReportGenerator;