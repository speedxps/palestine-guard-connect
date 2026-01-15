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

  // مصفوفة الأسئلة - تم إصلاح تداخل اللغات باستخدام dir="ltr" للمصطلحات الإنجليزية
  const questions = [
    {
      q: "لماذا اخترت React بدلاً من Angular أو Vue؟",
      a: (
        <span>
          الأداء: بفضل الـ <span dir="ltr" className="inline-block text-blue-400 font-bold">Virtual DOM</span>. 
          سهولة التطوير: نظام الـ <span dir="ltr" className="inline-block text-blue-400 font-bold">Components</span> يجعل الكود قابلاً لإعادة الاستخدام. 
          الدعم: مجتمع ضخم ومكتبات جاهزة مثل <span dir="ltr" className="inline-block text-blue-400 font-bold">Shadcn/UI</span>.
        </span>
      )
    },
    {
      q: "كيف تضمن أمان البيانات الحساسة في النظام؟",
      a: (
        <span>
          نستخدم نظام <span dir="ltr" className="inline-block text-blue-400 font-bold">Row Level Security (RLS)</span> لعزل البيانات، 
          وتشفير بصمات الوجه، وتأمين الاتصال عبر <span dir="ltr" className="inline-block text-blue-400 font-bold">HTTPS/SSL</span>.
        </span>
      )
    },
    {
      q: "اشرح آلية عمل التعرف على الوجه (Face Recognition)؟",
      a: (
        <span>
          يتم تحويل ملامح الوجه إلى متجهات رقمية <span dir="ltr" className="inline-block text-blue-400 font-bold">(128-dimensional embedding)</span> 
          بواسطة <span dir="ltr" className="inline-block text-blue-400 font-bold">face-api.js</span>، 
          ثم مقارنتها في قاعدة البيانات باستخدام <span dir="ltr" className="inline-block text-blue-400 font-bold">pgvector</span>.
        </span>
      )
    },
    {
      q: "ما الفرق بين Edge Functions والـ Backend التقليدي؟",
      a: (
        <span>
          الـ <span dir="ltr" className="inline-block text-blue-400 font-bold">Edge Functions</span> هي 
          <span dir="ltr" className="inline-block text-blue-400 font-bold">Serverless Functions</span> تعمل في أقرب نقطة جغرافية للمستخدم، مما يقلل الـ <span dir="ltr" className="inline-block text-blue-400 font-bold">Latency</span>.
        </span>
      )
    },
    {
      q: "ما هي الـ Row Level Security وكيف تعمل؟",
      a: (
        <span>
          هي ميزة في <span dir="ltr" className="inline-block text-blue-400 font-bold">PostgreSQL</span> تضمن أن الاستعلام يرجع فقط الصفوف التي يملك المستخدم صلاحية رؤيتها بناءً على <span dir="ltr" className="inline-block text-blue-400 font-bold">Policies</span> محددة.
        </span>
      )
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
              <h1 className="text-3xl md:text-4xl font-bold">Police Ops</h1>
              <p className="text-blue-300">نظام إدارة عمليات الشرطة الفلسطينية</p>
            </div>
          </div>
          <Button onClick={handlePrint} variant="outline" className="print:hidden gap-2 border-white/30 text-white hover:bg-white/10">
            <Printer className="w-4 h-4" /> طباعة
          </Button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">🎓 مشروع التخرج - نظم معلومات حاسوبية</h2>
          <p className="text-white/80">أول نظام رقمي شامل ومتكامل لإدارة عمليات الشرطة الفلسطينية</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2 bg-white/10 p-2 rounded-xl mb-6 h-auto print:hidden">
            <TabsTrigger value="intro">المقدمة</TabsTrigger>
            <TabsTrigger value="architecture">الهيكل</TabsTrigger>
            <TabsTrigger value="dataflow">تدفق البيانات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="tech">التقنيات</TabsTrigger>
            <TabsTrigger value="features">المميزات</TabsTrigger>
            <TabsTrigger value="questions">الأسئلة</TabsTrigger>
            <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
          </TabsList>

          {/* 1. المقدمة */}
          <TabsContent value="intro">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="text-blue-400" /> رؤية المشروع</CardTitle></CardHeader>
              <CardContent><p className="text-lg leading-relaxed">تحويل العمل الشرطي من الأسلوب الورقي التقليدي إلى نظام رقمي فائق الأمان يعتمد على الذكاء الاصطناعي في اتخاذ القرار.</p></CardContent>
            </Card>
          </TabsContent>

          {/* 2. الهيكل */}
          <TabsContent value="architecture">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="text-purple-400" /> بنية النظام</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center"><h3 className="font-bold">Frontend</h3><p className="text-sm" dir="ltr">React + Tailwind</p></div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center"><h3 className="font-bold">Backend</h3><p className="text-sm" dir="ltr">Supabase / Edge Functions</p></div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center"><h3 className="font-bold">Database</h3><p className="text-sm" dir="ltr">PostgreSQL</p></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. تدفق البيانات */}
          <TabsContent value="dataflow">
            <Card className="bg-white/10 border-white/20 text-white text-center p-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="p-4 bg-blue-600 rounded-lg">إدخال البيانات</div>
                <ArrowRight className="rotate-90 md:rotate-0" />
                <div className="p-4 bg-purple-600 rounded-lg">المعالجة (AI)</div>
                <ArrowRight className="rotate-90 md:rotate-0" />
                <div className="p-4 bg-green-600 rounded-lg">التخزين الآمن</div>
              </div>
            </Card>
          </TabsContent>

          {/* 4. الأمان */}
          <TabsContent value="security">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader><CardTitle className="flex items-center gap-2 text-red-400"><Lock className="w-5 h-5"/> حماية البيانات</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["نظام التعرف على الوجه", "تحديد الموقع الجغرافي", "عزل البيانات RLS", "تشفير الملفات"].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 p-3 rounded-lg"><CheckCircle className="text-green-500 w-5 h-5"/>{s}</div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 5. التقنيات */}
          <TabsContent value="tech">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-white/10 border-white/20 text-white"><CardHeader><CardTitle>Frontend</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">{["React", "TypeScript", "Tailwind CSS", "Shadcn/UI"].map(t => <Badge key={t} variant="secondary">{t}</Badge>)}</CardContent></Card>
              <Card className="bg-white/10 border-white/20 text-white"><CardHeader><CardTitle>Backend</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">{["Supabase", "PostgreSQL", "Edge Functions", "Face-api.js"].map(t => <Badge key={t} variant="outline" className="text-green-400 border-green-400">{t}</Badge>)}</CardContent></Card>
            </div>
          </TabsContent>

          {/* 6. المميزات */}
          <TabsContent value="features">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl"><Camera className="text-yellow-400" /><div><h4 className="font-bold">بصمة الوجه</h4><p className="text-sm text-white/60">التحقق من الهوية بالذكاء الاصطناعي</p></div></div>
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl"><MapPin className="text-red-400" /><div><h4 className="font-bold">تتبع الموقع</h4><p className="text-sm text-white/60">ضمان تسجيل الدخول من المواقع المسموحة</p></div></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 7. الأسئلة والأجوبة (القسم المصلح) */}
          <TabsContent value="questions">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="text-yellow-400"/> الأسئلة المتوقعة</CardTitle></CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {questions.map((item, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="bg-white/5 rounded-lg border border-white/10 px-4">
                      <AccordionTrigger className="text-right hover:no-underline font-bold">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-white/80 leading-relaxed border-t border-white/5 pt-4 pb-4">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 8. الإحصائيات (الملخص الختامي) */}
          <TabsContent value="stats">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "الأقسام", val: "10", icon: <Users className="text-blue-400"/> },
                    { label: "الأمان", val: "99.9%", icon: <Shield className="text-red-400"/> },
                    { label: "الاستجابة", val: "Instant", icon: <Zap className="text-yellow-400"/> },
                    { label: "التكامل", val: "100%", icon: <CheckCircle className="text-green-400"/> }
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                      <div className="flex justify-center mb-2">{s.icon}</div>
                      <div className="text-2xl font-bold">{s.val}</div>
                      <div className="text-xs text-white/60">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4">🎯 ملخص المشروع</h3>
                  <p className="text-lg leading-relaxed">نظام <strong className="text-blue-400">Police Ops</strong> هو مشروع تخرج متكامل يقدم حلاً رقمياً شاملاً، مبني على تقنيات حديثة لخدمة 10 أقسام شرطية فلسطينية.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .bg-white\\/10 { background: white !important; border: 1px solid #ccc !important; color: black !important; }
          .text-white { color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default ProjectPresentation;
