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
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 md:p-8 print:bg-white print:text-black"
    >
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
          <Button
            onClick={handlePrint}
            variant="outline"
            className="print:hidden gap-2 border-white/30 text-white hover:bg-white/10"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">
            🎓 مشروع التخرج - نظم معلومات حاسوبية (أمن معلومات)
          </h2>
          <p className="text-white/80">
            أول نظام رقمي شامل ومتكامل لإدارة عمليات الشرطة الفلسطينية
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2 bg-white/10 p-2 rounded-xl mb-6 print:hidden">
            <TabsTrigger value="intro">المقدمة</TabsTrigger>
            <TabsTrigger value="architecture">الهيكل</TabsTrigger>
            <TabsTrigger value="dataflow">تدفق البيانات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="tech">التقنيات</TabsTrigger>
            <TabsTrigger value="features">المميزات</TabsTrigger>
            <TabsTrigger value="questions">الأسئلة</TabsTrigger>
            <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
          </TabsList>

          {/* TECH TAB */}
          <TabsContent value="tech">
            <Card className="bg-white/10 border-white/20">
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
                      <p><span dir="ltr">Visual Studio Code</span></p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">Version Control:</h4>
                      <p><span dir="ltr">Git + GitHub + GitHub Actions</span></p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-500/20 rounded-xl p-5">
                    <h4 className="font-bold text-blue-400 mb-3">📝 لغات البرمجة</h4>
                    <ul className="space-y-2">
                      <li><Badge dir="ltr">TypeScript</Badge></li>
                      <li><Badge dir="ltr">JavaScript</Badge></li>
                      <li><Badge dir="ltr">PostgreSQL</Badge></li>
                      <li><Badge dir="ltr">Tailwind CSS</Badge></li>
                    </ul>
                  </div>

                  <div className="bg-green-500/20 rounded-xl p-5">
                    <h4 className="font-bold text-green-400 mb-3">⚛️ الأطر</h4>
                    <ul className="space-y-2">
                      <li><Badge dir="ltr">React 18</Badge></li>
                      <li><Badge dir="ltr">Vite</Badge></li>
                      <li><Badge dir="ltr">Shadcn/UI</Badge></li>
                      <li><Badge dir="ltr">TanStack Query</Badge></li>
                    </ul>
                  </div>

                  <div className="bg-purple-500/20 rounded-xl p-5">
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

          {/* QUESTIONS TAB */}
          <TabsContent value="questions">
            <Card className="bg-white/10 border-white/20">
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

          {/* STATS */}
          <TabsContent value="stats">
            <Card className="bg-white/10 border-white/20">
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
