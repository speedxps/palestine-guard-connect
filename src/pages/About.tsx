import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useLanguage';
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
  ShieldCheck
} from 'lucide-react';

const About: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const techStack = [
    { name: 'React 18', icon: Code, desc: 'مكتبة واجهة المستخدم المتقدمة' },
    { name: 'TypeScript', icon: Code, desc: 'لغة البرمجة مع فحص الأنواع' },
    { name: 'Supabase', icon: Database, desc: 'قاعدة البيانات والخلفية' },
    { name: 'Tailwind CSS', icon: Monitor, desc: 'إطار عمل التصميم' },
    { name: 'Capacitor', icon: Smartphone, desc: 'تطوير التطبيقات المحمولة' },
    { name: 'Vite', icon: Zap, desc: 'أداة البناء السريعة' },
  ];

  const features = [
    {
      category: 'نظام المصادقة المتقدم',
      icon: Shield,
      items: [
        'تسجيل دخول بالتعرف على الوجه (Face Recognition)',
        'مصادقة ثنائية العامل (2FA) مع تطبيقات المصادقة',
        'تتبع سجلات الدخول مع GPS والموقع الجغرافي',
        'كشف محاولات الدخول المشبوهة تلقائياً',
        'تحقق من الموقع الجغرافي (فلسطين فقط)',
        'حفظ آمن لبيانات تسجيل الدخول',
        'نظام أدوار متعدد ومتطور للمستخدمين',
        'إشعارات فورية لمحاولات الدخول المشبوهة',
      ]
    },
    {
      category: 'إدارة البلاغات والحوادث',
      icon: FileText,
      items: [
        'إنشاء وتتبع البلاغات في الوقت الفعلي',
        'تصنيف البلاغات حسب النوع والأولوية',
        'تخصيص البلاغات للضباط المختصين',
        'رفع الملفات والصور المرفقة',
        'متابعة حالة البلاغات والتحديثات',
        'نظام إشعارات فوري',
      ]
    },
    {
      category: 'إدارة الدوريات',
      icon: MapPin,
      items: [
        'تتبع مواقع الدوريات في الوقت الفعلي',
        'إنشاء وإداة فرق الدوريات',
        'تسجيل مسار الدوريات',
        'تقارير الدوريات اليومية',
        'التنسيق بين الدوريات المختلفة',
      ]
    },
    {
      category: 'نظام المهام والواجبات',
      icon: Calendar,
      items: [
        'إنشاء وتخصيص المهام',
        'متابعة حالة المهام وإنجازها',
        'تحديد المواعيد النهائية',
        'نظام تنبيهات للمهام المعلقة',
        'تقييم أداء تنفيذ المهام',
      ]
    },
    {
      category: 'الجرائم الإلكترونية',
      icon: Shield,
      items: [
        'نظام بلاغات الجرائم الإلكترونية المتخصص',
        'تصنيف أنواع الجرائم الإلكترونية',
        'إدارة صلاحيات وحدة الجرائم الإلكترونية',
        'متابعة القضايا والتحقيقات',
        'نظام تعليقات وملاحظات متقدم',
      ]
    },
    {
      category: 'سجلات المواطنين والمخالفات',
      icon: Users,
      items: [
        'قاعدة بيانات شاملة للمواطنين',
        'تسجيل المخالفات المرورية',
        'متابعة القضايا الجنائية',
        'نظام البحث المتقدم',
        'إحصائيات شاملة للمخالفات',
        'قوائم المطلوبين',
      ]
    },
    {
      category: 'نظام الاتصالات والتواصل',
      icon: MessageSquare,
      items: [
        'التواصل المشترك بين جميع الأقسام',
        'نظام الرد على الرسائل',
        'استهداف جميع الأقسام أو قسم محدد',
        'إشعارات فورية للرسائل الجديدة',
        'تصنيف الرسائل حسب الأولوية (عادي، مهم، عاجل)',
        'دردشة فورية بين الضباط',
        'دردشة خاصة بالواجبات',
        'إرسال الملفات والصور',
        'أرشيف المحادثات',
      ]
    },
    {
      category: 'الأقسام المتخصصة',
      icon: Shield,
      items: [
        'قسم العمليات وإدارة الجهاز',
        'قسم المعابر والحدود',
        'قسم الشرطة السياحية',
        'قسم العمليات المشتركة',
        'قسم شرطة المرور',
        'قسم المباحث الجنائية',
        'قسم الشرطة الخاصة',
        'قسم الجرائم الإلكترونية',
        'قسم الشرطة القضائية',
      ]
    },
    {
      category: 'نظام التتبع والمراقبة',
      icon: MapPin,
      items: [
        'تتبع GPS للمستخدمين في الوقت الفعلي',
        'خرائط تفاعلية لمواقع المستخدمين',
        'تسجيل مواقع تسجيل الدخول',
        'عرض المواقع على خرائط Google Maps',
        'تتبع دقة الموقع GPS',
        'سجل كامل لتحركات المستخدمين',
      ]
    },
    {
      category: 'نظام الإشعارات المتطور',
      icon: AlertTriangle,
      items: [
        'إشعارات فورية للرسائل والمهام',
        'إشعارات محاولات الدخول المشبوهة',
        'إشعارات مخصصة لكل قسم',
        'إشعارات عامة للجميع',
        'تصنيف الإشعارات حسب الأولوية',
        'عداد الإشعارات غير المقروءة',
        'ربط الإشعارات بالإجراءات المباشرة',
      ]
    },
    {
      category: 'النسخ الاحتياطية والبيانات',
      icon: Database,
      items: [
        'نسخ احتياطية تلقائية للبيانات',
        'تصدير البيانات بصيغ مختلفة',
        'استعادة البيانات المحذوفة',
        'ضغط وتشفير البيانات',
        'تزامن البيانات عبر الأجهزة',
      ]
    }
  ];

  const securityFeatures = [
    {
      title: 'تشفير البيانات',
      desc: 'جميع البيانات مشفرة بمعايير AES-256',
      icon: Lock
    },
    {
      title: 'أمان المصادقة',
      desc: 'نظام مصادقة متعدد العوامل مع WebAuthn',
      icon: Fingerprint
    },
    {
      title: 'حماية قاعدة البيانات',
      desc: 'Row Level Security مع Supabase',
      icon: Database
    },
    {
      title: 'مراقبة الوصول',
      desc: 'تسجيل جميع عمليات الوصول والتعديل',
      icon: Eye
    },
    {
      title: 'نسخ احتياطية آمنة',
      desc: 'نسخ احتياطية مشفرة ومتعددة المواقع',
      icon: ShieldCheck
    }
  ];

  const architecture = [
    {
      layer: 'طبقة العرض',
      tech: 'React + TypeScript',
      desc: 'واجهة مستخدم تفاعلية ومتجاوبة'
    },
    {
      layer: 'طبقة الأعمال',
      tech: 'Custom Hooks + Context',
      desc: 'منطق الأعمال والحالة العامة'
    },
    {
      layer: 'طبقة البيانات',
      tech: 'Supabase + PostgreSQL',
      desc: 'قاعدة بيانات آمنة وموثوقة'
    },
    {
      layer: 'طبقة الأمان',
      tech: 'RLS + JWT + 2FA',
      desc: 'أمان متعدد الطبقات'
    }
  ];

  const recentUpdates = [
    {
      version: 'v2.5.0',
      date: 'أكتوبر 2025',
      items: [
        'تحسينات شاملة في الأداء والاستقرار',
        'إضافة المزيد من الميزات الأمنية',
        'تحسين نظام التواصل المشترك',
        'إصلاح الأخطاء وتحسين الواجهة',
      ]
    },
    {
      version: 'v2.1.0',
      date: 'ديسمبر 2024',
      items: [
        'إضافة نظام التواصل المشترك بين الأقسام',
        'تحسين نظام التعرف على الوجه',
        'إضافة تتبع GPS لتسجيل الدخول',
        'نظام التحقق من الموقع الجغرافي',
        'إشعارات فورية للرسائل والتنبيهات',
        'إضافة أقسام جديدة (المعابر، السياحة، العمليات المشتركة)',
        'تحسين واجهة المستخدم والأداء',
      ]
    },
    {
      version: 'v2.0.0',
      date: 'نوفمبر 2024',
      items: [
        'إعادة تصميم كامل للنظام',
        'إضافة نظام المصادقة الثنائية',
        'نظام الجرائم الإلكترونية المتقدم',
        'تحسين الأمان والأداء',
      ]
    },
    {
      version: 'v1.0.0',
      date: 'يناير 2024',
      items: [
        'إطلاق النسخة الأولى من النظام',
        'نظام تسجيل الدخول الأساسي',
        'إدارة البلاغات والحوادث',
        'نظام الأقسام المتخصصة',
      ]
    }
  ];

  const futureFeatures = [
    'نظام الذكاء الاصطناعي لتحليل البلاغات',
    'تطبيق محمول أصلي للـ iOS و Android',
    'نظام التعرف على الوجوه المتقدم بالذكاء الاصطناعي',
    'تحليلات البيانات والتقارير الذكية',
    'نظام إدارة المركبات والمعدات',
    'تكامل مع أنظمة الحكومة الإلكترونية',
    'نظام إدارة المحاكم والقضايا',
    'بوابة المواطنين للخدمات الرقمية',
    'نظام الأوامر الصوتية والمساعد الذكي',
    'تطبيق الواقع المعزز للدوريات',
  ];

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="font-arabic"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            {t('general.back')}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-arabic text-foreground">
              {t('about.title')}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-arabic">
            {t('about.subtitle')}
          </p>
        </div>
      </div>

      <div className="px-4 pb-32 space-y-6">
        {/* App Info Card */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
              alt="Logo" 
              className="w-12 h-12 rounded-lg"
            />
            <div>
              <h2 className="font-bold font-arabic text-lg">نظام الشرطة الفلسطينية</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">v2.5.0</Badge>
                <span>•</span>
                <span>أكتوبر 2025</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-arabic text-muted-foreground">{t('about.developed_by')}:</span>
              <span className="font-medium">Noor Khallaf</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-arabic text-muted-foreground">{t('about.development_start')}:</span>
              <span>يناير 2024</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-arabic text-muted-foreground">{t('about.last_update')}:</span>
              <span>أكتوبر 2025</span>
            </div>
          </div>
        </Card>

        {/* Overview */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="font-bold font-arabic text-lg">{t('about.overview_title')}</h3>
          </div>
          <p className="text-sm font-arabic text-muted-foreground leading-relaxed">
            {t('about.overview_desc')}
          </p>
        </Card>

        {/* Tech Stack */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="font-bold font-arabic text-lg">{t('about.tech_stack_title')}</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {techStack.map((tech, index) => {
              const Icon = tech.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                  <div className="p-1 bg-primary/20 rounded">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{tech.name}</h4>
                    <p className="text-xs text-muted-foreground font-arabic">{tech.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Features */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-primary" />
            <h3 className="font-bold font-arabic text-lg">{t('about.features_title')}</h3>
          </div>
          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="border border-border/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold font-arabic text-sm">{feature.category}</h4>
                  </div>
                  <ul className="space-y-1">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="font-arabic text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Security */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-bold font-arabic text-lg">{t('about.security_title')}</h3>
          </div>
          <div className="space-y-3">
            {securityFeatures.map((security, index) => {
              const Icon = security.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-2 bg-green-50/50 border border-green-200/50 rounded-lg">
                  <div className="p-1 bg-green-500/20 rounded">
                    <Icon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm font-arabic">{security.title}</h4>
                    <p className="text-xs text-muted-foreground font-arabic">{security.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Architecture */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-5 w-5 text-primary" />
            <h3 className="font-bold font-arabic text-lg">{t('about.architecture_title')}</h3>
          </div>
          <div className="space-y-3">
            {architecture.map((layer, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm font-arabic">{layer.layer}</h4>
                  <p className="text-xs text-blue-600">{layer.tech}</p>
                  <p className="text-xs text-muted-foreground font-arabic">{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Updates */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="font-bold font-arabic text-lg">أحدث التحديثات</h3>
          </div>
          <div className="space-y-4">
            {recentUpdates.map((update, index) => (
              <div key={index} className="border border-green-200/50 rounded-lg p-3 bg-green-50/30">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                    {update.version}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{update.date}</span>
                </div>
                <ul className="space-y-1">
                  {update.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="font-arabic text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Future Features */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-bold font-arabic text-lg">{t('about.future_title')}</h3>
          </div>
          <div className="space-y-2">
            {futureFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-gradient-to-r from-primary to-primary-glow rounded-full"></div>
                <span className="font-arabic text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="h-5 w-5 text-primary" />
            <h3 className="font-bold font-arabic text-lg">{t('about.contact_title')}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-primary/5 rounded-lg">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm">noor-khallaf@hotmail.com</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-primary/5 rounded-lg">
              <Github className="h-4 w-4 text-primary" />
              <span className="text-sm">github.com/noor-khallaf</span>
            </div>
          </div>
        </Card>

        {/* Credits */}
        <Card className="glass-card p-4 text-center">
          <div className="mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full mx-auto mb-3 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold font-arabic text-lg">نظام الشرطة الفلسطينية</h3>
            <p className="text-sm text-muted-foreground font-arabic">
              نظام متطور لخدمة الوطن والمواطن
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>© 2024-2025</span>
            <span>•</span>
            <span>جميع الحقوق محفوظة</span>
            <span>•</span>
            <span>فلسطين</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;