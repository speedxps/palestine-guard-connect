import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  CheckSquare, 
  Users, 
  Rss, 
  MessageCircle,
  Clock,
  TrendingUp,
  Target,
  Ticket,
  Newspaper
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const SpecialPoliceSection = () => {
  const navigate = useNavigate();
  const stats = useDashboardStats();

  const sections = [
    {
      title: 'المهام',
      description: 'إدارة ومتابعة المهام الخاصة',
      icon: CheckSquare,
      path: '/tasks',
      color: 'from-purple-500 to-purple-600',
      stats: '18 نشط'
    },
    {
      title: 'الدوريات',
      description: 'دوريات الشرطة الخاصة',
      icon: Users,
      path: '/patrol',
      color: 'from-green-500 to-green-600',
      stats: '8 دورية'
    },
    {
      title: 'التغذية',
      description: 'آخر التحديثات والأخبار',
      icon: Rss,
      path: '/feed',
      color: 'from-blue-500 to-blue-600',
      stats: '24 جديد'
    },
    {
      title: 'الأخبار الداخلية',
      description: 'آخر الأخبار والتحديثات',
      icon: Newspaper,
      path: '/internal-news',
      color: 'from-cyan-500 to-cyan-600',
      stats: 'جديد'
    },
    {
      title: 'المحادثات',
      description: 'التواصل مع الفريق',
      icon: MessageCircle,
      path: '/chat',
      color: 'from-indigo-500 to-indigo-600',
      stats: '5 رسائل'
    },
    {
      title: 'السجل',
      description: 'آخر الإجراءات والتعديلات',
      icon: Ticket,
      path: '/tickets',
      color: 'from-amber-500 to-amber-600',
      stats: `${stats.specialPoliceTickets} Tickets`
    }
  ];

  const quickStats = [
    { label: 'المهام النشطة', value: '18', icon: CheckSquare, trend: '+12%' },
    { label: 'الدوريات', value: '8', icon: Users, trend: '+3%' },
    { label: 'المهام المكتملة', value: '45', icon: Target, trend: '+25%' },
    { label: 'الرسائل الجديدة', value: '5', icon: MessageCircle, trend: '+2' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-arabic">الشرطة الخاصة</h1>
          <p className="text-muted-foreground font-arabic">المهام الخاصة والدوريات الأمنية</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-arabic">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Icon className="h-5 w-5 text-primary" />
                    <Badge variant="default" className="text-xs">
                      {stat.trend}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Service Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card 
              key={section.path}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => navigate(section.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${section.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {section.stats && (
                    <Badge variant="secondary" className="font-arabic">
                      {section.stats}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg font-arabic">{section.title}</h3>
                  <p className="text-sm text-muted-foreground font-arabic">
                    {section.description}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full font-arabic"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(section.path);
                  }}
                >
                  الدخول للقسم
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SpecialPoliceSection;