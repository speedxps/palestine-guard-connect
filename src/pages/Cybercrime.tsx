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
  first_name?: string;
  second_name?: string;
  third_name?: string;
  family_name?: string;
  father_name?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  vehicles?: any[];
  violations?: any[];
  properties?: any[];
  cybercrimeCases?: any[];
  judicialCases?: any[];
  incidents?: any[];
  familyMembers?: any[];
}

interface IPLocationData {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  asname?: string;
  mobile?: boolean;
  proxy?: boolean;
  hosting?: boolean;
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
  const [ipLocationData, setIpLocationData] = useState<IPLocationData | null>(null);
  const [ipRelatedCases, setIpRelatedCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchingIp, setSearchingIp] = useState(false);
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
      
      // Get citizen data with all related information
      const { data: citizen, error: citizenError } = await supabase
        .from('citizens')
        .select('*')
        .eq('national_id', searchNationalId)
        .single();

      if (citizenError) throw citizenError;
      
      if (citizen) {
        // Get all related data in parallel
        const vehiclesQuery = supabase.from('citizen_vehicles' as any).select('*').eq('citizen_id', citizen.id);
        const violationsQuery = supabase.from('violations' as any).select('*').eq('citizen_id', citizen.id);
        const propertiesQuery = supabase.from('citizen_properties').select('*').eq('citizen_id', citizen.id);
        const cybercrimeQuery = supabase.from('cybercrime_cases').select('*').eq('national_id', searchNationalId);
        const judicialQuery = supabase.from('judicial_cases').select('*').eq('national_id', searchNationalId);
        const familyQuery = supabase.from('citizens').select('*').or(`father_name.eq.${citizen.father_name},family_name.eq.${citizen.family_name}`).neq('id', citizen.id);

        const [
          { data: vehicles },
          { data: violations },
          { data: properties },
          { data: cybercrimeCases },
          { data: judicialCases },
          { data: familyMembers }
        ] = await Promise.all([
          vehiclesQuery,
          violationsQuery,
          propertiesQuery,
          cybercrimeQuery,
          judicialQuery,
          familyQuery
        ]);

        
        setCitizenData({
          ...citizen,
          vehicles: vehicles || [],
          violations: violations || [],
          properties: properties || [],
          cybercrimeCases: cybercrimeCases || [],
          judicialCases: judicialCases || [],
          incidents: [],
          familyMembers: familyMembers || []
        });
        
        toast({
          title: 'نجح',
          description: 'تم العثور على بيانات المواطن الكاملة',
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

  const searchIpAddress = async () => {
    if (!searchIp) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال عنوان IP',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSearchingIp(true);
      
      // Use free IP geolocation API
      const response = await fetch(`https://ipapi.co/${searchIp}/json/`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'فشل في تحديد موقع IP');
      }

      setIpLocationData(data);

      // Search for cases with this IP in investigations table
      const { data: investigations } = await supabase
        .from('investigations')
        .select('*, cybercrime_cases(*)')
        .contains('ip_addresses', [searchIp]);

      setIpRelatedCases(investigations || []);
      
      toast({
        title: 'نجح',
        description: 'تم تحديد موقع عنوان IP بنجاح',
      });
    } catch (error: any) {
      console.error('Error searching IP:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في البحث عن عنوان IP',
        variant: 'destructive',
      });
      setIpLocationData(null);
      setIpRelatedCases([]);
    } finally {
      setSearchingIp(false);
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
                    <div className="space-y-4 pt-3 border-t max-h-[600px] overflow-y-auto">
                      {/* Basic Info */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-900 mb-2">المعلومات الأساسية</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">{citizenData.full_name}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="font-semibold">الاسم الأول:</span> {citizenData.first_name}</div>
                            <div><span className="font-semibold">اسم الأب:</span> {citizenData.father_name}</div>
                            <div><span className="font-semibold">اسم الجد:</span> {citizenData.third_name}</div>
                            <div><span className="font-semibold">العائلة:</span> {citizenData.family_name}</div>
                            {citizenData.date_of_birth && <div><span className="font-semibold">تاريخ الميلاد:</span> {new Date(citizenData.date_of_birth).toLocaleDateString('ar-EG')}</div>}
                            {citizenData.gender && <div><span className="font-semibold">الجنس:</span> {citizenData.gender}</div>}
                          </div>
                          {citizenData.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">{citizenData.phone}</span>
                            </div>
                          )}
                          {citizenData.address && (
                            <div className="text-sm text-gray-600">
                              <span className="font-semibold">العنوان:</span> {citizenData.address}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Family Members */}
                      {citizenData.familyMembers && citizenData.familyMembers.length > 0 && (
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-purple-900 mb-2">أفراد العائلة ({citizenData.familyMembers.length})</p>
                          <div className="space-y-2">
                            {citizenData.familyMembers.slice(0, 3).map((member: any, idx: number) => (
                              <div key={idx} className="text-sm bg-white p-2 rounded border border-purple-200">
                                <div className="font-medium">{member.full_name}</div>
                                <div className="text-xs text-gray-600">الهوية: {member.national_id}</div>
                              </div>
                            ))}
                            {citizenData.familyMembers.length > 3 && (
                              <div className="text-xs text-purple-700">+ {citizenData.familyMembers.length - 3} آخرين</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Vehicles */}
                      {citizenData.vehicles && citizenData.vehicles.length > 0 && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-green-900 mb-2">المركبات ({citizenData.vehicles.length})</p>
                          <div className="space-y-1">
                            {citizenData.vehicles.map((vehicle: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Car className="h-4 w-4 text-green-600" />
                                <span>{vehicle.license_plate || 'غير معروف'} - {vehicle.vehicle_type || ''}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Violations */}
                      {citizenData.violations && citizenData.violations.length > 0 && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-orange-900 mb-2">المخالفات ({citizenData.violations.length})</p>
                          <div className="space-y-1">
                            {citizenData.violations.slice(0, 3).map((violation: any, idx: number) => (
                              <div key={idx} className="text-xs bg-white p-2 rounded border border-orange-200">
                                <div>{violation.violation_type}</div>
                                <div className="text-gray-600">{new Date(violation.created_at).toLocaleDateString('ar-EG')}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Properties */}
                      {citizenData.properties && citizenData.properties.length > 0 && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-yellow-900 mb-2">الممتلكات ({citizenData.properties.length})</p>
                          <div className="space-y-1">
                            {citizenData.properties.map((property: any, idx: number) => (
                              <div key={idx} className="text-xs bg-white p-2 rounded border border-yellow-200">
                                <div className="font-medium">{property.property_type}</div>
                                <div className="text-gray-600">{property.property_description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cybercrime Cases */}
                      {citizenData.cybercrimeCases && citizenData.cybercrimeCases.length > 0 && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-red-900 mb-2">قضايا الجرائم الإلكترونية ({citizenData.cybercrimeCases.length})</p>
                          <div className="space-y-1">
                            {citizenData.cybercrimeCases.map((case_: any, idx: number) => (
                              <div key={idx} className="text-xs bg-white p-2 rounded border border-red-200">
                                <div className="font-medium">{case_.title}</div>
                                <div className="text-gray-600">الحالة: {case_.status}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Judicial Cases */}
                      {citizenData.judicialCases && citizenData.judicialCases.length > 0 && (
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-indigo-900 mb-2">القضايا القضائية ({citizenData.judicialCases.length})</p>
                          <div className="space-y-1">
                            {citizenData.judicialCases.map((case_: any, idx: number) => (
                              <div key={idx} className="text-xs bg-white p-2 rounded border border-indigo-200">
                                <div className="font-medium">{case_.title}</div>
                                <div className="text-gray-600">الرقم: {case_.case_number}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Incidents */}
                      {citizenData.incidents && citizenData.incidents.length > 0 && (
                        <div className="bg-pink-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-pink-900 mb-2">البلاغات ({citizenData.incidents.length})</p>
                          <div className="space-y-1">
                            {citizenData.incidents.slice(0, 3).map((incident: any, idx: number) => (
                              <div key={idx} className="text-xs bg-white p-2 rounded border border-pink-200">
                                <div className="font-medium">{incident.title}</div>
                                <div className="text-gray-600">{incident.incident_type}</div>
                              </div>
                            ))}
                          </div>
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
                        placeholder="عنوان IP (مثال: 8.8.8.8)"
                        onKeyPress={(e) => e.key === 'Enter' && searchIpAddress()}
                      />
                      <Button onClick={searchIpAddress} disabled={searchingIp}>
                        {searchingIp ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {ipLocationData && (
                      <div className="space-y-3 pt-3 border-t">
                        {/* Location Info */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-blue-900 mb-2">معلومات الموقع</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{ipLocationData.ip}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {ipLocationData.city && <div><span className="font-semibold">المدينة:</span> {ipLocationData.city}</div>}
                              {ipLocationData.region && <div><span className="font-semibold">المنطقة:</span> {ipLocationData.region}</div>}
                              {ipLocationData.country_name && <div><span className="font-semibold">الدولة:</span> {ipLocationData.country_name}</div>}
                              {ipLocationData.timezone && <div><span className="font-semibold">المنطقة الزمنية:</span> {ipLocationData.timezone}</div>}
                            </div>
                            {(ipLocationData.latitude && ipLocationData.longitude) && (
                              <div className="text-xs">
                                <span className="font-semibold">الإحداثيات:</span> {ipLocationData.latitude}, {ipLocationData.longitude}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ISP Info */}
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-green-900 mb-2">معلومات الشبكة</p>
                          <div className="space-y-1 text-xs">
                            {ipLocationData.isp && <div><span className="font-semibold">مزود الخدمة:</span> {ipLocationData.isp}</div>}
                            {ipLocationData.org && <div><span className="font-semibold">المنظمة:</span> {ipLocationData.org}</div>}
                            {ipLocationData.asname && <div><span className="font-semibold">AS Name:</span> {ipLocationData.asname}</div>}
                          </div>
                        </div>

                        {/* Device Type Indicators */}
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-purple-900 mb-2">نوع الاتصال</p>
                          <div className="flex gap-2 flex-wrap">
                            {ipLocationData.mobile && (
                              <Badge className="bg-purple-500 text-white">جهاز محمول</Badge>
                            )}
                            {ipLocationData.proxy && (
                              <Badge className="bg-orange-500 text-white">بروكسي</Badge>
                            )}
                            {ipLocationData.hosting && (
                              <Badge className="bg-red-500 text-white">استضافة</Badge>
                            )}
                            {!ipLocationData.mobile && !ipLocationData.proxy && !ipLocationData.hosting && (
                              <Badge className="bg-green-500 text-white">اتصال عادي</Badge>
                            )}
                          </div>
                        </div>

                        {/* Related Cases */}
                        {ipRelatedCases.length > 0 && (
                          <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-red-900 mb-2">القضايا المرتبطة ({ipRelatedCases.length})</p>
                            <div className="space-y-2">
                              {ipRelatedCases.map((investigation: any, idx: number) => (
                                <div key={idx} className="text-xs bg-white p-2 rounded border border-red-200">
                                  <div className="font-medium">تحقيق #{investigation.id.substring(0, 8)}</div>
                                  {investigation.cybercrime_cases && (
                                    <div className="text-gray-600">القضية: {investigation.cybercrime_cases.title}</div>
                                  )}
                                  <div className="text-gray-500">الحالة: {investigation.status}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {ipRelatedCases.length === 0 && (
                          <div className="text-center text-sm text-gray-500 py-4">
                            لا توجد قضايا مرتبطة بهذا العنوان
                          </div>
                        )}
                      </div>
                    )}

                    {!ipLocationData && (
                      <p className="text-sm text-gray-500">
                        أدخل عنوان IP للحصول على معلومات الموقع ومزود الخدمة والقضايا المرتبطة
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Investigations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    التحقيقات النشطة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cases.filter(c => c.status === 'investigating').map((case_) => (
                      <div key={case_.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge variant="outline" className="text-xs mb-1">{case_.case_number}</Badge>
                            <h4 className="font-semibold text-sm">{case_.title}</h4>
                          </div>
                          <Badge className="bg-blue-500 text-white text-xs">{case_.priority}</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{case_.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(case_.created_at).toLocaleDateString('ar-EG')}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/cybercrime-advanced-case-detail?caseId=${case_.id}`)}
                          >
                            التفاصيل
                          </Button>
                        </div>
                      </div>
                    ))}
                    {cases.filter(c => c.status === 'investigating').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">لا توجد تحقيقات نشطة حالياً</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* IP Tracking Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    ملخص تتبع IP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ipLocationData ? (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-lg font-bold">{ipLocationData.ip}</span>
                          <Badge className="bg-blue-600 text-white">نشط</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-white p-2 rounded">
                            <div className="text-xs text-gray-500">الموقع</div>
                            <div className="font-medium">{ipLocationData.city}, {ipLocationData.country_name}</div>
                          </div>
                          <div className="bg-white p-2 rounded">
                            <div className="text-xs text-gray-500">مزود الخدمة</div>
                            <div className="font-medium text-xs">{ipLocationData.isp || 'غير معروف'}</div>
                          </div>
                        </div>
                        {ipRelatedCases.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="text-xs font-semibold text-red-600 mb-1">
                              ⚠️ {ipRelatedCases.length} قضية مرتبطة
                            </div>
                            <div className="flex gap-1">
                              {ipRelatedCases.slice(0, 3).map((inv: any, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {inv.id.substring(0, 6)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Globe className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">قم بالبحث عن عنوان IP في تبويب "التحقيق"</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    إحصائيات التتبع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {cases.filter(c => c.status === 'investigating').length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">تحقيقات نشطة</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {cases.filter(c => c.status === 'resolved').length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">قضايا محلولة</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-700">
                        {cases.filter(c => c.priority === 'high' || c.priority === 'critical').length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">أولوية عالية</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-700">
                        {ipRelatedCases.length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">قضايا IP متتبعة</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Cybercrime;
