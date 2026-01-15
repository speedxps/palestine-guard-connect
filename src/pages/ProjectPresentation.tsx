import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Printer, Code, HelpCircle, BarChart3, BookOpen, CheckCircle, AlertTriangle
} from 'lucide-react';
import policeLogo from '@/assets/police-logo.png';

const ProjectPresentation = () => {
  const [activeTab, setActiveTab] = useState('intro');
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 md:p-8 print:bg-white print:text-black" dir="rtl">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src={policeLogo} alt="Police Logo" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Police Ops</h1>
              <p className="text-blue-300">نظام إدارة عمليات الشرطة الفلسطينية</p>
            </div>
          </div>
          <Button onClick={handlePrint} variant="outline" className="print:hidden gap-2 border-white/30 text-white hover:bg-white/10">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">🎓 مشروع التخرج - نظم معلومات حاسوبية (أمن معلومات)</h2>
          <p className="text-white/80">أول نظام رقمي شامل ومتكامل لإدارة عمليات الشرطة الفلسطينية</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2 bg-white/10 p-2 rounded-xl mb-6 h-auto print:hidden">
            <TabsTrigger value="intro" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">المقدمة</TabsTrigger>
            <TabsTrigger value="architecture" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">الهيكل</TabsTrigger>
            <TabsTrigger value="dataflow" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">تدفق البيانات</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">الأمان</TabsTrigger>
            <TabsTrigger value="tech" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">التقنيات</TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">المميزات</TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">الأسئلة</TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">الإحصائيات</TabsTrigger>
          </TabsList>

          {/* Introduction Tab */}
          <TabsContent value="intro" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BookOpen className="w-6 h-6 text-yellow-400" />
                  مقدمة المشروع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p>
                  يهدف هذا المشروع إلى تقديم نظام رقمي متكامل لإدارة عمليات الشرطة الفلسطينية، يغطي جميع الجوانب الإدارية، العملياتية، والأمنية بشكل رقمي متقدم.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle>هيكل النظام</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pr-6 mt-2 space-y-1">
                  <li>الواجهة الأمامية لعرض البيانات والتفاعل مع المستخدم</li>
                  <li>الوظائف الخلفية لإدارة البيانات وتطبيق منطق الأعمال</li>
                  <li>قاعدة البيانات لتخزين المعلومات الحساسة بشكل آمن</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dataflow Tab */}
          <TabsContent value="dataflow" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle>تدفق البيانات</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  كل طلب من المستخدم يتم معالجته وفقًا لتسلسل محدد لضمان الأداء والأمان، مع تسجيل جميع العمليات في قاعدة البيانات.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle>الأمان والحماية</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pr-6 mt-2 space-y-1">
                  <li>مصادقة المستخدمين وإدارة الأدوار بشكل دقيق</li>
                  <li>تشفير البيانات الحساسة عند التخزين والنقل</li>
                  <li>مراقبة النشاطات والتحقق من الهويات عبر التعرف على الوجه</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tech Tab */}
          <TabsContent value="tech" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Code className="w-6 h-6 text-yellow-400" />
                  التقنيات والأدوات المستخدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">🛠️ بيئة التطوير</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">IDE:</h4>
                      <p>Visual Studio Code</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">Version Control:</h4>
                      <p>Git + GitHub + GitHub Actions</p>
                    </div>
                  </div>
                </div>
                {/* باقي التقنيات والBadges تبقى كما هي */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>المميزات</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pr-6 mt-2 space-y-1">
                  <li>واجهة مستخدم حديثة وسهلة الاستخدام</li>
                  <li>إدارة دورية للمستخدمين والأقسام الشرطية</li>
                  <li>تدفق بيانات آمن وسريع مع سجل كامل للعمليات</li>
                  <li>دعم العمليات الطارئة والتنبيهات الفورية</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <HelpCircle className="w-6 h-6 text-yellow-400" />
                  أسئلة المناقشة المتوقعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="deploy">
                    <AccordionTrigger>كيف تم نشر المشروع؟</AccordionTrigger>
                    <AccordionContent>
                      تم نشر النظام باستخدام بنية حديثة تعتمد على:
                      <ul className="list-disc pr-6 mt-2 space-y-1">
                        <li>نشر الواجهة الأمامية على <span dir="ltr">CDN</span></li>
                        <li>تشغيل الخدمات الخلفية عبر <span dir="ltr">Supabase Edge Functions</span></li>
                        <li>قاعدة بيانات مُدارة باستخدام <span dir="ltr">PostgreSQL</span></li>
                        <li>دعم <span dir="ltr">CI/CD</span> و <span dir="ltr">HTTPS</span></li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BarChart3 className="w-6 h-6 text-yellow-400" />
                  إحصائيات المشروع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-600/40 p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold"><span dir="ltr">+100</span></p>
                    <p>صفحة</p>
                  </div>
                  <div className="bg-green-600/40 p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold"><span dir="ltr">34</span></p>
                    <p>Edge Function</p>
                  </div>
                  <div className="bg-purple-600/40 p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold"><span dir="ltr">+75</span></p>
                    <p>جدول</p>
                  </div>
                  <div className="bg-red-600/40 p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold"><span dir="ltr">10</span></p>
                    <p>أقسام شرطية</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ProjectPresentation;
