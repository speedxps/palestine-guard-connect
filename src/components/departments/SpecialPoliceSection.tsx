import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckSquare, 
  Users, 
  Rss, 
  MessageCircle,
  Shield
} from 'lucide-react';

export const SpecialPoliceSection = () => {
  const navigate = useNavigate();

  const specialPolicePages = [
    {
      title: 'المهام',
      description: 'إدارة ومتابعة المهام الخاصة',
      path: '/tasks',
      icon: CheckSquare,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'الدوريات',
      description: 'تنسيق وإدارة الدوريات',
      path: '/patrol',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'التغذية',
      description: 'متابعة التحديثات والأخبار',
      path: '/feed',
      icon: Rss,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'المحادثات',
      description: 'نظام التواصل والمحادثات',
      path: '/chat',
      icon: MessageCircle,
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-arabic">الشرطة الخاصة</h2>
          <p className="text-muted-foreground font-arabic">إدارة المهام والدوريات الخاصة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {specialPolicePages.map((page) => {
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