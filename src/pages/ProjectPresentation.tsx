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

      {/* Main Content */}
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
                <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-lg p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4">🎯 ما هو Police Ops؟</h3>
                  <p className="text-lg leading-relaxed">
                    نظام إدارة عمليات الشرطة الفلسطينية (Police Ops) هو <strong className="text-yellow-400">أول نظام رقمي شامل ومتكامل</strong> مصمم خصيصاً لتحويل العمليات الأمنية من النظام الورقي التقليدي إلى نظام إلكتروني ذكي وآمن.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-500/20 rounded-lg p-5 border border-red-500/30">
                    <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      المشاكل الحالية (النظام الورقي)
                    </h4>
                    <ul className="space-y-2 text-white/90">
                      <li>• بطء في الوصول للمعلومات الأمنية</li>
                      <li>• صعوبة التنسيق بين الأقسام المختلفة</li>
                      <li>• خطر فقدان أو تلف الملفات الورقية</li>
                      <li>• عدم وجود تتبع فوري للدوريات</li>
                      <li>• صعوبة التحقق من هوية الأشخاص</li>
                      <li>• غياب نظام إشعارات موحد</li>
                    </ul>
                  </div>

                  <div className="bg-green-500/20 rounded-lg p-5 border border-green-500/30">
                    <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      الحلول المقدمة (Police Ops)
                    </h4>
                    <ul className="space-y-2 text-white/90">
                      <li>• وصول فوري لجميع البيانات</li>
                      <li>• تواصل مباشر بين 10 أقسام شرطية</li>
                      <li>• تخزين آمن ومشفر في السحابة</li>
                      <li>• تتبع GPS فوري للدوريات</li>
                      <li>• التعرف على الوجه بالذكاء الاصطناعي</li>
                      <li>• نظام إشعارات طوارئ موحد</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                  <h4 className="font-bold text-blue-400 mb-3">🏛️ الأقسام الشرطية المدعومة (10 أقسام)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {['المباحث الجنائية', 'الشرطة القضائية', 'شرطة المرور', 'الجرائم الإلكترونية', 'الشرطة الخاصة', 
                      'شرطة الحدود', 'شرطة السياحة', 'العمليات المشتركة', 'مختبر الأدلة الجنائية', 'نظام العمليات'].map((dept, i) => (
                      <Badge key={i} className="bg-blue-600/50 text-white justify-center py-2">{dept}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-6">
            {/* محتوى الهيكل المعماري يبقى كما هو */}
          </TabsContent>

          {/* Data Flow Tab */}
          <TabsContent value="dataflow" className="space-y-6">
            {/* محتوى تدفق البيانات يبقى كما هو */}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* محتوى الأمان يبقى كما هو */}
          </TabsContent>

          {/* Technologies Tab */}
          <TabsContent value="tech" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Code className="w-6 h-6 text-yellow-400" />
                  التقنيات والأدوات المستخدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* IDE & Tools */}
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
                {/* باقي محتوى التقنيات يبقى كما هو */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features, Questions, Stats Tabs */}
          {/* المحتوى يبقى كما هو، مع إزالة أي ذكر لـ Lovable Platform */}
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectPresentation;
