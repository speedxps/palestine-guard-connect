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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
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

      {/* المستند */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-2xl print:shadow-none">
          <CardContent className="p-8 md:p-12">
            {/* الرأسية */}
            <div className="text-center mb-8 border-b-4 border-primary pb-6">
              <img 
                src={policeLogo} 
                alt="شعار الشرطة الفلسطينية" 
                className="w-24 h-24 mx-auto mb-4 object-contain"
              />
              <h1 className="text-3xl md:text-4xl font-bold mb-2">شهادة براءة ذمة</h1>
              <h2 className="text-xl text-muted-foreground">الشرطة الفلسطينية</h2>
              <p className="text-sm text-muted-foreground mt-2">
                نسخة مخصصة للمحاكم والجهات الرسمية
              </p>
            </div>

            {/* بيانات المواطن */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  بيانات المواطن
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
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
              </CardContent>
            </Card>

            {/* حالة الذمة المالية */}
            <Card className={`mb-6 ${data.hasPendingIssues ? 'border-destructive bg-destructive/5' : 'border-green-500 bg-green-50'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {data.hasPendingIssues ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <span className="text-destructive">توجد مستحقات أو قضايا معلقة</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600">براءة ذمة - لا توجد مستحقات</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            {/* المخالفات غير المسددة */}
            {data.unpaidViolations.length > 0 && (
              <Card className="mb-6 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-orange-600" />
                    المخالفات المرورية غير المسددة ({data.unpaidViolations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
              {data.unpaidViolations.map((v, idx) => (
                      <div key={v.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{idx + 1}. {v.record_type === 'violation' ? 'مخالفة مرورية' : 'قضية'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(v.record_date).toLocaleDateString('ar')}
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-lg">
                          غير محلولة
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-red-100 border-2 border-red-300 rounded-lg">
                    <p className="text-center text-xl font-bold text-red-700">
                      المبلغ الإجمالي المستحق: {data.totalDue} شيكل
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* القضايا المفتوحة */}
            {(data.cybercrimeCase.length > 0 || data.judicialCases.length > 0) && (
              <Card className="mb-6 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-red-600" />
                    القضايا المفتوحة ({data.cybercrimeCase.length + data.judicialCases.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[...data.cybercrimeCase, ...data.judicialCases].map((c, idx) => (
                      <div key={c.id} className="p-3 bg-red-50 rounded-lg">
                        <p className="font-semibold">{idx + 1}. {c.title || c.case_number}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{c.case_type}</Badge>
                          <Badge>{c.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* إحصائيات إضافية */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>الإحصائيات العامة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{data.violations.length}</p>
                    <p className="text-sm text-muted-foreground">إجمالي المخالفات</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{data.unpaidViolations.length}</p>
                    <p className="text-sm text-muted-foreground">مخالفات معلقة</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {data.cybercrimeCase.length + data.judicialCases.length}
                    </p>
                    <p className="text-sm text-muted-foreground">قضايا مفتوحة</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* التذييل */}
            <div className="mt-8 pt-6 border-t-2 border-muted">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">تاريخ الإصدار:</p>
                  <p className="text-muted-foreground">{new Date().toLocaleDateString('ar-PS', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold mb-8">التوقيع والختم</p>
                  <div className="border-t-2 border-foreground w-40"></div>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-6">
                هذه الوثيقة صادرة إلكترونياً من نظام الشرطة الفلسطينية الموحد
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
