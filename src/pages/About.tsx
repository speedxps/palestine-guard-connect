import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Database, 
  Code, 
  Globe, 
  Smartphone,
  Lock,
  Users,
  FileText,
  MapPin,
  MessageSquare,
  Calendar,
  Search,
  Camera,
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Cloud,
  Zap,
  Headphones,
  Mail,
  Github,
  Star,
  Cpu,
  Layers,
  Eye,
  ShieldCheck,
  Car,
  Bell,
  Settings,
  LogIn,
  ScanFace,
  Navigation,
  Clock,
  FileSearch,
  BarChart3,
  Send,
  Building2,
  Plane,
  Scale,
  Map,
  Phone,
  Download,
  Printer,
  Brain,
  Mic,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Target,
  Activity,
  Wifi
} from 'lucide-react';

const About: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // ============= بيانات النظام =============
  const systemInfo = {
    name: 'نظام إدارة عمليات الشرطة الفلسطينية',
    englishName: 'Palestinian Police Operations System',
    version: 'v2.5.0',
    developer: 'Noor Khallaf',
    startDate: 'يناير 2024',
    lastUpdate: 'أكتوبر 2025',
    purpose: 'نظام متكامل لإدارة جميع عمليات الشرطة الفلسطينية بشكل رقمي وآمن'
  };

  // ============= مميزات تسجيل الدخول والأمان =============
  const loginFeatures = [
    {
      title: 'تسجيل الدخول التقليدي',
      icon: LogIn,
      description: 'تسجيل دخول بالبريد الإلكتروني وكلمة المرور مع خيار "تذكرني"',
      steps: [
        'أدخل اسم المستخدم (البريد الإلكتروني)',
        'أدخل كلمة المرور',
        'اختياري: فعّل "تذكرني" لحفظ بياناتك',
        'اضغط على زر تسجيل الدخول'
      ]
    },
    {
      title: 'تسجيل الدخول بالوجه',
      icon: ScanFace,
      description: 'تسجيل دخول سريع وآمن باستخدام التعرف على الوجه بالذكاء الاصطناعي',
      steps: [
        'اضغط على "تسجيل الدخول عبر الوجه"',
        'ستفتح الكاميرا تلقائياً',
        'ضع وجهك في الإطار المحدد',
        'سيتم التعرف عليك تلقائياً (نسبة التطابق > 60%)',
        'سيتم تسجيل دخولك مباشرة'
      ]
    },
    {
      title: 'البصمة البيومترية',
      icon: Fingerprint,
      description: 'تسجيل دخول بالبصمة على الأجهزة الداعمة',
      steps: [
        'اضغط على أيقونة البصمة',
        'ضع إصبعك على قارئ البصمة',
        'سيتم التحقق وتسجيل دخولك'
      ]
    },
    {
      title: 'الحماية الجغرافية',
      icon: MapPin,
      description: 'النظام يعمل فقط من داخل فلسطين لأسباب أمنية',
      steps: [
        'يتم فحص موقعك عند تسجيل الدخول',
        'إذا كنت خارج فلسطين ستظهر صفحة "تسجيل الدخول محظور"',
        'يتم إرسال تنبيه للإدارة عن المحاولة المشبوهة'
      ]
    },
    {
      title: 'إدارة الأجهزة',
      icon: Smartphone,
      description: 'تحديد عدد الأجهزة المسموح بها لكل مستخدم',
      steps: [
        'يتم تسجيل بصمة الجهاز عند أول تسجيل دخول',
        'إذا تجاوزت الحد المسموح ستُمنع',
        'يمكنك طلب الموافقة على جهاز جديد من الإدارة'
      ]
    }
  ];

  // ============= لوحة التحكم الرئيسية =============
  const dashboardFeatures = [
    {
      title: 'الإحصائيات السريعة',
      icon: BarChart3,
      description: 'عرض إحصائيات فورية عن النظام',
      items: ['عدد البلاغات الجديدة', 'المهام المعلقة', 'الرسائل غير المقروءة', 'عدد المستخدمين النشطين']
    },
    {
      title: 'سيارة الشرطة المتحركة',
      icon: Car,
      description: 'أنيميشن يعرض آخر الإشعارات المهمة بشكل ديناميكي',
      items: ['تنبيهات عاجلة', 'أخبار جديدة', 'مهام مستعجلة']
    },
    {
      title: 'جرس الإشعارات',
      icon: Bell,
      description: 'مركز الإشعارات الموحد',
      items: ['تنبيهات تسجيل الدخول', 'الرسائل الجديدة', 'المهام الجديدة', 'تحديثات القضايا']
    },
    {
      title: 'الأخبار الداخلية',
      icon: FileText,
      description: 'آخر الأخبار والتعميمات',
      items: ['أخبار الأقسام', 'التعميمات الرسمية', 'الإعلانات المهمة']
    },
    {
      title: 'الوصول السريع',
      icon: Zap,
      description: 'أزرار سريعة للوظائف الأكثر استخداماً حسب صلاحياتك',
      items: ['بلاغ جديد', 'بحث سريع', 'الدوريات', 'المهام']
    }
  ];

  // ============= البحث والاستعلام =============
  const searchFeatures = [
    {
      title: 'البحث الشامل',
      icon: Search,
      description: 'البحث في جميع قواعد البيانات بضغطة واحدة',
      searchTypes: [
        { type: 'رقم الهوية', example: 'مثال: 123456789' },
        { type: 'رقم السيارة', example: 'مثال: 12-345-67' },
        { type: 'رقم الهاتف', example: 'مثال: 0599123456' },
        { type: 'الاسم', example: 'مثال: محمد أحمد' },
        { type: 'رقم القضية', example: 'مثال: CYB-2024-001' }
      ]
    },
    {
      title: 'الاستعلام الذكي بالذكاء الاصطناعي',
      icon: Brain,
      description: 'اسأل بلغة طبيعية والذكاء الاصطناعي يجيبك',
      examples: [
        'ما هي مخالفات السيارة رقم 12-345-67؟',
        'أظهر لي سجل المواطن محمد أحمد',
        'كم عدد البلاغات هذا الشهر؟',
        'ما هي آخر قضايا الجرائم الإلكترونية؟'
      ],
      features: ['ملخصات ذكية', 'إنشاء تقارير PDF', 'نسخ النتائج']
    }
  ];

  // ============= إدارة السجلات =============
  const recordsFeatures = [
    {
      title: 'السجل المدني',
      icon: Users,
      description: 'قاعدة بيانات شاملة للمواطنين',
      fields: ['الاسم الكامل', 'رقم الهوية', 'تاريخ الميلاد', 'العنوان', 'رقم الهاتف', 'صورة شخصية', 'بيانات المركبات', 'السجل الجنائي']
    },
    {
      title: 'سجلات المركبات',
      icon: Car,
      description: 'قاعدة بيانات المركبات والمخالفات',
      fields: ['رقم اللوحة', 'نوع المركبة', 'اللون', 'سنة الصنع', 'المالك', 'المخالفات', 'حالة الترخيص']
    },
    {
      title: 'سجلات الحوادث',
      icon: AlertTriangle,
      description: 'توثيق وتتبع جميع الحوادث والبلاغات',
      fields: ['نوع الحادث', 'الموقع', 'الوصف', 'الأطراف', 'الضابط المسؤول', 'حالة المتابعة', 'المرفقات']
    }
  ];

  // ============= الأقسام المتخصصة =============
  const departments = [
    {
      name: 'شرطة المرور',
      icon: Car,
      color: 'blue',
      features: ['سجلات المخالفات', 'البحث عن مركبات', 'إصدار المخالفات', 'تقارير مرورية', 'بحث عن مواطنين']
    },
    {
      name: 'المباحث الجنائية (CID)',
      icon: Search,
      color: 'red',
      features: ['ملفات المشتبهين', 'إدارة التحقيقات', 'قوائم المطلوبين', 'ربط القضايا', 'الأدلة الجنائية']
    },
    {
      name: 'الجرائم الإلكترونية',
      icon: Shield,
      color: 'purple',
      features: ['بلاغات الجرائم الإلكترونية', 'تحليل الاتجاهات', 'تقارير أمنية', 'متابعة القضايا', 'إحصائيات متقدمة']
    },
    {
      name: 'الشرطة القضائية',
      icon: Scale,
      color: 'orange',
      features: ['إدارة القضايا', 'التواصل مع المحاكم', 'تتبع الإجراءات', 'المراسلات القضائية', 'الأرشفة']
    },
    {
      name: 'المعابر والحدود',
      icon: Plane,
      color: 'green',
      features: ['مراقبة المعابر', 'تصاريح السفر', 'قاعدة بيانات الحدود', 'التنسيق الأمني']
    },
    {
      name: 'الشرطة السياحية',
      icon: Map,
      color: 'cyan',
      features: ['خدمات السياح', 'المواقع السياحية', 'بلاغات السياح', 'الإرشادات']
    },
    {
      name: 'العمليات المشتركة',
      icon: Users,
      color: 'indigo',
      features: ['تنسيق العمليات', 'غرفة القيادة', 'الملفات المشتركة', 'التدريب', 'خطوط الطوارئ']
    },
    {
      name: 'الشرطة الخاصة',
      icon: Shield,
      color: 'gray',
      features: ['العمليات الخاصة', 'التدخل السريع', 'الحماية', 'المهمات الحساسة']
    }
  ];

  // ============= التتبع والمراقبة =============
  const trackingFeatures = [
    {
      title: 'تتبع GPS للضباط',
      icon: Navigation,
      description: 'تتبع مواقع الضباط في الميدان بشكل مباشر',
      details: [
        'يتم تحديث الموقع كل 30 ثانية',
        'يُسجَّل: خط الطول، خط العرض، الدقة، السرعة',
        'يمكن للمشرفين رؤية جميع الضباط على الخريطة',
        'يُحفظ سجل كامل للمسارات'
      ]
    },
    {
      title: 'خريطة التتبع المباشر',
      icon: Map,
      description: 'خريطة تفاعلية لعرض المواقع',
      details: [
        'عرض جميع الضباط النشطين',
        'ألوان مختلفة حسب الحالة',
        'النقر على الضابط لعرض تفاصيله',
        'تصفية حسب القسم'
      ]
    },
    {
      title: 'سجل المواقع',
      icon: Clock,
      description: 'أرشيف لجميع تحركات المستخدمين',
      details: [
        'عرض التاريخ الكامل للتحركات',
        'تصدير البيانات',
        'تحليل أنماط التحرك'
      ]
    }
  ];

  // ============= نظام الإشعارات =============
  const notificationFeatures = [
    {
      type: 'إشعارات تسجيل الدخول',
      icon: LogIn,
      description: 'تنبيهات عند تسجيل الدخول من جهاز جديد أو موقع مشبوه'
    },
    {
      type: 'إشعارات المهام',
      icon: Calendar,
      description: 'تذكيرات بالمهام الجديدة والمواعيد النهائية'
    },
    {
      type: 'إشعارات الرسائل',
      icon: MessageSquare,
      description: 'تنبيهات عند استلام رسائل جديدة'
    },
    {
      type: 'إشعارات طارئة',
      icon: AlertTriangle,
      description: 'تنبيهات عاجلة تتطلب اهتماماً فورياً'
    },
    {
      type: 'تحديثات القضايا',
      icon: FileText,
      description: 'إشعارات عند تحديث القضايا المتابَعة'
    }
  ];

  // ============= التقارير والإحصائيات =============
  const reportFeatures = [
    {
      title: 'تقارير PDF',
      icon: FileText,
      types: ['تقرير مواطن شامل', 'تقرير مركبة', 'تقرير قضية', 'تقرير يومي']
    },
    {
      title: 'إحصائيات يومية',
      icon: BarChart3,
      types: ['عدد البلاغات', 'القضايا المغلقة', 'المخالفات', 'نشاط المستخدمين']
    },
    {
      title: 'تحليل الاتجاهات',
      icon: Activity,
      types: ['تحليل الجرائم الإلكترونية', 'أنماط المخالفات', 'توزيع الحوادث']
    }
  ];

  // ============= الإعدادات الشخصية =============
  const settingsFeatures = [
    {
      title: 'إعدادات الملف الشخصي',
      icon: User,
      items: ['تعديل الاسم', 'تغيير الصورة', 'تحديث البيانات']
    },
    {
      title: 'إعداد التعرف على الوجه',
      icon: ScanFace,
      items: ['تسجيل صورة الوجه', 'تحديث الصورة', 'حذف بيانات الوجه']
    },
    {
      title: 'إدارة الأجهزة',
      icon: Smartphone,
      items: ['عرض الأجهزة المسجلة', 'حذف جهاز', 'طلب جهاز جديد']
    },
    {
      title: 'إعدادات اللغة',
      icon: Globe,
      items: ['العربية', 'English']
    },
    {
      title: 'إعدادات الأمان',
      icon: Lock,
      items: ['تغيير كلمة المرور', 'تفعيل 2FA', 'سجل الدخول']
    }
  ];

  // ============= صلاحيات المستخدمين =============
  const userRoles = [
    {
      role: 'مدير النظام (Admin)',
      permissions: ['الوصول الكامل لجميع الأقسام', 'إدارة المستخدمين', 'إدارة الأجهزة', 'عرض سجلات الدخول', 'النسخ الاحتياطي', 'إدارة الأخبار', 'إدارة الإشعارات'],
      color: 'red'
    },
    {
      role: 'ضابط (Officer)',
      permissions: ['الوصول لقسمه فقط', 'إنشاء بلاغات', 'متابعة القضايا', 'البحث في السجلات', 'إرسال الرسائل'],
      color: 'blue'
    },
    {
      role: 'محلل (Analyst)',
      permissions: ['عرض التقارير', 'تحليل الإحصائيات', 'تصدير البيانات', 'البحث المتقدم'],
      color: 'green'
    },
    {
      role: 'مشاهد (Viewer)',
      permissions: ['عرض البيانات فقط', 'لا يمكنه التعديل أو الإضافة'],
      color: 'gray'
    }
  ];

  // ============= أدوات الإدارة =============
  const adminTools = [
    {
      title: 'إدارة المستخدمين',
      icon: Users,
      description: 'إنشاء وتعديل وحذف المستخدمين وتحديد صلاحياتهم'
    },
    {
      title: 'إدارة بيانات الوجه',
      icon: ScanFace,
      description: 'عرض وإدارة بيانات التعرف على الوجه لجميع المستخدمين'
    },
    {
      title: 'إدارة الأجهزة',
      icon: Smartphone,
      description: 'الموافقة أو حظر الأجهزة، تحديد الحد الأقصى للأجهزة'
    },
    {
      title: 'سجلات الدخول',
      icon: FileText,
      description: 'عرض جميع محاولات تسجيل الدخول الناجحة والفاشلة'
    },
    {
      title: 'النسخ الاحتياطي',
      icon: Download,
      description: 'إنشاء واستعادة نسخ احتياطية للبيانات'
    },
    {
      title: 'إدارة الأخبار',
      icon: FileText,
      description: 'نشر وتعديل الأخبار والتعميمات الداخلية'
    }
  ];

  // ============= دعم الهاتف =============
  const mobileFeatures = [
    {
      title: 'تصميم متجاوب',
      description: 'يعمل على جميع الشاشات (هاتف، تابلت، كمبيوتر)'
    },
    {
      title: 'تطبيق محمول',
      description: 'تطبيق Capacitor لـ Android و iOS'
    },
    {
      title: 'الوصول للكاميرا',
      description: 'للتعرف على الوجه والتقاط الصور'
    },
    {
      title: 'GPS في الخلفية',
      description: 'تتبع الموقع حتى عند إغلاق التطبيق'
    },
    {
      title: 'البصمة البيومترية',
      description: 'دعم البصمة و Face ID'
    }
  ];

  // ============= تقنيات النظام =============
  const techStack = [
    { name: 'React 18', icon: Code, desc: 'مكتبة واجهة المستخدم' },
    { name: 'TypeScript', icon: Code, desc: 'لغة البرمجة' },
    { name: 'Supabase', icon: Database, desc: 'قاعدة البيانات والخلفية' },
    { name: 'PostgreSQL', icon: Database, desc: 'قاعدة البيانات' },
    { name: 'pgvector', icon: Brain, desc: 'التعرف على الوجه' },
    { name: 'Tailwind CSS', icon: Monitor, desc: 'التصميم' },
    { name: 'Capacitor', icon: Smartphone, desc: 'التطبيق المحمول' },
    { name: 'face-api.js', icon: ScanFace, desc: 'الذكاء الاصطناعي للوجه' },
  ];

  // ============= ميزات الأمان =============
  const securityFeatures = [
    { title: 'تشفير البيانات', desc: 'جميع البيانات مشفرة بمعايير AES-256', icon: Lock },
    { title: 'المصادقة المتعددة', desc: 'كلمة مرور + 2FA + وجه + بصمة', icon: Fingerprint },
    { title: 'RLS Security', desc: 'Row Level Security في قاعدة البيانات', icon: Database },
    { title: 'فحص الموقع', desc: 'التحقق من الموقع الجغرافي عند الدخول', icon: MapPin },
    { title: 'بصمة الجهاز', desc: 'تسجيل وفحص بصمة كل جهاز', icon: Fingerprint },
    { title: 'سجلات كاملة', desc: 'تسجيل جميع العمليات والأنشطة', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              رجوع
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">دليل النظام الشامل</h1>
            </div>
            <Badge variant="secondary">{systemInfo.version}</Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* System Info Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary">{systemInfo.name}</h2>
              <p className="text-muted-foreground italic">{systemInfo.englishName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-background/50 rounded-lg p-3">
              <span className="text-muted-foreground">الإصدار:</span>
              <p className="font-bold">{systemInfo.version}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <span className="text-muted-foreground">المطور:</span>
              <p className="font-bold">{systemInfo.developer}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <span className="text-muted-foreground">تاريخ البدء:</span>
              <p className="font-bold">{systemInfo.startDate}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <span className="text-muted-foreground">آخر تحديث:</span>
              <p className="font-bold">{systemInfo.lastUpdate}</p>
            </div>
          </div>
          <p className="mt-4 text-muted-foreground">{systemInfo.purpose}</p>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full flex flex-wrap justify-start gap-1 h-auto p-2 bg-muted/50">
            <TabsTrigger value="overview" className="text-xs">نظرة عامة</TabsTrigger>
            <TabsTrigger value="login" className="text-xs">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="dashboard" className="text-xs">لوحة التحكم</TabsTrigger>
            <TabsTrigger value="search" className="text-xs">البحث</TabsTrigger>
            <TabsTrigger value="records" className="text-xs">السجلات</TabsTrigger>
            <TabsTrigger value="departments" className="text-xs">الأقسام</TabsTrigger>
            <TabsTrigger value="tracking" className="text-xs">التتبع</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">التقارير</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">الإعدادات</TabsTrigger>
            <TabsTrigger value="admin" className="text-xs">الإدارة</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">الأمان</TabsTrigger>
            <TabsTrigger value="tech" className="text-xs">التقنيات</TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                ما هو هذا النظام؟
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                نظام إدارة عمليات الشرطة الفلسطينية هو منصة رقمية متكاملة تهدف إلى تحويل جميع عمليات الشرطة من الورق إلى النظام الإلكتروني. 
                يوفر النظام أدوات للبحث، إدارة السجلات، التتبع، التواصل، وإعداد التقارير، مع مستوى عالٍ من الأمان والحماية.
              </p>

              <h4 className="font-bold mb-3">المميزات الرئيسية:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { icon: ScanFace, text: 'تسجيل دخول بالتعرف على الوجه' },
                  { icon: MapPin, text: 'حماية جغرافية - فلسطين فقط' },
                  { icon: Smartphone, text: 'إدارة الأجهزة المصرح بها' },
                  { icon: Navigation, text: 'تتبع GPS للضباط في الميدان' },
                  { icon: Brain, text: 'استعلام ذكي بالذكاء الاصطناعي' },
                  { icon: Users, text: 'أقسام متخصصة متعددة' },
                  { icon: Bell, text: 'نظام إشعارات متطور' },
                  { icon: FileText, text: 'تقارير PDF احترافية' },
                  { icon: MessageSquare, text: 'تواصل بين الأقسام' },
                  { icon: Lock, text: 'أمان متعدد الطبقات' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* تسجيل الدخول */}
          <TabsContent value="login" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <LogIn className="h-5 w-5 text-primary" />
                طرق تسجيل الدخول والأمان
              </h3>
              <div className="space-y-6">
                {loginFeatures.map((feature, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <h5 className="text-sm font-medium mb-2">خطوات الاستخدام:</h5>
                      <ol className="space-y-1">
                        {feature.steps.map((step, stepIdx) => (
                          <li key={stepIdx} className="flex items-start gap-2 text-sm">
                            <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                              {stepIdx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* لوحة التحكم */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                لوحة التحكم الرئيسية
              </h3>
              <p className="text-muted-foreground mb-6">
                بعد تسجيل الدخول بنجاح، ستصل إلى لوحة التحكم الرئيسية التي تعرض لك ملخصاً لكل شيء مهم:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardFeatures.map((feature, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <feature.icon className="h-5 w-5 text-primary" />
                      <h4 className="font-bold">{feature.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* البحث */}
          <TabsContent value="search" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                البحث والاستعلام
              </h3>
              {searchFeatures.map((feature, idx) => (
                <div key={idx} className="border rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <feature.icon className="h-5 w-5 text-primary" />
                    <h4 className="font-bold">{feature.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                  
                  {'searchTypes' in feature && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {feature.searchTypes.map((type, typeIdx) => (
                        <div key={typeIdx} className="bg-muted/30 rounded p-2 text-sm">
                          <span className="font-medium">{type.type}:</span>
                          <span className="text-muted-foreground mr-2">{type.example}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {'examples' in feature && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">أمثلة على الأسئلة:</h5>
                      <ul className="space-y-1">
                        {feature.examples.map((ex, exIdx) => (
                          <li key={exIdx} className="flex items-center gap-2 text-sm bg-primary/5 p-2 rounded">
                            <Brain className="h-4 w-4 text-primary" />
                            <span>"{ex}"</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {feature.features.map((f, fIdx) => (
                          <Badge key={fIdx} variant="secondary">{f}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </Card>
          </TabsContent>

          {/* السجلات */}
          <TabsContent value="records" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                إدارة السجلات
              </h3>
              <div className="space-y-4">
                {recordsFeatures.map((record, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <record.icon className="h-5 w-5 text-primary" />
                      <h4 className="font-bold">{record.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{record.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {record.fields.map((field, fieldIdx) => (
                        <Badge key={fieldIdx} variant="outline">{field}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* الأقسام */}
          <TabsContent value="departments" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                الأقسام المتخصصة
              </h3>
              <p className="text-muted-foreground mb-4">
                النظام يحتوي على أقسام متخصصة، كل قسم له صلاحيات ووظائف محددة:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments.map((dept, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 bg-${dept.color}-500/10 rounded-lg`}>
                        <dept.icon className={`h-5 w-5 text-${dept.color}-500`} />
                      </div>
                      <h4 className="font-bold">{dept.name}</h4>
                    </div>
                    <ul className="space-y-1">
                      {dept.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-center gap-2 text-sm">
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* التتبع */}
          <TabsContent value="tracking" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                نظام التتبع والمراقبة
              </h3>
              <div className="space-y-4">
                {trackingFeatures.map((feature, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <feature.icon className="h-5 w-5 text-primary" />
                      <h4 className="font-bold">{feature.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.details.map((detail, detailIdx) => (
                        <li key={detailIdx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  أنواع الإشعارات
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {notificationFeatures.map((notif, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <notif.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-sm">{notif.type}</h5>
                        <p className="text-xs text-muted-foreground">{notif.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* التقارير */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                التقارير والإحصائيات
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportFeatures.map((report, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <report.icon className="h-5 w-5 text-primary" />
                      <h4 className="font-bold">{report.title}</h4>
                    </div>
                    <ul className="space-y-1">
                      {report.types.map((type, typeIdx) => (
                        <li key={typeIdx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* الإعدادات */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                الإعدادات الشخصية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settingsFeatures.map((setting, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <setting.icon className="h-5 w-5 text-primary" />
                      <h4 className="font-bold">{setting.title}</h4>
                    </div>
                    <ul className="space-y-1">
                      {setting.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center gap-2 text-sm">
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-bold mb-3">صلاحيات المستخدمين:</h4>
                <div className="space-y-3">
                  {userRoles.map((role, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <h5 className="font-bold mb-2">{role.role}</h5>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map((perm, permIdx) => (
                          <Badge key={permIdx} variant="outline">{perm}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* الإدارة */}
          <TabsContent value="admin" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                أدوات الإدارة (للمديرين فقط)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminTools.map((tool, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <tool.icon className="h-5 w-5 text-primary" />
                      <h4 className="font-bold">{tool.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                دعم الهاتف المحمول
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {mobileFeatures.map((feature, idx) => (
                  <div key={idx} className="bg-muted/30 rounded-lg p-3">
                    <h5 className="font-medium text-sm">{feature.title}</h5>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* الأمان */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                ميزات الأمان والحماية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {securityFeatures.map((security, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-green-50/50 border border-green-200/50 rounded-lg">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <security.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800">{security.title}</h4>
                      <p className="text-sm text-green-700">{security.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* التقنيات */}
          <TabsContent value="tech" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                التقنيات المستخدمة
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {techStack.map((tech, idx) => (
                  <div key={idx} className="border rounded-lg p-3 text-center">
                    <tech.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h4 className="font-bold text-sm">{tech.name}</h4>
                    <p className="text-xs text-muted-foreground">{tech.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Contact */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Headphones className="h-5 w-5 text-primary" />
                للتواصل والدعم
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-4 py-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm">noor-khallaf@hotmail.com</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-4 py-2">
                  <Github className="h-4 w-4 text-primary" />
                  <span className="text-sm">github.com/noor-khallaf</span>
                </div>
              </div>
            </Card>

            {/* Footer */}
            <Card className="p-6 text-center bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-3 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg">نظام الشرطة الفلسطينية</h3>
              <p className="text-sm text-muted-foreground">نظام متطور لخدمة الوطن والمواطن</p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-3">
                <span>© 2024-2025</span>
                <span>•</span>
                <span>جميع الحقوق محفوظة</span>
                <span>•</span>
                <span>فلسطين</span>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default About;
