import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Settings, 
  Plus, 
  Users, 
  Eye,
  ShieldCheck
} from 'lucide-react';

export const CIDSection = () => {
  const navigate = useNavigate();

  const cidPages = [
    {
      title: 'البلاغات',
      description: 'عرض ومتابعة البلاغات الجنائية',
      path: '/incidents',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'إدارة البلاغات',
      description: 'مراجعة وتتبع البلاغات',
      path: '/incidents-management',
      icon: Settings,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'بلاغ جديد',
      description: 'إنشاء بلاغ جديد في النظام',
      path: '/new-incident',
      icon: Plus,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'المطلوبون',
      description: 'إدارة قائمة المطلوبين أمنياً',
      path: '/wanted-persons-tree',
      icon: Users,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'التعرف على الوجوه',
      description: 'نظام التعرف على الوجوه',
      path: '/face-recognition',
      icon: Eye,
      color: 'from-blue-500 to-blue-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-arabic">المباحث الجنائية</h2>
          <p className="text-muted-foreground font-arabic">إدارة البلاغات والتحقيقات الجنائية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cidPages.map((page) => {
          const Icon = page.icon;
          return (
            <Card key={page.path} className="p-6 hover:shadow-lg transition-shadow">
              <Button
                variant="ghost"
                className="w-full h-auto p-0 flex flex-col items-center gap-4 hover:bg-transparent"
                onClick={() => navigate(page.path)}
              >
                <div className={`p-4 rounded-xl bg-gradient-to-r ${page.color} shadow-lg`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold font-arabic">{page.title}</h3>
                  <p className="text-sm text-muted-foreground font-arabic leading-relaxed">
                    {page.description}
                  </p>
                </div>
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};