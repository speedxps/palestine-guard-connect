import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  AlertTriangle, 
  Shield, 
  Calendar, 
  MapPin, 
  Phone, 
  IdCard,
  Users,
  Filter,
  Eye,
  ArrowLeft,
  User
} from 'lucide-react';

interface CitizenRecord {
  id: string;
  national_id: string;
  full_name: string;
  gender?: string;
  date_of_birth?: string;
  phone?: string;
  photo_url?: string;
  has_vehicle: boolean;
  created_at: string;
  traffic_violations: TrafficViolation[];
  cybercrime_reports: CybercrimeReport[];
  incidents: Incident[];
  wanted_status?: WantedPerson;
  vehicles?: Vehicle[]; // إضافة معلومات المركبات
}

interface TrafficViolation {
  id: string;
  record_type: string;
  record_date: string;
  details?: string;
  is_resolved: boolean;
  created_at: string;
}

interface CybercrimeReport {
  id: string;
  crime_type: string;
  status: string;
  platform?: string;
  description: string;
  created_at: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  status: string;
  location_address?: string;
  created_at: string;
}

interface Vehicle {
  id: string;
  plate_number: string;
  vehicle_type?: string;
  color?: string;
  purchase_date?: string;
}

interface WantedPerson {
  id: string;
  reason?: string;
  monitor_start_date: string;
  monitor_end_date?: string;
  is_active: boolean;
}

interface Vehicle {
  id: string;
  plate_number: string;
  vehicle_type?: string;
  color?: string;
  purchase_date?: string;
}

const CitizenRecords: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [records, setRecords] = useState<CitizenRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CitizenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<CitizenRecord | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'violations' | 'cybercrime' | 'incidents' | 'wanted'>('all');
  const [totalStats, setTotalStats] = useState({
    total: 0,
    violations: 0,
    cybercrime: 0,
    incidents: 0,
    wanted: 0
  });

  useEffect(() => {
    fetchCitizenRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, filterType]);

  const fetchCitizenRecords = async () => {
    setLoading(true);
    try {
      // جلب بيانات المواطنين
      const { data: citizens, error: citizensError } = await supabase
        .from('citizens')
        .select('*');

      if (citizensError) throw citizensError;

      const citizenRecords: CitizenRecord[] = [];

      for (const citizen of citizens) {
        // جلب المخالفات المرورية
        const { data: violations } = await supabase
          .from('traffic_records')
          .select('*')
          .eq('national_id', citizen.national_id);

        // جلب بلاغات الجرائم الإلكترونية (من خلال البروفايل)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, user_id')
          .eq('username', citizen.national_id)
          .limit(1);

        let cybercrimeReports: CybercrimeReport[] = [];
        let incidents: Incident[] = [];

        if (profiles && profiles.length > 0) {
          const profileId = profiles[0].id;

          // جلب بلاغات الجرائم الإلكترونية
          const { data: cybercrime } = await supabase
            .from('cybercrime_reports')
            .select('*')
            .eq('reporter_id', profileId);

          // جلب الحوادث
          const { data: incidentsData } = await supabase
            .from('incidents')
            .select('*')
            .eq('reporter_id', profileId);

          cybercrimeReports = cybercrime || [];
          incidents = incidentsData || [];
        }

        // جلب حالة المطلوبين
        const { data: wanted } = await supabase
          .from('wanted_persons')
          .select('*')
          .eq('citizen_id', citizen.id)
          .eq('is_active', true)
          .limit(1);

        // جلب معلومات المركبات
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('*')
          .eq('owner_id', citizen.id);

        // إضافة المواطن للقائمة إذا كان لديه أي سجلات
        const hasRecords = 
          (violations && violations.length > 0) ||
          cybercrimeReports.length > 0 ||
          incidents.length > 0 ||
          (wanted && wanted.length > 0);

        if (hasRecords) {
          citizenRecords.push({
            ...citizen,
            traffic_violations: violations || [],
            cybercrime_reports: cybercrimeReports,
            incidents: incidents,
            wanted_status: wanted && wanted.length > 0 ? wanted[0] : undefined,
            vehicles: vehicles || []
          });
        }
      }

      setRecords(citizenRecords);
      calculateStats(citizenRecords);
    } catch (error: any) {
      console.error('Error fetching citizen records:', error);
      toast({
        title: `❌ ${t('general.error')}`,
        description: 'فشل في جلب سجلات المواطنين',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: CitizenRecord[]) => {
    const stats = {
      total: records.length,
      violations: records.filter(r => r.traffic_violations.length > 0).length,
      cybercrime: records.filter(r => r.cybercrime_reports.length > 0).length,
      incidents: records.filter(r => r.incidents.length > 0).length,
      wanted: records.filter(r => r.wanted_status).length
    };
    setTotalStats(stats);
  };

  const filterRecords = () => {
    let filtered = records;

    // تصفية حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.national_id.includes(searchTerm)
      );
    }

    // تصفية حسب النوع
    switch (filterType) {
      case 'violations':
        filtered = filtered.filter(r => r.traffic_violations.length > 0);
        break;
      case 'cybercrime':
        filtered = filtered.filter(r => r.cybercrime_reports.length > 0);
        break;
      case 'incidents':
        filtered = filtered.filter(r => r.incidents.length > 0);
        break;
      case 'wanted':
        filtered = filtered.filter(r => r.wanted_status);
        break;
    }

    setFilteredRecords(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any, label: string }> = {
      'new': { variant: 'default', label: 'جديد' },
      'in_progress': { variant: 'secondary', label: 'قيد المعالجة' },
      'resolved': { variant: 'default', label: 'محلول' },
      'closed': { variant: 'outline', label: 'مغلق' },
      'pending': { variant: 'secondary', label: 'معلق' },
      'completed': { variant: 'default', label: 'مكتمل' }
    };
    
    const config = statusMap[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="page-header">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="font-arabic"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              {t('general.back')}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground font-arabic">{t('general.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Mobile Header */}
      <div className="page-header">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="font-arabic"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            {t('general.back')}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-arabic text-foreground">
              {t('citizen_records.title')}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-arabic">
            {t('citizen_records.subtitle')}
          </p>
        </div>
      </div>

      <div className="px-4 pb-32 space-y-6">
        {/* Mobile Stats Cards - 2 columns grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card p-3">
            <div className="text-center">
              <div className="p-2 bg-primary/20 rounded-lg w-fit mx-auto mb-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground font-arabic mb-1">
                {t('citizen_records.total_records')}
              </p>
              <p className="text-xl font-bold">{totalStats.total}</p>
            </div>
          </Card>

          <Card className="glass-card p-3">
            <div className="text-center">
              <div className="p-2 bg-orange-500/20 rounded-lg w-fit mx-auto mb-2">
                <FileText className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground font-arabic mb-1">
                {t('citizen_records.traffic_violations')}
              </p>
              <p className="text-xl font-bold">{totalStats.violations}</p>
            </div>
          </Card>

          <Card className="glass-card p-3">
            <div className="text-center">
              <div className="p-2 bg-red-500/20 rounded-lg w-fit mx-auto mb-2">
                <Shield className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-xs text-muted-foreground font-arabic mb-1">
                {t('citizen_records.cybercrime_reports')}
              </p>
              <p className="text-xl font-bold">{totalStats.cybercrime}</p>
            </div>
          </Card>

          <Card className="glass-card p-3">
            <div className="text-center">
              <div className="p-2 bg-red-600/20 rounded-lg w-fit mx-auto mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-xs text-muted-foreground font-arabic mb-1">
                {t('citizen_records.wanted')}
              </p>
              <p className="text-xl font-bold">{totalStats.wanted}</p>
            </div>
          </Card>
        </div>

        {/* Mobile Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`${t('general.search')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 font-arabic"
            />
          </div>
          
          {/* Mobile Filter Buttons - Horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'violations', 'cybercrime', 'incidents', 'wanted'].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type as any)}
                className="font-arabic whitespace-nowrap flex-shrink-0"
              >
                <Filter className="h-3 w-3 mr-1" />
                {type === 'all' ? t('general.filter') :
                 type === 'violations' ? t('citizen_records.traffic_violations') :
                 type === 'cybercrime' ? t('citizen_records.cybercrime_reports') :
                 type === 'incidents' ? t('citizen_records.incidents') : t('citizen_records.wanted')}
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile Records List */}
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="glass-card overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-4">
                {/* Citizen Info */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={record.photo_url} />
                    <AvatarFallback className="font-arabic text-sm">
                      {record.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold font-arabic text-base leading-tight">
                      {record.full_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IdCard className="h-3 w-3" />
                      <span className="truncate">{record.national_id}</span>
                    </div>
                    {record.wanted_status && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        {t('citizen_records.wanted')}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Records Summary - Mobile Layout */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {record.traffic_violations.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-arabic text-muted-foreground truncate">مخالفات:</span>
                      <Badge variant="secondary" className="text-xs">{record.traffic_violations.length}</Badge>
                    </div>
                  )}
                  {record.cybercrime_reports.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-arabic text-muted-foreground truncate">جرائم:</span>
                      <Badge variant="destructive" className="text-xs">{record.cybercrime_reports.length}</Badge>
                    </div>
                  )}
                  {record.incidents.length > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-arabic text-muted-foreground truncate">حوادث:</span>
                      <Badge className="text-xs">{record.incidents.length}</Badge>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full font-arabic text-sm"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <Eye className="h-3 w-3 ml-1" />
                      {t('citizen_records.view_details')}
                    </Button>
                  </DialogTrigger>
                  
                  {selectedRecord && (
                    <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-arabic flex items-center gap-3 text-lg">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedRecord.photo_url} />
                            <AvatarFallback className="font-arabic text-xs">
                              {selectedRecord.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {selectedRecord.full_name}
                        </DialogTitle>
                      </DialogHeader>

                      <Tabs defaultValue="info" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 text-xs">
                          <TabsTrigger value="info" className="font-arabic text-xs">
                            {t('citizen_records.citizen_info')}
                          </TabsTrigger>
                          <TabsTrigger value="violations" className="font-arabic text-xs">
                            مخالفات
                          </TabsTrigger>
                          <TabsTrigger value="cybercrime" className="font-arabic text-xs">
                            جرائم
                          </TabsTrigger>
                          <TabsTrigger value="incidents" className="font-arabic text-xs">
                            حوادث
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-4">
                          <Card className="p-4">
                            <h4 className="font-semibold font-arabic mb-3 text-base">المعلومات الشخصية</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-arabic text-muted-foreground">الاسم الكامل</label>
                                <p className="font-arabic text-sm">{selectedRecord.full_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-arabic text-muted-foreground">رقم الهوية</label>
                                <p className="text-sm">{selectedRecord.national_id}</p>
                              </div>
                              {selectedRecord.gender && (
                                <div>
                                  <label className="text-sm font-arabic text-muted-foreground">الجنس</label>
                                  <p className="font-arabic text-sm">{selectedRecord.gender}</p>
                                </div>
                              )}
                              {selectedRecord.date_of_birth && (
                                <div>
                                  <label className="text-sm font-arabic text-muted-foreground">تاريخ الميلاد</label>
                                  <p className="text-sm">{formatDate(selectedRecord.date_of_birth)}</p>
                                </div>
                              )}
                              <div>
                                <label className="text-sm font-arabic text-muted-foreground">يملك مركبة</label>
                                <p className="font-arabic text-sm">{selectedRecord.has_vehicle ? 'نعم' : 'لا'}</p>
                              </div>
                              
                              {/* عرض معلومات المركبات إن وجدت */}
                              {selectedRecord.vehicles && selectedRecord.vehicles.length > 0 && (
                                <div>
                                  <label className="text-sm font-arabic text-muted-foreground">المركبات المملوكة</label>
                                  <div className="space-y-2 mt-1">
                                    {selectedRecord.vehicles.map((vehicle) => (
                                      <div key={vehicle.id} className="p-2 bg-blue-50 rounded border text-sm">
                                        <div className="flex items-center justify-between">
                                          <span className="font-semibold">{vehicle.plate_number}</span>
                                          {vehicle.vehicle_type && (
                                            <span className="text-muted-foreground">{vehicle.vehicle_type}</span>
                                          )}
                                        </div>
                                        {vehicle.color && (
                                          <div className="text-xs text-muted-foreground">
                                            اللون: {vehicle.color}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {selectedRecord.wanted_status && (
                              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <h5 className="font-semibold font-arabic text-red-800 mb-2 text-sm">حالة المطلوب</h5>
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-xs font-arabic text-red-600">السبب</label>
                                    <p className="font-arabic text-red-800 text-sm">{selectedRecord.wanted_status.reason || 'غير محدد'}</p>
                                  </div>
                                  <div>
                                    <label className="text-xs font-arabic text-red-600">تاريخ بدء المراقبة</label>
                                    <p className="text-red-800 text-sm">{formatDate(selectedRecord.wanted_status.monitor_start_date)}</p>
                                  </div>
                                  {selectedRecord.wanted_status.monitor_end_date && (
                                    <div>
                                      <label className="text-xs font-arabic text-red-600">تاريخ انتهاء المراقبة</label>
                                      <p className="text-red-800 text-sm">{formatDate(selectedRecord.wanted_status.monitor_end_date)}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Card>
                        </TabsContent>

                        <TabsContent value="violations" className="space-y-3">
                          {selectedRecord.traffic_violations.length === 0 ? (
                            <p className="text-center text-muted-foreground font-arabic py-8 text-sm">
                              لا توجد مخالفات مرورية
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {selectedRecord.traffic_violations.map((violation) => (
                                <Card key={violation.id} className="p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold font-arabic text-sm truncate">{violation.record_type}</h5>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(violation.record_date)}
                                      </p>
                                    </div>
                                    <Badge variant={violation.is_resolved ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                                      {violation.is_resolved ? 'محلولة' : 'معلقة'}
                                    </Badge>
                                  </div>
                                  {violation.details && (
                                    <p className="text-xs font-arabic text-muted-foreground">
                                      {violation.details}
                                    </p>
                                  )}
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="cybercrime" className="space-y-3">
                          {selectedRecord.cybercrime_reports.length === 0 ? (
                            <p className="text-center text-muted-foreground font-arabic py-8 text-sm">
                              لا توجد بلاغات جرائم إلكترونية
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {selectedRecord.cybercrime_reports.map((report) => (
                                <Card key={report.id} className="p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold font-arabic text-sm truncate">{report.crime_type}</h5>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(report.created_at)}
                                      </p>
                                      {report.platform && (
                                        <p className="text-xs text-blue-600 font-arabic">
                                          المنصة: {report.platform}
                                        </p>
                                      )}
                                    </div>
                                    {getStatusBadge(report.status)}
                                  </div>
                                  <p className="text-xs font-arabic text-muted-foreground">
                                    {report.description}
                                  </p>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="incidents" className="space-y-3">
                          {selectedRecord.incidents.length === 0 ? (
                            <p className="text-center text-muted-foreground font-arabic py-8 text-sm">
                              لا توجد حوادث
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {selectedRecord.incidents.map((incident) => (
                                <Card key={incident.id} className="p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold font-arabic text-sm truncate">{incident.title}</h5>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(incident.created_at)}
                                      </p>
                                      <p className="text-xs text-blue-600 font-arabic">
                                        النوع: {incident.incident_type}
                                      </p>
                                      {incident.location_address && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <MapPin className="h-3 w-3 flex-shrink-0" />
                                          <span className="font-arabic truncate">{incident.location_address}</span>
                                        </div>
                                      )}
                                    </div>
                                    {getStatusBadge(incident.status)}
                                  </div>
                                  <p className="text-xs font-arabic text-muted-foreground">
                                    {incident.description}
                                  </p>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  )}
                </Dialog>
              </div>
            </Card>
          ))}
        </div>

        {filteredRecords.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-arabic text-muted-foreground mb-2">
              {t('citizen_records.no_records')}
            </p>
            <p className="text-sm text-muted-foreground font-arabic">
              لم يتم العثور على سجلات مطابقة للبحث
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenRecords;