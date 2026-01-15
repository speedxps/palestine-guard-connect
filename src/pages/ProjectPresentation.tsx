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

  // مصفوفة الأسئلة مع معالجة مشكلة تداخل اللغات (Bi-directional Text)
  const questionsData = [
    {
      q: 'لماذا اخترت React بدلاً من Angular أو Vue؟',
      a: (
        <div className="space-y-2 leading-relaxed text-right">
          <p>
            تم اختيار <span dir="ltr" className="text-blue-400 font-bold">React</span> بناءً على ميزة <span dir="ltr" className="text-blue-400 font-bold">Virtual DOM</span> التي تضمن سرعة الأداء، وسهولة بناء الواجهات باستخدام الـ <span dir="ltr" className="text-blue-400 font-bold">Components</span>، بالإضافة إلى الدعم الكبير من شركة <span dir="ltr" className="text-blue-400 font-bold">Meta</span>.
          </p>
        </div>
      )
    },
    {
      q: 'كيف تضمن أمان البيانات الحساسة في النظام؟',
      a: (
        <div className="space-y-2 leading-relaxed text-right">
          <p>
            نستخدم تقنية <span dir="ltr" className="text-blue-400 font-bold">Row Level Security (RLS)</span> لعزل البيانات، مع تشفير بصمات الوجه وتأمين الاتصال عبر بروتوكولات <span dir="ltr" className="text-blue-400 font-bold">HTTPS</span> و <span dir="ltr" className="text-blue-400 font-bold">SSL</span>.
          </p>
        </div>
      )
    },
    {
      q: 'اشرح آلية عمل التعرف على الوجه (Face Recognition)؟',
      a: (
        <div className="space-y-2 leading-relaxed text-right">
          <p>
            يتم تحويل ملامح الوجه إلى متجهات رقمية <span dir="ltr" className="text-blue-400 font-bold">(128-bit Embeddings)</span> باستخدام <span dir="ltr" className="text-blue-400 font-bold">face-api.js</span>، ثم مقارنتها عبر إضافة <span dir="ltr" className="text-blue-400 font-bold">pgvector</span> في قاعدة البيانات.
          </p>
        </div>
      )
    },
    {
      q: 'ما الفرق بين Edge Functions والـ Backend التقليدي؟',
      a: (
        <div className="space-y-2 leading-relaxed text-right">
          <p>
            الـ <span dir="ltr" className="text-blue-400 font-bold">Edge Functions</span> هي دوال تعمل بنظام <span dir="ltr" className="text-blue-400 font-bold">Serverless</span> في أقرب نقطة جغرافية للمستخدم، مما يقلل الـ <span dir="ltr" className="text-blue-400 font-bold">Latency</span> ويوفر سرعة استجابة فائقة.
          </p>
        </div>
      )
    },
    {
        q: 'ما هي الـ Row Level Security وكيف تعمل؟',
        a: (
          <div className="space-y-2 leading-relaxed text-right">
            <p>
              هي ميزة في <span dir="ltr" className="text-blue-400 font-bold">PostgreSQL</span> تسمح بتعريف سياسات أمان <span dir="ltr" className="text-blue-400 font-bold">(Policies)</span> تمنع أي مستخدم من الوصول لبيانات غيره حتى لو امتلك صلاحية الدخول للجدول.
            </p>
          </div>
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
            <Printer className="w-4 h-4 ml-1" /> طباعة
          </Button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">🎓 مشروع التخرج - نظم معلومات حاسوبية</h2>
          <p className="text-white/80">تصميم وتطوير نظام رقمي أمني متكامل لأقسام الشرطة</p>
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

          <TabsContent value="intro">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="text-blue-400"/> الرؤية والهدف</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg leading-relaxed">يهدف النظام إلى أتمتة العمليات الشرطية الفلسطينية من خلال منصة رقمية موحدة تجمع بين الذكاء الاصطناعي وأمن المعلومات.</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30 text-center font-bold">أمان فائق</div>
                   <div className="bg-green-600/20 p-4 rounded-lg border border-green-500/30 text-center font-bold">سرعة معالجة</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader><CardTitle className="flex items-center gap-2 text-purple-400"><Layers className="w-5 h-5"/> بنية النظام</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                    <h4 className="font-bold mb-2">Frontend</h4>
                    <p className="text-sm text-blue-300" dir="ltr">React.js + Tailwind CSS</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                    <h4 className="font-bold mb-2">Backend</h4>
                    <p className="text-sm text-green-300" dir="ltr">Supabase + Edge Functions</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                    <h4 className="font-bold mb-2">Database</h4>
                    <p className="text-sm text-purple-300" dir="ltr">PostgreSQL + pgvector</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader><CardTitle className="flex items-center gap-2 text-red-400"><Shield className="w-5 h-5"/> حماية البيانات</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                 {['تشفير نهاية لنهاية', 'نظام التعرف على الوجه', 'عزل البيانات RLS', 'تتبع الموقع الجغرافي'].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                       <CheckCircle className="w-5 h-5 text-green-500" />
                       <span>{s}</span>
                    </div>
                 ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-yellow-400">
                  <HelpCircle className="w-6 h-6" /> أسئلة المناقشة المتوقعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-4">
                  {questionsData.map((item, i) => (
                    <AccordionItem key={i} value={`q-${i}`} className="bg-white/5 rounded-lg border border-white/10 px-4 overflow-hidden">
                      <AccordionTrigger className="text-right hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center p-0">{i + 1}</Badge>
                          <span className="font-medium">{item.q}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-white/80 border-t border-white/5 pt-4 pb-4">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/10 border-white/20 text-white p-6 text-center">
                    <div className="text-3xl font-bold text-blue-400">10</div>
                    <div className="text-xs">أقسام شرطية</div>
                </Card>
                <Card className="bg-white/10 border-white/20 text-white p-6 text-center">
                    <div className="text-3xl font-bold text-green-400">100+</div>
                    <div className="text-xs">صفحة تفاعلية</div>
                </Card>
                <Card className="bg-white/10 border-white/20 text-white p-6 text-center">
                    <div className="text-3xl font-bold text-red-400">5</div>
                    <div className="text-xs">طبقات أمان</div>
                </Card>
                <Card className="bg-white/10 border-white/20 text-white p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400">AI</div>
                    <div className="text-xs">تعرف على الوجه</div>
                </Card>
            </div>
            <div className="mt-6 bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">🎯 ملخص المشروع</h3>
                <p className="leading-relaxed">نظام <span className="text-blue-400 font-bold">Police Ops</span> هو مشروع تخرج متكامل يقدم حلاً رقمياً شاملاً، مبني على تقنيات <span dir="ltr">React</span> و <span dir="ltr">Supabase</span> لخدمة المنظومة الأمنية.</p>
            </div>
          </TabsContent>

        </Tabs>
      </div>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .bg-white\\/10 { background: white !important; border: 1px solid #ccc !important; color: black !important; }
          .text-white { color: black !important; }
          .text-blue-400, .text-yellow-400 { color: #000 !important; font-weight: bold !important; }
        }
      `}</style>
    </div>
  );
};

export default ProjectPresentation;
