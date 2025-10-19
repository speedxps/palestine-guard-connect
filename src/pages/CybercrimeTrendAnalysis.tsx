import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useCybercrimeCases } from '@/hooks/useCybercrimeCases';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CybercrimeTrendAnalysis = () => {
  const navigate = useNavigate();
  const { cases } = useCybercrimeCases();

  // تحليل الاتجاهات الشهرية
  const monthlyTrends = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      // محاكاة البيانات الشهرية
      const monthCases = cases.filter(c => {
        const caseMonth = new Date(c.created_at).getMonth();
        return caseMonth === index;
      });

      return {
        month,
        cases: monthCases.length,
        resolved: monthCases.filter(c => c.status === 'resolved').length,
        investigating: monthCases.filter(c => c.status === 'investigating').length,
        trend: monthCases.length
      };
    });
  }, [cases]);

  // تحليل أنواع الجرائم
  const crimeTypeAnalysis = useMemo(() => {
    const typeMap: Record<string, string> = {
      'phishing': 'ابتزاز إلكتروني',
      'fraud': 'احتيال مالي',
      'hacking': 'اختراق أنظمة',
      'cyberbullying': 'تهديد إلكتروني',
      'identity_theft': 'سرقة هوية',
      'malware': 'برمجيات خبيثة',
    };

    const typeCounts: Record<string, number> = {};
    cases.forEach(c => {
      const arabicType = typeMap[c.case_type] || c.case_type;
      typeCounts[arabicType] = (typeCounts[arabicType] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count
    })).sort((a, b) => b.count - a.count);
  }, [cases]);

  // حساب معدل النمو
  const growthRate = useMemo(() => {
    const currentMonth = monthlyTrends[monthlyTrends.length - 1]?.cases || 0;
    const previousMonth = monthlyTrends[monthlyTrends.length - 2]?.cases || 0;
    
    if (previousMonth === 0) return 0;
    return Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
  }, [monthlyTrends]);

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
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-arabic">
                  تحليل الاتجاهات
                </h1>
                <p className="text-sm text-gray-600">تحليل إحصائي شامل للجرائم الإلكترونية</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي القضايا</p>
                  <p className="text-3xl font-bold text-blue-600">{cases.length}</p>
                </div>
                <Activity className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">معدل النمو الشهري</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-3xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(growthRate)}%
                    </p>
                    {growthRate >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">النوع الأكثر شيوعاً</p>
                  <p className="text-lg font-bold text-purple-600">
                    {crimeTypeAnalysis[0]?.type || 'لا يوجد'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {crimeTypeAnalysis[0]?.count || 0} قضية
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends Chart */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-arabic">الاتجاه الشهري للقضايا</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="cases" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  name="إجمالي القضايا"
                />
                <Area 
                  type="monotone" 
                  dataKey="resolved" 
                  stackId="2" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="محلولة"
                />
                <Area 
                  type="monotone" 
                  dataKey="investigating" 
                  stackId="3" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  fillOpacity={0.6}
                  name="قيد التحقيق"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Crime Type Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-arabic">توزيع أنواع الجرائم</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={crimeTypeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="عدد القضايا" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-arabic">رؤى تحليلية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">الاتجاه العام</h4>
              <p className="text-sm text-blue-700">
                {growthRate > 10 && 'هناك زيادة ملحوظة في عدد القضايا هذا الشهر. يُنصح بزيادة الموارد المخصصة.'}
                {growthRate > 0 && growthRate <= 10 && 'هناك زيادة طفيفة في عدد القضايا. الوضع تحت السيطرة.'}
                {growthRate === 0 && 'عدد القضايا مستقر مقارنة بالشهر الماضي.'}
                {growthRate < 0 && 'هناك انخفاض في عدد القضايا. هذا مؤشر إيجابي!'}
              </p>
            </div>

            {crimeTypeAnalysis.length > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">النوع الأكثر شيوعاً</h4>
                <p className="text-sm text-purple-700">
                  {crimeTypeAnalysis[0].type} هو النوع الأكثر شيوعاً بـ {crimeTypeAnalysis[0].count} قضية. 
                  يُنصح بتخصيص موارد إضافية للتعامل مع هذا النوع من الجرائم.
                </p>
              </div>
            )}

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">التوصيات</h4>
              <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                <li>مواصلة مراقبة الاتجاهات الشهرية</li>
                <li>تعزيز التدريب على الأنواع الأكثر شيوعاً</li>
                <li>تحسين آليات الكشف المبكر</li>
                <li>تبادل المعلومات مع الجهات الأمنية الأخرى</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CybercrimeTrendAnalysis;
