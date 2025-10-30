import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/BackButton';
import { Scale, FileText, MessageSquare, TrendingUp, Shield, Ticket, MessageCircle, Newspaper, FolderOpen } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const JudicialPoliceDepartment = () => {
  const navigate = useNavigate();
  const stats = useDashboardStats();

  const tools = [
    {
      title: 'المهام المطلوبة',
      description: 'المهام الموكلة للقسم من الإدارة العامة',
      icon: FileText,
      path: '/department-tasks',
      color: 'from-yellow-500 to-yellow-600',
      highlighted: true
    },
    {
      title: 'البحث عن القضايا',
      description: 'البحث عن القضايا وإنشاء قضايا جديدة',
      icon: Scale,
      path: '/department/judicial-police/case-search',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'التواصل الرسمي',
      description: 'التواصل مع المحاكم والنيابة العامة',
      icon: MessageSquare,
      path: '/judicial-communications',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'تتبع القضايا',
      description: 'متابعة حالة القضايا المحالة',
      icon: TrendingUp,
      path: '/judicial-tracking',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'إدارة مستخدمي القسم',
      description: 'إضافة وإدارة مستخدمي الشرطة القضائية',
      icon: Shield,
      path: '/department/judicial-police/users',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'الأخبار الداخلية',
      description: 'آخر الأخبار والتحديثات',
      icon: Newspaper,
      path: '/internal-news',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'المحادثات',
      description: 'التواصل مع الفريق',
      icon: MessageCircle,
      path: '/chat',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'السجل',
      description: 'آخر الإجراءات والتعديلات',
      icon: Ticket,
      path: '/tickets',
      color: 'from-amber-500 to-amber-600',
      stats: `${stats.judicialPoliceTickets} Tickets`
    },
    {
      title: 'إدارة القضايا القضائية',
      description: 'إدارة ملفات القضايا والمعاملات القضائية',
      icon: FolderOpen,
      path: '/judicial-case-management',
      color: 'from-violet-500 to-violet-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <BackButton />
          <div className="flex items-center gap-2 sm:gap-3 bg-card px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg border">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">الشرطة القضائية</h1>
          </div>
          <div className="hidden sm:block" />
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <Scale className="h-10 w-10 sm:h-12 sm:w-12 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold mb-2">منصة الشرطة القضائية الإلكترونية</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  نظام متكامل للتواصل الرقمي بين الشرطة والمحاكم والنيابة العامة. جميع المعاملات موقعة رقمياً ومشفرة لضمان الأمان والموثوقية.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {tools.map((tool) => (
            <Card
              key={tool.path}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
              onClick={() => navigate(tool.path)}
            >
              <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-[120px] sm:min-h-[140px]">
                <tool.icon className="h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 text-primary flex-shrink-0" />
                <p className="text-sm sm:text-base font-semibold text-center line-clamp-2">{tool.title}</p>
                {tool.stats && <p className="text-xs text-muted-foreground mt-1">{tool.stats}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🔒</div>
              <h3 className="text-sm sm:text-base font-semibold mb-1">تشفير متقدم</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">جميع الملفات والبيانات مشفرة</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">✍️</div>
              <h3 className="text-sm sm:text-base font-semibold mb-1">توقيع رقمي</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">كل عملية نقل موقعة رقمياً</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📋</div>
              <h3 className="text-sm sm:text-base font-semibold mb-1">سجل كامل</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">تتبع جميع الأنشطة والعمليات</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JudicialPoliceDepartment;