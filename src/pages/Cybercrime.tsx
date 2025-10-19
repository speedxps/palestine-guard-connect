import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  AlertTriangle, 
  ArrowLeft, 
  Search,
  User,
  Car,
  FileText,
  Globe,
  Phone,
  IdCard,
  Loader2,
  Eye,
  Clock,
  CheckCircle,
  Activity
} from 'lucide-react';

interface CybercrimeCase {
  id: string;
  case_number: string;
  title: string;
  description: string;
  case_type: string;
  priority: string;
  status: string;
  created_at: string;
  national_id?: string;
  contact_name?: string;
  contact_phone?: string;
}

interface CitizenData {
  id: string;
  national_id: string;
  full_name: string;
  phone?: string;
  address?: string;
  vehicles?: any[];
  violations?: any[];
  properties?: any[];
}

interface Investigation {
  id: string;
  case_id: string;
  ip_addresses: string[];
  notes: string;
  status: string;
  created_at: string;
}

const Cybercrime = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [cases, setCases] = useState<CybercrimeCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<CybercrimeCase | null>(null);
  const [citizenData, setCitizenData] = useState<CitizenData | null>(null);
  const [searchNationalId, setSearchNationalId] = useState('');
  const [searchIp, setSearchIp] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cybercrime_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل القضايا',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const searchCitizen = async () => {
    if (!searchNationalId) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال رقم الهوية',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSearching(true);
      
      // Get citizen data
      const { data: citizen, error: citizenError } = await supabase
        .from('citizens')
        .select(`
          *,
          citizen_vehicles:citizen_id(*),
          violations:citizen_id(*),
          citizen_properties:citizen_id(*)
        `)
        .eq('national_id', searchNationalId)
        .single();

      if (citizenError) throw citizenError;
      
      if (citizen) {
        setCitizenData({
          ...citizen,
          vehicles: citizen.citizen_vehicles || [],
          violations: citizen.violations || [],
          properties: citizen.citizen_properties || []
        });
        
        toast({
          title: 'نجح',
          description: 'تم العثور على بيانات المواطن',
        });
      }
    } catch (error) {
      console.error('Error searching citizen:', error);
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على المواطن',
        variant: 'destructive',
      });
      setCitizenData(null);
    } finally {
      setSearching(false);
    }
  };

  const updateCaseStatus = async (caseId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('cybercrime_cases')
        .update({ status })
        .eq('id', caseId);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم تحديث حالة القضية',
      });

      await fetchCases();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الحالة',
        variant: 'destructive',
      });
    }
  };

  const assignCaseToMe = async (caseId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('cybercrime_cases')
        .update({ 
          assigned_officer_id: profile.id,
          status: 'investigating'
        })
        .eq('id', caseId);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم تعيين القضية لك',
      });

      await fetchCases();
    } catch (error) {
      console.error('Error assigning case:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تعيين القضية',
        variant: 'destructive',
      });
    }
  };

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      if (filterStatus === 'all') return true;
      return c.status === filterStatus;
    });
  }, [cases, filterStatus]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'open': 'bg-red-500 text-white',
      'investigating': 'bg-blue-500 text-white',
      'resolved': 'bg-green-500 text-white',
      'closed': 'bg-gray-500 text-white'
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'critical': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5" dir="rtl">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-blue-200/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 font-arabic">
                    نظام إدارة التحقيقات - الجرائم الإلكترونية
                  </h1>
                  <p className="text-sm text-gray-600">Cybercrime Investigation System</p>
                </div>
              </div>
            </div>
            <Badge variant="destructive" className="text-xs">
              سري للغاية
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="cases">القضايا</TabsTrigger>
            <TabsTrigger value="investigation">التحقيق</TabsTrigger>
            <TabsTrigger value="tracking">التتبع</TabsTrigger>
          </TabsList>

          {/* Cases Tab */}
          <TabsContent value="cases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>إدارة القضايا</span>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="open">مفتوحة</SelectItem>
                      <SelectItem value="investigating">قيد التحقيق</SelectItem>
                      <SelectItem value="resolved">محلولة</SelectItem>
                      <SelectItem value="closed">مغلقة</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCases.map((case_) => (
                    <Card key={case_.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-mono">
                                {case_.case_number}
                              </Badge>
                              <Badge className={getPriorityColor(case_.priority)}>
                                {case_.priority === 'critical' ? 'عالية جداً' :
                                 case_.priority === 'high' ? 'عالية' :
                                 case_.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                              </Badge>
                              <Badge className={getStatusColor(case_.status)}>
                                {case_.status === 'open' ? 'مفتوحة' :
                                 case_.status === 'investigating' ? 'قيد التحقيق' :
                                 case_.status === 'resolved' ? 'محلولة' : 'مغلقة'}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {case_.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {case_.description}
                            </p>
                            {case_.contact_name && (
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {case_.contact_name}
                                </span>
                                {case_.contact_phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {case_.contact_phone}
                                  </span>
                                )}
                                {case_.national_id && (
                                  <span className="flex items-center gap-1">
                                    <IdCard className="h-3 w-3" />
                                    {case_.national_id}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(case_.created_at).toLocaleDateString('ar-EG')}
                          </div>
                          <div className="flex gap-2">
                            {case_.status === 'open' && (
                              <Button 
                                size="sm" 
                                onClick={() => assignCaseToMe(case_.id)}
                              >
                                تعيين لي
                              </Button>
                            )}
                            {case_.status === 'investigating' && (
                              <Select 
                                value={case_.status}
                                onValueChange={(value) => updateCaseStatus(case_.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="investigating">قيد التحقيق</SelectItem>
                                  <SelectItem value="resolved">محلولة</SelectItem>
                                  <SelectItem value="closed">مغلقة</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/cybercrime-advanced-case-detail?caseId=${case_.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredCases.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد قضايا
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investigation Tab */}
          <TabsContent value="investigation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Citizen Lookup */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IdCard className="h-5 w-5" />
                    البحث برقم الهوية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={searchNationalId}
                      onChange={(e) => setSearchNationalId(e.target.value)}
                      placeholder="رقم الهوية الوطنية"
                      onKeyPress={(e) => e.key === 'Enter' && searchCitizen()}
                    />
                    <Button 
                      onClick={searchCitizen}
                      disabled={searching}
                    >
                      {searching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {citizenData && (
                    <div className="space-y-3 pt-3 border-t">
                      <div>
                        <p className="text-xs text-gray-500">معلومات المواطن</p>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">{citizenData.full_name}</span>
                          </div>
                          {citizenData.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{citizenData.phone}</span>
                            </div>
                          )}
                          {citizenData.address && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              {citizenData.address}
                            </div>
                          )}
                        </div>
                      </div>

                      {citizenData.vehicles && citizenData.vehicles.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500 mb-2">المركبات</p>
                          {citizenData.vehicles.map((vehicle: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <Car className="h-4 w-4 text-blue-500" />
                              <span>{vehicle.license_plate || 'غير معروف'}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {citizenData.violations && citizenData.violations.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500">المخالفات: {citizenData.violations.length}</p>
                        </div>
                      )}

                      {citizenData.properties && citizenData.properties.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500">الممتلكات: {citizenData.properties.length}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* IP Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    تتبع عناوين IP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={searchIp}
                        onChange={(e) => setSearchIp(e.target.value)}
                        placeholder="عنوان IP"
                      />
                      <Button>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      أدخل عنوان IP للبحث عن القضايا والأنشطة المرتبطة
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  نظام التتبع المتقدم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>نظام التتبع المتقدم قيد التطوير</p>
                  <p className="text-sm mt-2">سيتم دمج أنظمة تتبع IP، المواقع، والبيانات الرقمية</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Cybercrime;
