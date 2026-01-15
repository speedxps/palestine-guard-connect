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
                      <li>• تتبع جي بي إس فوري للدوريات</li>
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
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Layers className="w-6 h-6 text-yellow-400" />
                  الهيكل المعماري ثلاثي الطبقات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-lg text-white/80">النظام مبني على هيكل ثلاثي الطبقات لضمان الفصل بين المسؤوليات وسهولة الصيانة</p>
                </div>

                {/* Frontend Layer */}
                <div className="bg-gradient-to-r from-blue-600/40 to-blue-800/40 rounded-xl p-6 border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="w-8 h-8 text-blue-400" />
                    <div>
                      <h3 className="text-xl font-bold text-blue-400">الطبقة الأولى: واجهة المستخدم</h3>
                      <p className="text-white/70">التفاعل مع المستخدم وعرض البيانات</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">التقنيات المستخدمة:</h4>
                      <div className="flex flex-wrap gap-2">
                        {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Shadcn/UI', 'Framer Motion'].map((tech, i) => (
                          <Badge key={i} variant="secondary" className="bg-blue-500/30">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">المميزات:</h4>
                      <ul className="text-sm text-white/80 space-y-1">
                        <li>• أكثر من 100 صفحة تفاعلية</li>
                        <li>• دعم كامل للغة العربية من اليمين لليسار</li>
                        <li>• تصميم متجاوب لجميع الأجهزة</li>
                        <li>• لوحات تحكم ديناميكية</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Backend Layer */}
                <div className="bg-gradient-to-r from-green-600/40 to-green-800/40 rounded-xl p-6 border border-green-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Server className="w-8 h-8 text-green-400" />
                    <div>
                      <h3 className="text-xl font-bold text-green-400">الطبقة الثانية: الخدمات الخلفية</h3>
                      <p className="text-white/70">إدارة البيانات وتنفيذ منطق الأعمال</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">التقنيات المستخدمة:</h4>
                      <div className="flex flex-wrap gap-2">
                        {['وظائف الحافة السحابية', 'بيئة دينو', 'تايب سكريبت', 'واجهة برمجية'].map((tech, i) => (
                          <Badge key={i} variant="secondary" className="bg-green-500/30">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">أمثلة على الوظائف (34 وظيفة):</h4>
                      <ul className="text-sm text-white/80 space-y-1">
                        <li>• التحقق بالوجه عند تسجيل الدخول</li>
                        <li>• فحص صلاحية الجهاز</li>
                        <li>• الاستعلام الذكي بالذكاء الاصطناعي</li>
                        <li>• التعرف على الوجه ومطابقته</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Database Layer */}
                <div className="bg-gradient-to-r from-purple-600/40 to-purple-800/40 rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="text-xl font-bold text-purple-400">الطبقة الثالثة: قاعدة البيانات</h3>
                      <p className="text-white/70">تخزين المعلومات وتطبيق سياسات الأمان</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">التقنيات المستخدمة:</h4>
                      <div className="flex flex-wrap gap-2">
                        {['بوستجريس', 'امتداد المتجهات', 'أمان مستوى الصف', 'دوال قاعدة البيانات'].map((tech, i) => (
                          <Badge key={i} variant="secondary" className="bg-purple-500/30">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">أمثلة على الجداول (أكثر من 75 جدول):</h4>
                      <ul className="text-sm text-white/80 space-y-1">
                        <li>• جدول المواطنين - بيانات المواطنين</li>
                        <li>• جدول الحوادث - الحوادث والبلاغات</li>
                        <li>• جدول بصمات الوجه - بصمات الوجه</li>
                        <li>• جدول الأجهزة - أجهزة المستخدمين</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Data Flow Diagram */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10 text-center">
                  <h4 className="font-bold text-yellow-400 mb-4">📊 مخطط تدفق البيانات</h4>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-lg">
                    <div className="bg-blue-600/50 px-6 py-3 rounded-lg">👤 المستخدم</div>
                    <ArrowRight className="w-6 h-6 text-white/50 rotate-90 md:rotate-0" />
                    <div className="bg-blue-500/50 px-6 py-3 rounded-lg">🖥️ الواجهة الأمامية</div>
                    <ArrowRight className="w-6 h-6 text-white/50 rotate-90 md:rotate-0" />
                    <div className="bg-green-500/50 px-6 py-3 rounded-lg">⚙️ وظائف الحافة</div>
                    <ArrowRight className="w-6 h-6 text-white/50 rotate-90 md:rotate-0" />
                    <div className="bg-purple-500/50 px-6 py-3 rounded-lg">🗄️ قاعدة البيانات</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Flow Tab */}
          <TabsContent value="dataflow" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  تدفق البيانات - أمثلة عملية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Login Flow */}
                <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 rounded-xl p-6 border border-blue-500/30">
                  <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    مثال 1: تسجيل الدخول متعدد الطبقات (5 طبقات أمان)
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                      <Badge className="bg-blue-600">1</Badge>
                      <span><strong>البريد وكلمة المرور:</strong> التحقق من بيانات الاعتماد الأساسية</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                      <Badge className="bg-blue-600">2</Badge>
                      <span><strong>بصمة الجهاز:</strong> التأكد من أن الجهاز مسجل ومصرح له</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                      <Badge className="bg-blue-600">3</Badge>
                      <span><strong>التحقق الجغرافي:</strong> التحقق من أن المستخدم داخل النطاق المسموح</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                      <Badge className="bg-blue-600">4</Badge>
                      <span><strong>رمز الجهاز السري:</strong> إدخال رمز سري لتسجيل جهاز جديد</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                      <Badge className="bg-blue-600">5</Badge>
                      <span><strong>التعرف على الوجه:</strong> مطابقة الوجه مع البيانات المخزنة</span>
                    </div>
                  </div>
                </div>

                {/* Face Recognition Flow */}
                <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 rounded-xl p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    مثال 2: التعرف على الوجه
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-3">كيف يعمل؟</h4>
                      <ol className="space-y-2 text-sm">
                        <li className="flex gap-2"><Badge variant="outline">1</Badge> التقاط صورة الوجه بالكاميرا</li>
                        <li className="flex gap-2"><Badge variant="outline">2</Badge> استخراج 128 بُعداً (متجه الوجه)</li>
                        <li className="flex gap-2"><Badge variant="outline">3</Badge> تشفير البيانات قبل الإرسال</li>
                        <li className="flex gap-2"><Badge variant="outline">4</Badge> البحث في قاعدة البيانات باستخدام امتداد المتجهات</li>
                        <li className="flex gap-2"><Badge variant="outline">5</Badge> حساب نسبة التشابه (تشابه جيب التمام)</li>
                        <li className="flex gap-2"><Badge variant="outline">6</Badge> إرجاع النتائج (نسبة تشابه أكبر من 60%)</li>
                      </ol>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-400 mb-2">الصيغة الرياضية:</h4>
                      <div className="text-green-400 text-sm block mb-2 font-mono" dir="ltr">
                        Cosine Similarity = (A · B) / (||A|| × ||B||)
                      </div>
                      <p className="text-xs text-white/60">حيث أ و ب هما متجهان بـ 128 بُعداً</p>
                      <div className="mt-3 text-sm">
                        <p><strong className="text-yellow-400">العتبة:</strong> 60% (0.6)</p>
                        <p><strong className="text-green-400">مطابقة:</strong> إذا التشابه ≥ 60%</p>
                        <p><strong className="text-red-400">لا مطابقة:</strong> إذا التشابه أقل من 60%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GPS Tracking Flow */}
                <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 rounded-xl p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    مثال 3: تتبع جي بي إس الفوري
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                      <Badge className="bg-purple-600 mt-1">1</Badge>
                      <div>
                        <strong>جمع البيانات:</strong>
                        <p className="text-sm text-white/70">جي بي إس يرسل: خط العرض، خط الطول، الدقة، السرعة، الاتجاه</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                      <Badge className="bg-purple-600 mt-1">2</Badge>
                      <div>
                        <strong>التخزين:</strong>
                        <p className="text-sm text-white/70">حفظ في جدول تتبع الموقع مع معرف المستخدم</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                      <Badge className="bg-purple-600 mt-1">3</Badge>
                      <div>
                        <strong>العرض الفوري:</strong>
                        <p className="text-sm text-white/70">خدمة الوقت الفعلي تدفع التحديثات للخريطة مباشرة</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Shield className="w-6 h-6 text-yellow-400" />
                  نظام الأمان المتكامل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Multi-layer Auth */}
                <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
                  <h3 className="text-xl font-bold text-red-400 mb-4">🔐 المصادقة متعددة الطبقات</h3>
                  <div className="grid md:grid-cols-5 gap-3">
                    {[
                      { layer: '1', title: 'كلمة المرور', desc: 'تشفير بي كريبت' },
                      { layer: '2', title: 'بصمة الجهاز', desc: 'معرف فريد للجهاز' },
                      { layer: '3', title: 'الموقع', desc: 'نطاق جغرافي' },
                      { layer: '4', title: 'رمز الجهاز', desc: 'رمز سري' },
                      { layer: '5', title: 'التعرف بالوجه', desc: 'واجهة الوجه' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">{item.layer}</div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-white/60">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RLS */}
                <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/30">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">🛡️ أمان مستوى الصف</h3>
                  <p className="mb-4 text-white/80">سياسات أمان على مستوى الصفوف تضمن أن كل مستخدم يرى فقط البيانات المصرح له بها</p>
                  <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto" dir="ltr">
                    <code className="text-green-400">
                      CREATE POLICY "incidents_select_policy"<br/>
                      ON public.incidents<br/>
                      FOR SELECT<br/>
                      USING (<br/>
                      &nbsp;&nbsp;auth.uid() = reporter_id OR<br/>
                      &nbsp;&nbsp;auth.uid() = assigned_to OR<br/>
                      &nbsp;&nbsp;EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')<br/>
                      );
                    </code>
                  </div>
                </div>

                {/* Attack Protection */}
                <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-purple-400 mb-4">⚔️ الحماية من الهجمات</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { attack: 'حقن SQL', protection: 'استعلامات معلمة + حزمة التطوير', color: 'bg-red-500/20' },
                      { attack: 'البرمجة عبر المواقع', protection: 'ترميز تلقائي من React + سياسة أمان المحتوى', color: 'bg-orange-500/20' },
                      { attack: 'تزوير الطلبات', protection: 'ملفات تعريف ارتباط آمنة + التحقق من الرموز', color: 'bg-yellow-500/20' },
                      { attack: 'هجمات القوة الغاشمة', protection: 'تحديد معدل الطلبات + قفل الحساب', color: 'bg-green-500/20' },
                      { attack: 'هجوم الرجل في المنتصف', protection: 'تشفير HTTPS/TLS', color: 'bg-blue-500/20' },
                      { attack: 'اختطاف الجلسة', protection: 'رموز JWT + ملفات تعريف ارتباط آمنة', color: 'bg-purple-500/20' },
                    ].map((item, i) => (
                      <div key={i} className={`${item.color} rounded-lg p-4 border border-white/10`}>
                        <p className="font-bold text-white mb-1">{item.attack}</p>
                        <p className="text-sm text-white/70">{item.protection}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Face Encryption */}
                <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-green-400 mb-4">🔒 تشفير بصمات الوجه</h3>
                  <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto" dir="ltr">
                    <code className="text-green-400">
                      // XOR Cipher + Base64 Encoding<br/>
                      export const encryptFaceData = (data: string, key: string): string =&gt; {'{'}<br/>
                      &nbsp;&nbsp;let result = '';<br/>
                      &nbsp;&nbsp;for (let i = 0; i &lt; data.length; i++) {'{'}<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;result += String.fromCharCode(<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;data.charCodeAt(i) ^ key.charCodeAt(i % key.length)<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;);<br/>
                      &nbsp;&nbsp;{'}'}<br/>
                      &nbsp;&nbsp;return btoa(result); // Base64<br/>
                      {'}'};
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      <h4 className="font-semibold text-yellow-400 mb-2">بيئة التطوير المتكاملة:</h4>
                      <p>فيجوال ستوديو كود</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">إدارة النسخ:</h4>
                      <p>جيت + جيت هاب + أتمتة النشر</p>
                    </div>
                  </div>
                </div>

                {/* Languages & Frameworks */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-500/20 rounded-xl p-5 border border-blue-500/30">
                    <h4 className="font-bold text-blue-400 mb-3">📝 لغات البرمجة</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><Badge variant="secondary">TS</Badge> تايب سكريبت 5</li>
                      <li className="flex items-center gap-2"><Badge variant="secondary">JS</Badge> جافا سكريبت</li>
                      <li className="flex items-center gap-2"><Badge variant="secondary">SQL</Badge> بوستجريس</li>
                      <li className="flex items-center gap-2"><Badge variant="secondary">CSS</Badge> تيلويند</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-500/20 rounded-xl p-5 border border-green-500/30">
                    <h4 className="font-bold text-green-400 mb-3">⚛️ الأطر والمكتبات</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><Badge variant="secondary">⚛️</Badge> رياكت 18</li>
                      <li className="flex items-center gap-2"><Badge variant="secondary">⚡</Badge> فايت</li>
                      <li className="flex items-center gap-2"><Badge variant="secondary">🎨</Badge> شادسن</li>
                      <li className="flex items-center gap-2"><Badge variant="secondary">🔄</Badge> تانستاك كويري</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-500/20 rounded-xl p-5 border border-purple-500/30">
                    <h4 className="font-bold text-purple-400 mb-3">🔧 الخدمات</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><Badge variant="secondary">☁️</Badge> سوبابيس</li>
                      <li className="flex items-center gap-2"><Badge variant="secondary">🗄️</Badge> بوستجريس</li>
                      <li className="flex items-center gap-2"><Badge variant="secondary">🦕</Badge> بيئة دينو</li>
                      <li className="flex items-center gap-2"><Badge variant="secondary">🗺️</Badge> ماب بوكس</li>
                    </ul>
                  </div>
                </div>

                {/* Key Libraries Table */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 overflow-x-auto">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4">📚 المكتبات الرئيسية</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-right py-2 px-3">المكتبة</th>
                        <th className="text-right py-2 px-3">الاستخدام</th>
                        <th className="text-right py-2 px-3">الإصدار</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { lib: 'react', use: 'واجهة المستخدم', ver: '^18.3.1' },
                        { lib: '@supabase/supabase-js', use: 'الاتصال بقاعدة البيانات', ver: '^2.75.1' },
                        { lib: 'face-api.js', use: 'التعرف على الوجه', ver: '^0.22.2' },
                        { lib: '@tanstack/react-query', use: 'إدارة حالة البيانات', ver: '^5.56.2' },
                        { lib: 'framer-motion', use: 'الرسوم المتحركة', ver: '^12.23.24' },
                        { lib: 'mapbox-gl', use: 'الخرائط التفاعلية', ver: '^3.14.0' },
                        { lib: 'zod', use: 'التحقق من البيانات', ver: '^3.23.8' },
                        { lib: 'recharts', use: 'الرسوم البيانية', ver: '^2.12.7' },
                      ].map((item, i) => (
                        <tr key={i} className="border-b border-white/10">
                          <td className="py-2 px-3 font-mono text-blue-400" dir="ltr">{item.lib}</td>
                          <td className="py-2 px-3">{item.use}</td>
                          <td className="py-2 px-3 text-white/60" dir="ltr">{item.ver}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Cpu className="w-6 h-6 text-yellow-400" />
                  مميزات النظام وفوائده
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: '🤖', title: 'الذكاء الاصطناعي', desc: 'استعلام ذكي باللغة الطبيعية عن المواطنين والحوادث', color: 'from-purple-600/40 to-pink-600/40' },
                    { icon: '👤', title: 'التعرف على الوجه', desc: 'مطابقة الوجوه بدقة 128 بُعداً مع نسبة تشابه 60%', color: 'from-blue-600/40 to-cyan-600/40' },
                    { icon: '📍', title: 'تتبع جي بي إس فوري', desc: 'مراقبة حية لمواقع الدوريات على الخريطة', color: 'from-green-600/40 to-emerald-600/40' },
                    { icon: '🔔', title: 'نظام إشعارات', desc: 'إشعارات طوارئ فورية لجميع الوحدات', color: 'from-red-600/40 to-orange-600/40' },
                    { icon: '🏛️', title: '10 أقسام شرطية', desc: 'دعم كامل لجميع أقسام الشرطة الفلسطينية', color: 'from-yellow-600/40 to-amber-600/40' },
                    { icon: '📊', title: 'لوحات تحكم', desc: 'إحصائيات ورسوم بيانية تفاعلية', color: 'from-indigo-600/40 to-violet-600/40' },
                    { icon: '📱', title: 'تصميم متجاوب', desc: 'يعمل على جميع الأجهزة (حاسوب، تابلت، هاتف)', color: 'from-teal-600/40 to-cyan-600/40' },
                    { icon: '🔐', title: 'أمان متعدد الطبقات', desc: '5 طبقات حماية للوصول الآمن', color: 'from-rose-600/40 to-red-600/40' },
                    { icon: '🌐', title: 'دعم العربية', desc: 'واجهة كاملة بالعربية من اليمين لليسار', color: 'from-sky-600/40 to-blue-600/40' },
                  ].map((feature, i) => (
                    <div key={i} className={`bg-gradient-to-br ${feature.color} rounded-xl p-5 border border-white/20`}>
                      <div className="text-3xl mb-3">{feature.icon}</div>
                      <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                      <p className="text-sm text-white/80">{feature.desc}</p>
                    </div>
                  ))}
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
                <Accordion type="single" collapsible className="space-y-3">
                  {[
                    {
                      q: 'لماذا اخترت React بدلاً من Angular أو Vue؟',
                      a: 'اخترت React لعدة أسباب: أولاً - أكبر مجتمع مطورين ودعم مستمر من شركة ميتا. ثانياً - هيكل قائم على المكونات يسهل إعادة الاستخدام. ثالثاً - الـ DOM الافتراضي يحسن الأداء. رابعاً - توافق ممتاز مع TypeScript. خامساً - توفر مكتبات غنية مثل Shadcn/UI وTanStack Query.'
                    },
                    {
                      q: 'كيف تضمن أمان البيانات الحساسة في النظام؟',
                      a: 'نستخدم نهج الدفاع في العمق: أولاً - تشفير HTTPS لجميع الاتصالات. ثانياً - أمان مستوى الصف في PostgreSQL. ثالثاً - رموز JWT مع انتهاء صلاحية. رابعاً - بصمة الجهاز لمنع الوصول غير المصرح. خامساً - التحقق الجغرافي. سادساً - تشفير بصمات الوجه قبل التخزين.'
                    },
                    {
                      q: 'اشرح آلية عمل التعرف على الوجه؟',
                      a: 'نستخدم مكتبة face-api.js المبنية على TensorFlow.js: أولاً - تحميل نماذج SSD MobileNet. ثانياً - اكتشاف الوجه في الصورة. ثالثاً - استخراج 128 قيمة عددية (متجه الوجه). رابعاً - تخزين المتجه في PostgreSQL مع امتداد pgvector. خامساً - عند البحث نحسب تشابه جيب التمام بين المتجهات. سادساً - نتائج بنسبة تشابه ≥60% تعتبر مطابقة.'
                    },
                    {
                      q: 'ما الفرق بين وظائف الحافة والخلفية التقليدية؟',
                      a: 'وظائف الحافة تعمل على الحافة قريباً من المستخدم: أولاً - بدون خادم فلا حاجة لإدارة خوادم. ثانياً - توسع تلقائي. ثالثاً - تكلفة أقل لأنك تدفع فقط عند الاستخدام. رابعاً - بدء تشغيل أسرع مع بيئة Deno. خامساً - نشر فوري. العيب هو وقت تنفيذ محدود عادة 30-60 ثانية.'
                    },
                    {
                      q: 'كيف يتم تحديث البيانات بشكل فوري؟',
                      a: 'نستخدم ميزة الوقت الفعلي المبنية على Phoenix Channels: أولاً - المستخدم يشترك في جدول معين. ثانياً - عند أي تغيير (إدراج/تحديث/حذف). ثالثاً - يتم إرسال إشعار WebSocket. رابعاً - React Query يحدث الذاكرة المؤقتة تلقائياً. خامساً - الواجهة تتحدث بدون إعادة تحميل.'
                    },
                    {
                      q: 'كيف يعمل التحقق من موقع تسجيل الدخول؟',
                      a: 'عملية التحقق من الموقع: أولاً - نأخذ إحداثيات GPS من المتصفح. ثانياً - نرسلها لوظيفة الحافة. ثالثاً - نحسب المسافة باستخدام صيغة هافرساين. رابعاً - نقارن مع المواقع المسموحة في قاعدة البيانات. خامساً - إذا المسافة أكبر من الحد المسموح نرفض الدخول.'
                    },
                    {
                      q: 'ما هو أمان مستوى الصف وكيف يعمل؟',
                      a: 'أمان مستوى الصف هو ميزة في PostgreSQL تطبق سياسات أمان على مستوى الصف: أولاً - نعرف سياسة لكل جدول. ثانياً - نحدد شروط الوصول باستخدام SQL. ثالثاً - دالة auth.uid() تعطينا هوية المستخدم الحالي. رابعاً - كل استعلام يمر بفلتر الأمان تلقائياً. خامساً - حتى لو حاول المهاجم حقن SQL، لن يرى إلا بياناته.'
                    },
                    {
                      q: 'لماذا TypeScript بدلاً من JavaScript العادي؟',
                      a: 'TypeScript يوفر: أولاً - فحص الأنواع الثابتة يكتشف الأخطاء قبل التشغيل. ثانياً - اقتراحات ذكية أفضل في VS Code. ثالثاً - إعادة هيكلة آمنة. رابعاً - توثيق ذاتي للكود. خامساً - دعم أفضل للبرمجة كائنية التوجه. سادساً - تكامل ممتاز مع React وSupabase.'
                    },
                    {
                      q: 'كيف تم نشر المشروع؟',
                      a: 'نستخدم البنية التحتية السحابية: أولاً - الواجهة الأمامية تُنشر على شبكة توزيع المحتوى العالمية. ثانياً - وظائف الحافة تُنشر على Supabase. ثالثاً - قاعدة البيانات مُدارة على Supabase. رابعاً - تكامل ونشر مستمر تلقائي عند كل تغيير. خامساً - شهادة HTTPS مجانية. سادساً - دعم النطاق المخصص.'
                    },
                    {
                      q: 'ما هي التحديات التي واجهتها وكيف تغلبت عليها؟',
                      a: 'أبرز التحديات: أولاً - دقة التعرف على الوجه وحُلت بتجربة عتبات مختلفة ووصلنا لـ 60%. ثانياً - أداء الخرائط واستخدمنا Mapbox بدل Google Maps. ثالثاً - أمان متعدد الطبقات وصممنا نظام بصمة الجهاز والتحقق الجغرافي. رابعاً - دعم العربية وTailwind CSS سهّل الأمر.'
                    },
                  ].map((item, i) => (
                    <AccordionItem key={i} value={`q-${i}`} className="bg-white/5 rounded-lg border border-white/10 px-4">
                      <AccordionTrigger className="text-right hover:no-underline">
                        <span className="flex items-center gap-3">
                          <Badge className="bg-blue-600 flex-shrink-0">{i + 1}</Badge>
                          <span className="text-white text-right">{item.q}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-white/80 leading-relaxed pt-2 text-right">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { value: '+100', label: 'صفحة', icon: FileText, color: 'from-blue-500 to-blue-700' },
                    { value: '+200', label: 'مكون React', icon: Code, color: 'from-green-500 to-green-700' },
                    { value: '34', label: 'وظيفة حافة', icon: Server, color: 'from-purple-500 to-purple-700' },
                    { value: '+75', label: 'جدول بيانات', icon: Database, color: 'from-orange-500 to-orange-700' },
                    { value: '10', label: 'قسم شرطي', icon: Users, color: 'from-red-500 to-red-700' },
                    { value: '5', label: 'طبقات أمان', icon: Shield, color: 'from-pink-500 to-pink-700' },
                    { value: '128', label: 'بُعد للوجه', icon: Camera, color: 'from-cyan-500 to-cyan-700' },
                    { value: 'عربي', label: 'دعم اللغة', icon: Globe, color: 'from-yellow-500 to-yellow-700' },
                  ].map((stat, i) => (
                    <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-5 text-center`}>
                      <stat.icon className="w-8 h-8 mx-auto mb-2 opacity-80" />
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-sm opacity-80">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">🎯 ملخص المشروع</h3>
                  <p className="text-lg text-center leading-relaxed">
                    نظام <strong className="text-blue-400">Police Ops</strong> هو مشروع تخرج متكامل يقدم حلاً رقمياً شاملاً للشرطة الفلسطينية،
                    مبني على تقنيات حديثة مثل <strong className="text-green-400">React</strong> و<strong className="text-purple-400">Supabase</strong>،
                    مع <strong className="text-red-400">5 طبقات أمان</strong> ونظام <strong className="text-cyan-400">تعرف على الوجه بالذكاء الاصطناعي</strong>،
                    يخدم <strong className="text-yellow-400">10 أقسام شرطية</strong> بأكثر من <strong className="text-pink-400">100 صفحة تفاعلية</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:text-black { color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default ProjectPresentation;
