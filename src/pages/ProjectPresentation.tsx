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

  const handlePrint = () => {
    window.print();
  };

  const questionsData = [
    {
      q: 'لماذا اخترت React بدلاً من Angular أو Vue؟',
      a: (
        <div className="space-y-2">
          <p className="font-bold text-blue-400">الاختيار اعتمد على ٤ ركائز:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-yellow-400">الأداء:</strong> بفضل الـ Virtual DOM.</li>
            <li><strong className="text-yellow-400">التوسعية:</strong> نظام الـ Components يسهل بناء الأنظمة الضخمة.</li>
            <li><strong className="text-yellow-400">الدعم:</strong> مكتبات Shadcn و Tailwind تتكامل معها بسلاسة.</li>
            <li><strong className="text-yellow-400">الاستدامة:</strong> دعم Meta يضمن بقاء التقنية لسنوات طويلة.</li>
          </ul>
        </div>
      )
    },
    {
      q: 'كيف تضمن أمان البيانات الحساسة في النظام؟',
      a: "نستخدم نظام RLS (Row Level Security) لعزل البيانات، مع تشفير بصمات الوجه وتأمين الاتصال عبر HTTPS وSSL، بالإضافة إلى التحقق بخمس طبقات أمان (الموقع، الجهاز، الوجه، الهوية، الدور)."
    },
    {
      q: 'اشرح آلية عمل التعرف على الوجه (Face Recognition)؟',
      a: "يتم تحويل ملامح الوجه إلى متجهات رقمية (128-dimensional embedding) باستخدام face-api.js، ثم تُقارن هذه المتجهات ببيانات قاعدة البيانات عبر إضافة pgvector لحساب نسبة التشابه."
    },
    {
      q: 'ما الفرق بين Edge Functions والـ Backend التقليدي؟',
      a: "الـ Edge Functions هي Serverless Functions تعمل في أقرب نقطة جغرافية للمستخدم (Edge of the network)، مما يقلل الـ Latency ويغنينا عن إدارة خوادم كاملة."
    },
    {
        q: 'ما هي الـ Row Level Security وكيف تعمل؟',
        a: "هي ميزة في Postgres تسمح بتعريف سياسات أمان (Policies) تحدد من يستطيع الوصول لكل صف بناءً على هويته (User ID)، مما يمنع تسريب البيانات حتى لو تم اختراق الواجهة."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 md:p-8 print:bg-white print:text-black" dir="rtl">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src={policeLogo} alt="Police Logo" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Police Ops</h1>
              <p className="text-blue-300 font-medium">نظام إدارة عمليات الشرطة الفلسطينية الرقمي</p>
            </div>
          </div>
          <Button onClick={handlePrint} variant="outline" className="print:hidden gap-2 border-white/30 text-white hover:bg-white/10">
            <Printer className="w-4 h-4" /> طباعة التقرير
          </Button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right">
            <div>
              <h2 className="text-xl font-bold text-yellow-400 mb-1">🎓 مشروع تخرج - نظم معلومات حاسوبية</h2>
              <p className="text-white/80">إعداد الطلاب: فريق التميز التقني | تحت إشراف قسم أمن المعلومات</p>
            </div>
            <Badge variant="secondary" className="bg-green-600 text-white px-4 py-1 text-lg animate-pulse">
              جاهز للمناقشة
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2 bg-white/10 p-2 rounded-xl mb-6 h-auto print:hidden">
            <TabsTrigger value="intro">المقدمة</TabsTrigger>
            <TabsTrigger value="architecture">الهيكل</TabsTrigger>
            <TabsTrigger value="dataflow">التدفق</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="tech">التقنيات</TabsTrigger>
            <TabsTrigger value="features">المميزات</TabsTrigger>
            <TabsTrigger value="questions">الأسئلة</TabsTrigger>
            <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
          </TabsList>

          {/* 1. المقدمة */}
          <TabsContent value="intro">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="text-blue-400"/> رؤية المشروع</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <p className="text-xl leading-relaxed text-blue-100">تحويل العمل الشرطي من الأسلوب الورقي التقليدي إلى <span className="text-yellow-400 font-bold">نظام رقمي فائق الأمان</span> يعتمد على الذكاء الاصطناعي في اتخاذ القرار.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-3 rounded-lg border border-white/10"><h4 className="font-bold text-blue-400">الهدف الأول</h4><p className="text-sm">أرشفة رقمية شاملة</p></div>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/10"><h4 className="font-bold text-blue-400">الهدف الثاني</h4><p className="text-sm">سرعة الاستجابة</p></div>
                    </div>
                  </div>
                  <div className="bg-blue-600/20 p-6 rounded-2xl border border-blue-500/30 flex flex-col items-center justify-center text-center">
                    <Shield className="w-20 h-20 text-blue-400 mb-4" />
                    <h3 className="text-2xl font-bold">Police Ops v1.0</h3>
                    <p className="text-sm text-blue-200 mt-2">نظام متكامل يربط ١٠ أقسام شرطية في منصة واحدة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. الهيكل التنظيمي */}
          <TabsContent value="architecture">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="text-purple-400"/> بنية النظام (Architecture)</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                   {[
                     { title: "الواجهة (Frontend)", desc: "React + Vite + Tailwind", icon: <Globe className="w-8 h-8 text-blue-400"/> },
                     { title: "الخدمات (Backend)", desc: "Supabase + Edge Functions", icon: <Server className="w-8 h-8 text-green-400"/> },
                     { title: "البيانات (Database)", desc: "PostgreSQL (Relational)", icon: <Database className="w-8 h-8 text-purple-400"/> }
                   ].map((item, i) => (
                     <div key={i} className="bg-white/5 p-6 rounded-xl border border-white/10 text-center hover:bg-white/10 transition-all">
                       <div className="flex justify-center mb-4">{item.icon}</div>
                       <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                       <p className="text-sm text-white/60">{item.desc}</p>
                     </div>
                   ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. تدفق البيانات */}
          <TabsContent value="dataflow">
            <Card className="bg-white/10 border-white/20 text-white text-center p-8">
              <div className="max-w-2xl mx-auto space-y-6">
                 <div className="p-4 bg-blue-600 rounded-lg">إدخال البيانات (الضابط/المواطن)</div>
                 <ArrowRight className="mx-auto rotate-90 md:rotate-0" />
                 <div className="p-4 bg-purple-600 rounded-lg">المعالجة والتحقق (Edge Functions + AI)</div>
                 <ArrowRight className="mx-auto rotate-90 md:rotate-0" />
                 <div className="p-4 bg-green-600 rounded-lg">التخزين الآمن والتحليلات (Postgres)</div>
              </div>
            </Card>
          </TabsContent>

          {/* 4. الأمان */}
          <TabsContent value="security">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader><CardTitle className="flex items-center gap-2 text-red-400"><Lock className="w-6 h-6"/> طبقات الأمان الخمس</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {['تشخيص الوجه', 'بصمة الجهاز', 'الموقع الجغرافي', 'تشفير RLS', 'صلاحيات الأدوار'].map((step, i) => (
                    <div key={i} className="flex flex-col items-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-center">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mb-3 font-bold">{i+1}</div>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 5. التقنيات */}
          <TabsContent value="tech">
             <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-white/10 border-white/20 text-white">
                   <CardHeader><CardTitle className="text-blue-400">Frontend Stack</CardTitle></CardHeader>
                   <CardContent className="flex flex-wrap gap-2">
                     {['React 18', 'TypeScript', 'Tailwind CSS', 'Shadcn/UI', 'Lucide Icons', 'React Query'].map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                   </CardContent>
                </Card>
                <Card className="bg-white/10 border-white/20 text-white">
                   <CardHeader><CardTitle className="text-green-400">Backend & AI</CardTitle></CardHeader>
                   <CardContent className="flex flex-wrap gap-2">
                     {['Supabase', 'PostgreSQL', 'Edge Functions', 'Face-api.js', 'PgVector', 'Webhooks'].map(t => <Badge key={t} variant="secondary" className="bg-green-700">{t}</Badge>)}
                   </CardContent>
                </Card>
             </div>
          </TabsContent>

          {/* 6. المميزات */}
          <TabsContent value="features">
             <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="pt-6">
                   <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex gap-4 p-4 bg-white/5 rounded-xl">
                        <Camera className="text-yellow-400 w-12 h-12" />
                        <div><h3 className="font-bold">نظام البصمة الوجهية</h3><p className="text-sm text-white/60">التحقق من الهوية بدقة تصل لـ ٩٩٪</p></div>
                      </div>
                      <div className="flex gap-4 p-4 bg-white/5 rounded-xl">
                        <MapPin className="text-red-400 w-12 h-12" />
                        <div><h3 className="font-bold">التتبع الجغرافي</h3><p className="text-sm text-white/60">تحديد موقع البلاغات وتسجيل الدخول</p></div>
                      </div>
                      <div className="flex gap-4 p-4 bg-white/5 rounded-xl">
                        <Zap className="text-blue-400 w-12 h-12" />
                        <div><h3 className="font-bold">تحديثات فورية</h3><p className="text-sm text-white/60">مزامنة البيانات بين الأقسام في أجزاء من الثانية</p></div>
                      </div>
                      <div className="flex gap-4 p-4 bg-white/5 rounded-xl">
                        <BarChart3 className="text-green-400 w-12 h-12" />
                        <div><h3 className="font-bold">لوحة إحصائيات</h3><p className="text-sm text-white/60">رسوم بيانية لدعم اتخاذ القرار الأمني</p></div>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </TabsContent>

          {/* 7. الأسئلة والأجوبة - المحدثة لمنع التداخل */}
          <TabsContent value="questions">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="text-yellow-400"/> أسئلة المناقشة المتوقعة</CardTitle></CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-4">
                  {questionsData.map((item, i) => (
                    <AccordionItem key={i} value={`q-${i}`} className="bg-white/5 rounded-lg border border-white/10 px-4 overflow-hidden">
                      <AccordionTrigger className="text-right hover:no-underline py-4">
                        <span className="font-medium text-sm md:text-base">{i + 1}. {item.q}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-white/80 leading-relaxed pt-2 border-t border-white/5 mt-1">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 8. الإحصائيات الختامية */}
          <TabsContent value="stats">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "الأقسام", val: "١٠+", icon: <Users className="text-blue-400"/> },
                  { label: "الصفحات", val: "١٠٠+", icon: <FileText className="text-green-400"/> },
                  { label: "الأمان", val: "٩٩.٩٪", icon: <Shield className="text-red-400"/> },
                  { label: "السرعة", val: "<٥٠٠ms", icon: <Zap className="text-yellow-400"/> }
                ].map((s, i) => (
                  <Card key={i} className="bg-white/10 border-white/20 text-white text-center p-6">
                    <div className="flex justify-center mb-2">{s.icon}</div>
                    <div className="text-3xl font-bold mb-1">{s.val}</div>
                    <div className="text-xs text-white/60">{s.label}</div>
                  </Card>
                ))}
             </div>
             <div className="mt-8 bg-blue-600/20 rounded-xl p-8 border border-blue-500/30 text-center">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">🎯 ملخص المشروع</h3>
                <p className="max-w-3xl mx-auto leading-relaxed text-lg">
                  نظام <strong className="text-blue-400 font-black">Police Ops</strong> يمثل نقلة نوعية في رقمنة الخدمات الأمنية الفلسطينية، مدمجاً بين تقنيات الويب الحديثة والذكاء الاصطناعي لضمان بيئة عمل ذكية، آمنة، وسريعة.
                </p>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print:hidden { display: none !important; }
          .bg-white\\/10 { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; color: black !important; }
          .text-white { color: black !important; }
          .text-blue-400, .text-yellow-400 { color: #1e40af !important; font-weight: bold !important; }
        }
      `}</style>
    </div>
  );
};

export default ProjectPresentation;
