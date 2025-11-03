import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/BackButton';
import { Printer, Download, AlertTriangle, CheckCircle, Scale, Car, FileText } from 'lucide-react';
import { toast } from 'sonner';
import policeLogo from '@/assets/police-logo.png';

interface ClearanceData {
  citizen: any;
  violations: any[];
  unpaidViolations: any[];
  cybercrimeCase: any[];
  judicialCases: any[];
  totalDue: number;
  hasPendingIssues: boolean;
}

export default function ClearanceCertificate() {
  const { nationalId } = useParams<{ nationalId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ClearanceData | null>(null);

  useEffect(() => {
    if (nationalId) {
      fetchClearanceData(nationalId);
    }
  }, [nationalId]);

  const fetchClearanceData = async (natId: string) => {
    setLoading(true);
    try {
      // جلب بيانات المواطن
      const { data: citizen, error: citizenError } = await supabase
        .from('citizens')
        .select('*')
        .eq('national_id', natId)
        .single();

      if (citizenError) throw citizenError;
      if (!citizen) {
        toast.error('لم يتم العثور على المواطن');
        return;
      }

      // جلب جميع المخالفات
      const { data: allViolations } = await supabase
        .from('traffic_records')
        .select('*')
        .eq('national_id', natId);

      // فلترة المخالفات غير المسددة (المخالفات غير المحلولة)
      const unpaidViolations = (allViolations || []).filter(v => !v.is_resolved);

      // حساب المبلغ الإجمالي المستحق (استخدام details كمعلومات عن المبلغ)
      const totalDue = unpaidViolations.length * 100; // افتراضياً 100 شيكل لكل مخالفة

      // جلب قضايا الجرائم الإلكترونية
      const { data: cybercrimeCase } = await supabase
        .from('cybercrime_cases')
        .select('*')
        .eq('national_id', natId)
        .neq('status', 'closed');

      // جلب القضايا القضائية
      const { data: judicialCases } = await supabase
        .from('judicial_cases')
        .select('*')
        .eq('national_id', natId)
        .neq('status', 'closed');

      const hasPendingIssues = 
        unpaidViolations.length > 0 || 
        (cybercrimeCase?.length || 0) > 0 || 
        (judicialCases?.length || 0) > 0;

      setData({
        citizen,
        violations: allViolations || [],
        unpaidViolations,
        cybercrimeCase: cybercrimeCase || [],
        judicialCases: judicialCases || [],
        totalDue,
        hasPendingIssues
      });
    } catch (error) {
      console.error('Error fetching clearance data:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!data) return;
    
    toast.info('جاري تحضير ملف PDF...');
    
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // إعداد اللغة العربية
      doc.setR2L(true);
      doc.setLanguage('ar');

      let yPos = 20;

      // الشعار والعنوان
      doc.setFontSize(24);
      doc.text('شهادة براءة ذمة', 105, yPos, { align: 'center' });
      yPos += 10;

      doc.setFontSize(16);
      doc.text('الشرطة الفلسطينية', 105, yPos, { align: 'center' });
      yPos += 15;

      // بيانات المواطن
      doc.setFontSize(14);
      doc.text('بيانات المواطن:', 20, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.text(`الاسم: ${data.citizen.full_name}`, 20, yPos);
      yPos += 6;
      doc.text(`رقم الهوية: ${data.citizen.national_id}`, 20, yPos);
      yPos += 10;

      // الحالة
      doc.setFontSize(14);
      if (data.hasPendingIssues) {
        doc.setTextColor(220, 38, 38);
        doc.text('⚠ توجد مستحقات أو قضايا معلقة', 105, yPos, { align: 'center' });
      } else {
        doc.setTextColor(34, 197, 94);
        doc.text('✓ براءة ذمة - لا توجد مستحقات', 105, yPos, { align: 'center' });
      }
      doc.setTextColor(0, 0, 0);
      yPos += 15;

      // المخالفات غير المسددة
      if (data.unpaidViolations.length > 0) {
        doc.setFontSize(12);
        doc.text(`المخالفات غير المسددة (${data.unpaidViolations.length}):`, 20, yPos);
        yPos += 8;

          data.unpaidViolations.forEach((v, i) => {
            doc.setFontSize(10);
            doc.text(`${i + 1}. ${v.record_type === 'violation' ? 'مخالفة' : 'قضية'} - غير محلولة`, 25, yPos);
            yPos += 6;
          });

        yPos += 5;
        doc.setFontSize(12);
        doc.setTextColor(220, 38, 38);
        doc.text(`المبلغ الإجمالي المستحق: ${data.totalDue} شيكل`, 20, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 10;
      }

      // القضايا المفتوحة
      if (data.cybercrimeCase.length > 0 || data.judicialCases.length > 0) {
        doc.setFontSize(12);
        doc.text('القضايا المفتوحة:', 20, yPos);
        yPos += 8;

        [...data.cybercrimeCase, ...data.judicialCases].forEach((c, i) => {
          doc.setFontSize(10);
          doc.text(`${i + 1}. ${c.title || c.case_number} - ${c.status}`, 25, yPos);
          yPos += 6;
        });
      }

      // التوقيع
      yPos = 270;
      doc.setFontSize(10);
      doc.text('التاريخ: ' + new Date().toLocaleDateString('ar'), 20, yPos);
      doc.text('التوقيع: _______________', 140, yPos);

      doc.save(`براءة-ذمة-${data.citizen.national_id}.pdf`);
      toast.success('تم تحميل ملف PDF');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('حدث خطأ أثناء إنشاء ملف PDF');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">لم يتم العثور على البيانات</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* أزرار الطباعة والتحميل - تختفي عند الطباعة */}
      <div className="print:hidden fixed top-6 left-6 z-50 flex gap-2">
        <BackButton />
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          طباعة
        </Button>
        <Button onClick={handleDownload} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          تحميل PDF
        </Button>
      </div>

      {/* المستند - A4 */}
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '210mm' }}>
        <div className="bg-white p-8 min-h-[297mm]" style={{ pageBreakAfter: 'always' }}>
          {/* الرأسية */}
          <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
            <img 
              src={policeLogo} 
              alt="شعار الشرطة الفلسطينية" 
              className="w-20 h-20 mx-auto mb-3 object-contain"
            />
            <h1 className="text-2xl font-bold mb-1">شهادة براءة ذمة</h1>
            <h2 className="text-lg text-gray-600">الشرطة الفلسطينية</h2>
            <p className="text-xs text-gray-500 mt-1">
              نسخة مخصصة للمحاكم والجهات الرسمية
            </p>
          </div>

          {/* بيانات المواطن */}
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <h3 className="font-bold text-sm mb-3 border-b pb-2">بيانات المواطن</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold">الاسم الكامل:</span>
                <span className="mr-2">{data.citizen.full_name}</span>
              </div>
              <div>
                <span className="font-semibold">رقم الهوية:</span>
                <span className="mr-2">{data.citizen.national_id}</span>
              </div>
              {data.citizen.phone && (
                <div>
                  <span className="font-semibold">الهاتف:</span>
                  <span className="mr-2">{data.citizen.phone}</span>
                </div>
              )}
              {data.citizen.address && (
                <div>
                  <span className="font-semibold">العنوان:</span>
                  <span className="mr-2">{data.citizen.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* حالة الذمة المالية */}
          <div className={`mb-4 p-4 rounded text-center ${data.hasPendingIssues ? 'bg-red-100 border-2 border-red-500' : 'bg-green-100 border-2 border-green-500'}`}>
            {data.hasPendingIssues ? (
              <>
                <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="font-bold text-red-700">توجد مستحقات أو قضايا معلقة</p>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="font-bold text-green-700">براءة ذمة - لا توجد مستحقات</p>
              </>
            )}
          </div>

          {/* المخالفات غير المسددة */}
          {data.unpaidViolations.length > 0 && (
            <div className="mb-4">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                <Car className="w-4 h-4" />
                المخالفات المرورية غير المسددة ({data.unpaidViolations.length})
              </h3>
              <div className="space-y-1 text-sm">
                {data.unpaidViolations.slice(0, 5).map((v, idx) => (
                  <div key={v.id} className="flex justify-between p-2 bg-orange-50 rounded">
                    <span>{idx + 1}. {v.record_type === 'violation' ? 'مخالفة' : 'قضية'} - {new Date(v.record_date).toLocaleDateString('ar')}</span>
                    <span className="text-red-600 font-semibold">غير محلولة</span>
                  </div>
                ))}
                {data.unpaidViolations.length > 5 && (
                  <p className="text-xs text-gray-600 text-center mt-2">
                    ... و {data.unpaidViolations.length - 5} مخالفة أخرى
                  </p>
                )}
              </div>
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-center">
                <p className="font-bold text-red-700">
                  المبلغ الإجمالي المستحق: {data.totalDue} شيكل
                </p>
              </div>
            </div>
          )}

          {/* القضايا المفتوحة */}
          {(data.cybercrimeCase.length > 0 || data.judicialCases.length > 0) && (
            <div className="mb-4">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4" />
                القضايا المفتوحة ({data.cybercrimeCase.length + data.judicialCases.length})
              </h3>
              <div className="space-y-1 text-sm">
                {[...data.cybercrimeCase, ...data.judicialCases].slice(0, 3).map((c, idx) => (
                  <div key={c.id} className="p-2 bg-red-50 rounded">
                    <p className="font-semibold text-xs">{idx + 1}. {c.title || c.case_number}</p>
                    <p className="text-xs text-gray-600">{c.case_type} - {c.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* إحصائيات مختصرة */}
          <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-gray-100 rounded">
              <p className="text-lg font-bold">{data.violations.length}</p>
              <p className="text-gray-600">إجمالي المخالفات</p>
            </div>
            <div className="p-2 bg-orange-100 rounded">
              <p className="text-lg font-bold text-orange-600">{data.unpaidViolations.length}</p>
              <p className="text-gray-600">معلقة</p>
            </div>
            <div className="p-2 bg-red-100 rounded">
              <p className="text-lg font-bold text-red-600">
                {data.cybercrimeCase.length + data.judicialCases.length}
              </p>
              <p className="text-gray-600">قضايا</p>
            </div>
          </div>

          {/* التذييل */}
          <div className="mt-6 pt-4 border-t border-gray-300">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">تاريخ الإصدار:</p>
                <p className="text-gray-600">{new Date().toLocaleDateString('ar-PS', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              <div className="text-left">
                <p className="font-semibold mb-6">التوقيع والختم</p>
                <div className="border-t-2 border-gray-700 w-32 inline-block"></div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              هذه الوثيقة صادرة إلكترونياً من نظام الشرطة الفلسطينية الموحد - PoliceOps
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
