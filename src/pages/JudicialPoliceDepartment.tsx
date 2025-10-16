import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/BackButton';
import { Scale, FileText, MessageSquare, TrendingUp, Shield, Ticket, MessageCircle, Newspaper } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const JudicialPoliceDepartment = () => {
  const navigate = useNavigate();
  const stats = useDashboardStats();

  const tools = [
    {
      title: 'إدارة القضايا القضائية',
      description: 'إنشاء ومتابعة القضايا وإرسالها للمحكمة أو النيابة',
      icon: Scale,
      path: '/judicial-case-management',
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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3 bg-card px-6 py-3 rounded-full shadow-lg border">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">الشرطة القضائية</h1>
          </div>
          <div />
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Scale className="h-12 w-12 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2">منصة الشرطة القضائية الإلكترونية</h2>
                <p className="text-muted-foreground">
                  نظام متكامل للتواصل الرقمي بين الشرطة والمحاكم والنيابة العامة. جميع المعاملات موقعة رقمياً ومشفرة لضمان الأمان والموثوقية.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Card
              key={tool.path}
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-primary/30"
              onClick={() => navigate(tool.path)}
            >
              <CardHeader>
                <div className={`inline-flex p-4 bg-gradient-to-br ${tool.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  <tool.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {tool.description}
                </p>
                {tool.stats && (
                  <p className="text-sm font-semibold text-primary mt-2">{tool.stats}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-semibold mb-1">تشفير متقدم</h3>
              <p className="text-sm text-muted-foreground">جميع الملفات والبيانات مشفرة</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">✍️</div>
              <h3 className="font-semibold mb-1">توقيع رقمي</h3>
              <p className="text-sm text-muted-foreground">كل عملية نقل موقعة رقمياً</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold mb-1">سجل كامل</h3>
              <p className="text-sm text-muted-foreground">تتبع جميع الأنشطة والعمليات</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JudicialPoliceDepartment;