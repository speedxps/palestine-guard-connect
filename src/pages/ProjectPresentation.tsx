import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Shield, Database, Globe, Lock, Cpu, Users, MapPin, Camera, 
  FileText, Code, Server, Layers, CheckCircle, AlertTriangle,
  Printer, ArrowRight, BookOpen, HelpCircle, BarChart3, Zap
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

          {/* Intro Tab */}
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
                  نظام إدارة عمليات الشرطة الفلسطينية هو أول نظام رقمي شامل ومتكامل مصمم لتحويل العمليات الأمنية من الورقي إلى الرقمي بشكل آمن وفعال.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>هيكل النظام</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pr-6 mt-2 space-y-1">
                  <li>واجهة أمامية ديناميكية للتفاعل مع المستخدم</li>
                  <li>خدمات خلفية لإدارة البيانات وتطبيق منطق الأعمال</li>
                  <li>قاعدة بيانات لتخزين المعلومات الحساسة بشكل آمن</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Flow Tab */}
          <TabsContent value="dataflow" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle>تدفق البيانات</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  يتم معالجة كل طلب من المستخدم وفقًا لتسلسل محدد لضمان الأداء والأمان، مع تسجيل جميع العمليات في قاعدة البيانات.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
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
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-500/20 p-5 rounded-xl border border-blue-500/30">
                    <h4 className="font-bold text-blue-400 mb-3">📝 لغات البرمجة</h4>
                    <ul className="space-y-2">
                      <li><Badge dir="ltr">TypeScript</Badge></li>
                      <li><Badge dir="ltr">JavaScript</Badge></li>
                      <li><Badge dir="ltr">PostgreSQL</Badge></li>
                      <li><Badge dir="ltr">Tailwind CSS</Badge></li>
                    </ul>
                  </div>
                  <div className="bg-green-500/20 p-5 rounded-xl border border-green-500/30">
                    <h4 className="font-bold text-green-400 mb-3">⚛️ الأطر</h4>
                    <ul className="space-y-2">
                      <li><Badge dir="ltr">React 18</Badge></li>
                      <li><Badge dir="ltr">Vite</Badge></li>
                      <li><Badge dir="ltr">Shadcn/UI</Badge></li>
                      <li><Badge dir="ltr">TanStack Query</Badge></li>
                    </ul>
                  </div>
                  <div className="bg-purple-500/20 p-5 rounded-xl border border-purple-500/30">
                    <h4 className="font-bold text-purple-400 mb-3">🔧 الخدمات</h4>
                    <ul className="space-y-2">
                      <li><Badge dir="ltr">Supabase</Badge></li>
                      <li><Badge dir="ltr">PostgreSQL</Badge></li>
                      <li><Badge dir="ltr">Deno Runtime</Badge></li>
                      <li><Badge dir="ltr">Mapbox</Badge></li>
                    </ul>
                  </div>
                </div>
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-600/20 p-5 rounded-xl border border-blue-600/30 flex flex-col items-start gap-2">
                    <h4 className="font-bold text-blue-400">واجهة مستخدم حديثة</h4>
                    <p className="text-white/90">تصميم سلس وسهل الاستخدام لجميع الموظفين.</p>
                  </div>
                  <div className="bg-green-600/20 p-5 rounded-xl border border-green-600/30 flex flex-col items-start gap-2">
                    <h4 className="font-bold text-green-400">إدارة دورية للمستخدمين</h4>
                    <p className="text-white/90">التحكم الكامل في صلاحيات المستخدمين والأقسام.</p>
                  </div>
                  <div className="bg-purple-600/20 p-5 rounded-xl border border-purple-600/30 flex flex-col items-start gap-2">
                    <h4 className="font-bold text-purple-400">تدفق بيانات آمن وسريع</h4>
                    <p className="text-white/90">سجل كامل لكل العمليات مع حماية عالية.</p>
                  </div>
                  <div className="bg-red-600/20 p-5 rounded-xl border border-red-600/30 flex flex-col items-start gap-2">
                    <h4 className="font-bold text-red-400">دعم الطوارئ والتنبيهات</h4>
                    <p className="text-white/90">إشعارات فورية للتعامل مع أي حالة طارئة.</p>
                  </div>
                  <div className="bg-yellow-600/20 p-5 rounded-xl border border-yellow-600/30 flex flex-col items-start gap-2">
                    <h4 className="font-bold text-yellow-400">تكامل مع نظم GPS</h4>
                    <p className="text-white/90">تتبع دوريات الشرطة في الوقت الفعلي بشكل دقيق.</p>
                  </div>
                  <div className="bg-pink-600/20 p-5 rounded-xl border border-pink-600/30 flex flex-col items-start gap-2">
                    <h4 className="font-bold text-pink-400">تحليلات وتقارير متقدمة</h4>
                    <p className="text-white/90">توليد إحصائيات وتقارير جاهزة للعرض أو الطباعة.</p>
                  </div>
                </div>
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
                      تم نشر النظام باستخدام:
                      <ul className="list-disc pr-6 mt-2 space-y-1">
                        <li>واجهة أمامية على <span dir="ltr">CDN</span></li>
                        <li>الخدمات الخلفية على <span dir="ltr">Supabase Edge Functions</span></li>
                        <li>قاعدة بيانات <span dir="ltr">PostgreSQL</span></li>
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
