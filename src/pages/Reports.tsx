import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, Download, BarChart3, Users, Car, AlertTriangle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { BackButton } from '@/components/BackButton';
import { useTickets } from '@/hooks/useTickets';

const Reports = () => {
  const { logTicket } = useTickets();
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const [
        { count: citizensCount },
        { count: vehiclesCount },
        { count: incidentsCount },
        { count: violationsCount },
        { count: cybercrimeCount }
      ] = await Promise.all([
        supabase.from('citizens').select('*', { count: 'exact', head: true }),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('incidents').select('*', { count: 'exact', head: true }),
        supabase.from('traffic_records').select('*', { count: 'exact', head: true }),
        supabase.from('cybercrime_reports').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        citizens: citizensCount || 0,
        vehicles: vehiclesCount || 0,
        incidents: incidentsCount || 0,
        violations: violationsCount || 0,
        cybercrime: cybercrimeCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateReport = async () => {
    if (!reportType) {
      toast.error('يرجى اختيار نوع التقرير');
      return;
    }

    setLoading(true);
    try {
      let query = supabase.from(getTableName(reportType)).select('*');
      
      if (dateRange.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange.to) {
        query = query.lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;

      setReportData(data);
      toast.success('تم إنشاء التقرير بنجاح');
      
      // Log ticket
      await logTicket({
        section: 'التقارير والإحصائيات',
        action_type: 'view',
        description: `إنشاء ${getReportTitle(reportType)}`,
        metadata: { reportType, recordCount: data?.length || 0 }
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('حدث خطأ في إنشاء التقرير');
    } finally {
      setLoading(false);
    }
  };

  const generateComprehensiveReport = async () => {
    setLoading(true);
    try {
      const [citizens, vehicles, incidents, violations, cybercrime] = await Promise.all([
        supabase.from('citizens').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('incidents').select('*'),
        supabase.from('traffic_records').select('*'),
        supabase.from('cybercrime_reports').select('*')
      ]);

      const comprehensiveData = {
        citizens: citizens.data || [],
        vehicles: vehicles.data || [],
        incidents: incidents.data || [],
        violations: violations.data || [],
        cybercrime: cybercrime.data || []
      };

      setReportData(comprehensiveData);
      toast.success('تم إنشاء التقرير الشامل بنجاح');
      
      // Log ticket
      await logTicket({
        section: 'التقارير والإحصائيات',
        action_type: 'view',
        description: 'إنشاء تقرير شامل لكل البيانات',
        metadata: { totalRecords: Object.values(comprehensiveData).reduce((sum: number, arr: any) => sum + (arr?.length || 0), 0) }
      });
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      toast.error('حدث خطأ في إنشاء التقرير الشامل');
    } finally {
      setLoading(false);
    }
  };

  const getTableName = (type: string) => {
    switch (type) {
      case 'citizens': return 'citizens';
      case 'vehicles': return 'vehicles';
      case 'incidents': return 'incidents';
      case 'violations': return 'traffic_records';
      case 'cybercrime': return 'cybercrime_reports';
      default: return 'citizens';
    }
  };

  const getReportTitle = (type: string) => {
    switch (type) {
      case 'citizens': return 'تقرير المواطنين';
      case 'vehicles': return 'تقرير المركبات';
      case 'incidents': return 'تقرير الحوادث';
      case 'violations': return 'تقرير المخالفات المرورية';
      case 'cybercrime': return 'تقرير الجرائم الإلكترونية';
      default: return 'تقرير';
    }
  };

  const exportToPDF = () => {
    // يمكن إضافة مكتبة PDF لتصدير التقارير
    toast.info('سيتم إضافة تصدير PDF قريباً');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">التقارير والإحصائيات</h1>
            <p className="text-muted-foreground">إنشاء تقارير شاملة لجميع بيانات النظام</p>
          </div>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stats.citizens}</p>
            <p className="text-sm text-muted-foreground">المواطنون</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Car className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats.vehicles}</p>
            <p className="text-sm text-muted-foreground">المركبات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{stats.incidents}</p>
            <p className="text-sm text-muted-foreground">الحوادث</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{stats.violations}</p>
            <p className="text-sm text-muted-foreground">المخالفات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{stats.cybercrime}</p>
            <p className="text-sm text-muted-foreground">الجرائم الإلكترونية</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* إعدادات التقرير */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>إعدادات التقرير</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">نوع التقرير</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع التقرير" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizens">المواطنون</SelectItem>
                  <SelectItem value="vehicles">المركبات</SelectItem>
                  <SelectItem value="incidents">الحوادث</SelectItem>
                  <SelectItem value="violations">المخالفات المرورية</SelectItem>
                  <SelectItem value="cybercrime">الجرائم الإلكترونية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">من تاريخ</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange({...dateRange, from: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">إلى تاريخ</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange({...dateRange, to: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={generateReport} disabled={loading} className="w-full">
              {loading ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
            </Button>

            <Button 
              onClick={generateComprehensiveReport} 
              disabled={loading} 
              variant="outline" 
              className="w-full"
            >
              تقرير شامل لكل البيانات
            </Button>
          </CardContent>
        </Card>

        {/* عرض التقرير */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {reportType ? getReportTitle(reportType) : 'التقرير'}
            </CardTitle>
            {reportData && (
              <Button onClick={exportToPDF} size="sm">
                <Download className="h-4 w-4 mr-2" />
                تصدير PDF
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {reportData ? (
              <div className="space-y-4">
                {Array.isArray(reportData) ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      إجمالي السجلات: {reportData.length}
                    </p>
                    <div className="max-h-96 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            {reportData.length > 0 && Object.keys(reportData[0]).slice(0, 4).map((key) => (
                              <th key={key} className="p-2 text-right">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.slice(0, 50).map((item, index) => (
                            <tr key={index} className="border-b">
                              {Object.values(item).slice(0, 4).map((value: any, i) => (
                                <td key={i} className="p-2">{String(value)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">التقرير الشامل</p>
                    {Object.entries(reportData).map(([key, value]: [string, any]) => (
                      <div key={key} className="mb-4">
                        <h3 className="font-semibold mb-2">{getReportTitle(key)}</h3>
                        <p className="text-sm text-muted-foreground">
                          عدد السجلات: {Array.isArray(value) ? value.length : 0}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                اختر نوع التقرير واضغط على "إنشاء التقرير" لعرض البيانات
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;