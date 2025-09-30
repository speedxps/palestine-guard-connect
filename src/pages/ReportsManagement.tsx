import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Calendar as CalendarIcon, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { generateMonthlyReport } from '@/services/pdfReportService';
import { cn } from '@/lib/utils';
import BackButton from '@/components/BackButton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsManagement() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>('monthly');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [generating, setGenerating] = useState(false);

  // Fetch statistics
  const { data: statistics, isLoading } = useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: async () => {
      const [incidents, patrols, tasks, violations] = await Promise.all([
        supabase.from('incidents').select('*', { count: 'exact' }),
        supabase.from('patrols').select('*', { count: 'exact' }),
        supabase.from('tasks').select('*', { count: 'exact' }),
        supabase.from('vehicle_violations').select('*', { count: 'exact' }),
      ]);

      return {
        totalIncidents: incidents.count || 0,
        totalPatrols: patrols.count || 0,
        totalTasks: tasks.count || 0,
        totalViolations: violations.count || 0,
        incidents: incidents.data || [],
        patrols: patrols.data || [],
        tasks: tasks.data || [],
        violations: violations.data || [],
      };
    },
  });

  // Fetch saved reports
  const { data: savedReports } = useQuery({
    queryKey: ['saved-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*, profiles(full_name)')
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const handleGenerateReport = async () => {
    if (!dateFrom || !dateTo) {
      toast({
        title: 'خطأ',
        description: 'الرجاء اختيار نطاق التاريخ',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      // Fetch data for the selected date range
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .single();

      // Generate PDF
      const pdfBlob = await generateMonthlyReport(
        format(dateFrom, 'MM'),
        format(dateFrom, 'yyyy'),
        statistics
      );

      // Save report to database
      const { error: insertError } = await supabase.from('reports').insert({
        title: `تقرير ${reportType} - ${format(dateFrom, 'PP', { locale: ar })} إلى ${format(dateTo, 'PP', { locale: ar })}`,
        report_type: reportType,
        generated_by: profile?.id,
        date_from: format(dateFrom, 'yyyy-MM-dd'),
        date_to: format(dateTo, 'yyyy-MM-dd'),
        report_data: statistics,
      });

      if (insertError) throw insertError;

      // Download PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${format(dateFrom, 'yyyy-MM-dd')}-${format(dateTo, 'yyyy-MM-dd')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'تم إنشاء التقرير',
        description: 'تم حفظ وتنزيل التقرير بنجاح',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء التقرير',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  // Prepare chart data
  const incidentsByType = statistics?.incidents.reduce((acc: any, incident: any) => {
    acc[incident.incident_type] = (acc[incident.incident_type] || 0) + 1;
    return acc;
  }, {});

  const chartData = incidentsByType ? Object.keys(incidentsByType).map(key => ({
    name: key,
    value: incidentsByType[key]
  })) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                📊 نظام التقارير الاحترافي
              </h1>
              <p className="text-muted-foreground mt-2">
                إنشاء وإدارة التقارير الشهرية والسنوية مع إحصائيات مفصلة
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                إجمالي الحوادث
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{statistics?.totalIncidents || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                الدوريات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{statistics?.totalPatrols || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-500" />
                المهام المعلقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{statistics?.totalTasks || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PieChart className="h-4 w-4 text-purple-500" />
                المخالفات المرورية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{statistics?.totalViolations || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الحوادث حسب النوع</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>نسب الحوادث</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Report Generator */}
        <Card>
          <CardHeader>
            <CardTitle>إنشاء تقرير جديد</CardTitle>
            <CardDescription>اختر نوع التقرير والفترة الزمنية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">نوع التقرير</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">تقرير شهري</SelectItem>
                    <SelectItem value="annual">تقرير سنوي</SelectItem>
                    <SelectItem value="custom">تقرير مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">من تاريخ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left", !dateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">إلى تاريخ</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left", !dateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button onClick={handleGenerateReport} disabled={generating} className="w-full" size="lg">
              <Download className="mr-2 h-4 w-4" />
              {generating ? 'جاري الإنشاء...' : 'إنشاء وتنزيل التقرير PDF'}
            </Button>
          </CardContent>
        </Card>

        {/* Saved Reports */}
        <Card>
          <CardHeader>
            <CardTitle>التقارير المحفوظة</CardTitle>
            <CardDescription>آخر 10 تقارير تم إنشاؤها</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedReports?.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(report.generated_at), 'PPP', { locale: ar })} • {(report.profiles as any)?.full_name}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {!savedReports?.length && (
                <p className="text-center text-muted-foreground py-8">لا توجد تقارير محفوظة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
