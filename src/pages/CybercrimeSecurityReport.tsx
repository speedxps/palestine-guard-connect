import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { useCybercrimeCases } from '@/hooks/useCybercrimeCases';
import { useSuspiciousLogins } from '@/hooks/useSuspiciousLogins';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const CybercrimeSecurityReport = () => {
  const navigate = useNavigate();
  const { cases, stats } = useCybercrimeCases();
  const { suspiciousLogins } = useSuspiciousLogins();

  const [securityScore, setSecurityScore] = useState(0);

  useEffect(() => {
    // حساب درجة الأمان بناءً على الإحصائيات
    const activeCases = stats?.activeCases || 0;
    const resolutionRate = stats?.resolutionRate || 0;
    const suspiciousAttempts = suspiciousLogins.filter(l => l.status === 'pending').length;

    let score = 100;
    score -= activeCases * 2; // كل قضية نشطة تقلل 2 نقطة
    score -= suspiciousAttempts * 5; // كل محاولة مشبوهة تقلل 5 نقاط
    score += resolutionRate * 0.2; // معدل الحل يزيد النقاط

    setSecurityScore(Math.max(0, Math.min(100, score)));
  }, [stats, suspiciousLogins]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'ممتاز';
    if (score >= 60) return 'جيد';
    if (score >= 40) return 'متوسط';
    return 'يحتاج تحسين';
  };

  const threatLevelData = [
    { name: 'عالي جداً', value: cases.filter(c => c.priority === 'critical').length, color: '#ef4444' },
    { name: 'عالي', value: cases.filter(c => c.priority === 'high').length, color: '#f97316' },
    { name: 'متوسط', value: cases.filter(c => c.priority === 'medium').length, color: '#eab308' },
    { name: 'منخفض', value: cases.filter(c => c.priority === 'low').length, color: '#22c55e' },
  ];

  const statusData = [
    { name: 'قيد التحقيق', value: cases.filter(c => c.status === 'investigating').length },
    { name: 'محلولة', value: cases.filter(c => c.status === 'resolved').length },
    { name: 'مفتوحة', value: cases.filter(c => c.status === 'open').length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-blue-200/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/cybercrime-advanced')}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-arabic">
                  تقرير الأمن السيبراني
                </h1>
                <p className="text-sm text-gray-600">تقييم شامل لحالة الأمان</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Security Score */}
        <Card className="bg-white/80 backdrop-blur-sm border-2">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 border-4 border-blue-200 mb-4">
              <div className="text-center">
                <p className={`text-4xl font-bold ${getScoreColor(securityScore)}`}>
                  {Math.round(securityScore)}
                </p>
                <p className="text-xs text-gray-600">نقطة</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              درجة الأمان: {getScoreStatus(securityScore)}
            </h2>
            <p className="text-gray-600">
              تقييم شامل لحالة الأمن السيبراني في النظام
            </p>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">القضايا النشطة</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.activeCases || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">محاولات مشبوهة</p>
                  <p className="text-2xl font-bold text-red-600">
                    {suspiciousLogins.filter(l => l.status === 'pending').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">معدل الحل</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.resolutionRate || 0}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">متوسط وقت الحل</p>
                  <p className="text-2xl font-bold text-purple-600">48</p>
                  <p className="text-xs text-gray-500">ساعة</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-arabic">مستوى التهديدات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={threatLevelData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                  >
                    {threatLevelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {threatLevelData.map((type, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-gray-600">{type.name}: {type.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-arabic">حالة القضايا</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Security Recommendations */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-arabic">توصيات الأمان</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suspiciousLogins.filter(l => l.status === 'pending').length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">
                    توجد {suspiciousLogins.filter(l => l.status === 'pending').length} محاولة دخول مشبوهة
                  </p>
                  <p className="text-sm text-red-700">
                    يجب التحقق من جميع محاولات الدخول المشبوهة فوراً
                  </p>
                </div>
              </div>
            )}

            {stats && stats.activeCases > 10 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900">
                    عدد كبير من القضايا النشطة
                  </p>
                  <p className="text-sm text-yellow-700">
                    يُنصح بتوزيع القضايا على فريق أكبر لتسريع الحل
                  </p>
                </div>
              </div>
            )}

            {stats && stats.resolutionRate >= 80 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900">
                    معدل حل ممتاز
                  </p>
                  <p className="text-sm text-green-700">
                    الفريق يعمل بكفاءة عالية في حل القضايا
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CybercrimeSecurityReport;
