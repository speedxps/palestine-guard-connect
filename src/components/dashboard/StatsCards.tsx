import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, 
  Car, 
  AlertTriangle, 
  CheckSquare,
  Shield,
  FileText,
  TrendingUp
} from 'lucide-react';

const StatsCards = () => {
  const { user } = useAuth();
  const stats = useDashboardStats();
  const userRole = user?.role;

  if (stats.isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 sm:p-6 animate-pulse bg-white border border-gray-200 rounded-lg sm:rounded-xl">
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 mb-3 sm:mb-4"></div>
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  const getStatsForRole = () => {
    switch (userRole) {
      case 'admin':
        return [
          {
            title: 'إجمالي المستخدمين',
            value: `${stats.totalUsers}+`,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-500/10',
            change: '+12% من الشهر الماضي'
          },
          {
            title: 'المخالفات المفتوحة',
            value: `${stats.openViolations}+`,
            icon: Car,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-500/10',
            change: 'يتطلب متابعة'
          },
          {
            title: 'البلاغات المفتوحة',
            value: `${stats.openIncidents}+`,
            icon: AlertTriangle,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-500/10',
            change: 'قيد التحقيق'
          },
          {
            title: 'المهام المعلقة',
            value: `${stats.pendingTasks}+`,
            icon: CheckSquare,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-500/10',
            change: 'تحتاج اهتمام'
          }
        ];
      
      case 'traffic_police':
        return [
          {
            title: 'إجمالي المخالفات',
            value: `${stats.totalViolations}+`,
            icon: Car,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-500/10',
            change: 'هذا الشهر'
          },
          {
            title: 'المخالفات المفتوحة',
            value: `${stats.openViolations}+`,
            icon: FileText,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-500/10',
            change: 'تحتاج معالجة'
          }
        ];
      
      case 'cid':
        return [
          {
            title: 'إجمالي البلاغات',
            value: `${stats.totalIncidents}+`,
            icon: AlertTriangle,
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-500/10',
            change: 'هذا الشهر'
          },
          {
            title: 'البلاغات المفتوحة',
            value: `${stats.openIncidents}+`,
            icon: Shield,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-500/10',
            change: 'قيد التحقيق'
          }
        ];
      
      case 'special_police':
        return [
          {
            title: 'إجمالي المهام',
            value: `${stats.totalTasks}+`,
            icon: CheckSquare,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-500/10',
            change: 'هذا الشهر'
          },
          {
            title: 'المهام المعلقة',
            value: `${stats.pendingTasks}+`,
            icon: TrendingUp,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-indigo-500/10',
            change: 'تحتاج اهتمام'
          }
        ];
      
      case 'cybercrime':
        return [
          {
            title: 'تقارير الجرائم الإلكترونية',
            value: `${stats.totalReports}+`,
            icon: Shield,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-indigo-500/10',
            change: 'هذا الشهر'
          }
        ];
      
      default:
        return [
          {
            title: 'مرحباً بك',
            value: 'نظام الشرطة',
            icon: Shield,
            color: 'from-primary to-primary-glow',
            bgColor: 'bg-primary/10',
            change: 'اهلاً وسهلاً'
          }
        ];
    }
  };

  const statsCards = getStatsForRole();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 bg-white border border-gray-200 rounded-lg sm:rounded-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 font-arabic">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                  {stat.value}
                </p>
                <Badge variant="secondary" className="text-xs font-arabic bg-gray-100 text-gray-700 w-fit">
                  {stat.change}
                </Badge>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.color} shadow-lg flex-shrink-0`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;