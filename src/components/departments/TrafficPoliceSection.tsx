import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Car, 
  Users, 
  Settings,
  Shield
} from 'lucide-react';

export const TrafficPoliceSection = () => {
  const navigate = useNavigate();

  const trafficPages = [
    {
      title: 'المخالفات',
      description: 'عرض وإدارة المخالفات المرورية',
      path: '/violations',
      icon: FileText,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'إدارة المخالفات',
      description: 'تحرير ومراجعة المخالفات',
      path: '/violations-admin',
      icon: Settings,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'البحث عن مركبة',
      description: 'استعلام وإدارة بيانات المركبات',
      path: '/vehicle-lookup',
      icon: Car,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'الدوريات',
      description: 'إدارة وتنسيق الدوريات',
      path: '/patrol',
      icon: Users,
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-arabic">شرطة المرور</h2>
          <p className="text-muted-foreground font-arabic">إدارة المخالفات والمركبات والدوريات المرورية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trafficPages.map((page) => {
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