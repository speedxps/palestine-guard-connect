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
  Eye
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

interface WantedPerson {
  id: string;
  reason?: string;
  monitor_start_date: string;
  monitor_end_date?: string;
  is_active: boolean;
}

const CitizenRecords: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
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
            wanted_status: wanted && wanted.length > 0 ? wanted[0] : undefined
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground font-arabic">{t('general.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-arabic text-foreground">
                {t('citizen_records.title')}
              </h1>
              <p className="text-muted-foreground font-arabic">
                {t('citizen_records.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-arabic">
                  {t('citizen_records.total_records')}
                </p>
                <p className="text-2xl font-bold">{totalStats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-arabic">
                  {t('citizen_records.traffic_violations')}
                </p>
                <p className="text-2xl font-bold">{totalStats.violations}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-arabic">
                  {t('citizen_records.cybercrime_reports')}
                </p>
                <p className="text-2xl font-bold">{totalStats.cybercrime}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-arabic">
                  {t('citizen_records.incidents')}
                </p>
                <p className="text-2xl font-bold">{totalStats.incidents}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-arabic">
                  {t('citizen_records.wanted')}
                </p>
                <p className="text-2xl font-bold">{totalStats.wanted}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم أو رقم الهوية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 font-arabic"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'violations', 'cybercrime', 'incidents', 'wanted'].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type as any)}
                className="font-arabic"
              >
                <Filter className="h-4 w-4 mr-1" />
                {type === 'all' ? 'الكل' :
                 type === 'violations' ? 'مخالفات' :
                 type === 'cybercrime' ? 'جرائم إلكترونية' :
                 type === 'incidents' ? 'حوادث' : 'مطلوبين'}
              </Button>
            ))}
          </div>
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="glass-card overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                {/* Citizen Info */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={record.photo_url} />
                    <AvatarFallback className="font-arabic">
                      {record.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold font-arabic text-lg">
                      {record.full_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IdCard className="h-4 w-4" />
                      <span>{record.national_id}</span>
                    </div>
                    {record.wanted_status && (
                      <Badge variant="destructive" className="mt-1">
                        مطلوب
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Records Summary */}
                <div className="space-y-2 mb-4">
                  {record.traffic_violations.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-arabic text-muted-foreground">مخالفات مرورية:</span>
                      <Badge variant="secondary">{record.traffic_violations.length}</Badge>
                    </div>
                  )}
                  {record.cybercrime_reports.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-arabic text-muted-foreground">جرائم إلكترونية:</span>
                      <Badge variant="destructive">{record.cybercrime_reports.length}</Badge>
                    </div>
                  )}
                  {record.incidents.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-arabic text-muted-foreground">حوادث:</span>
                      <Badge>{record.incidents.length}</Badge>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full font-arabic"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      {t('citizen_records.view_details')}
                    </Button>
                  </DialogTrigger>
                  
                  {selectedRecord && (
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-arabic flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedRecord.photo_url} />
                            <AvatarFallback className="font-arabic">
                              {selectedRecord.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {selectedRecord.full_name}
                        </DialogTitle>
                      </DialogHeader>

                      <Tabs defaultValue="info" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="info" className="font-arabic">
                            {t('citizen_records.citizen_info')}
                          </TabsTrigger>
                          <TabsTrigger value="violations" className="font-arabic">
                            {t('citizen_records.violations_history')}
                          </TabsTrigger>
                          <TabsTrigger value="cybercrime" className="font-arabic">
                            جرائم إلكترونية
                          </TabsTrigger>
                          <TabsTrigger value="incidents" className="font-arabic">
                            حوادث
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="space-y-4">
                          <Card className="p-4">
                            <h4 className="font-semibold font-arabic mb-3">المعلومات الشخصية</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-arabic text-muted-foreground">الاسم الكامل</label>
                                <p className="font-arabic">{selectedRecord.full_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-arabic text-muted-foreground">رقم الهوية</label>
                                <p>{selectedRecord.national_id}</p>
                              </div>
                              {selectedRecord.gender && (
                                <div>
                                  <label className="text-sm font-arabic text-muted-foreground">الجنس</label>
                                  <p className="font-arabic">{selectedRecord.gender}</p>
                                </div>
                              )}
                              {selectedRecord.date_of_birth && (
                                <div>
                                  <label className="text-sm font-arabic text-muted-foreground">تاريخ الميلاد</label>
                                  <p>{formatDate(selectedRecord.date_of_birth)}</p>
                                </div>
                              )}
                              <div>
                                <label className="text-sm font-arabic text-muted-foreground">يملك مركبة</label>
                                <p className="font-arabic">{selectedRecord.has_vehicle ? 'نعم' : 'لا'}</p>
                              </div>
                            </div>
                            
                            {selectedRecord.wanted_status && (
                              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <h5 className="font-semibold font-arabic text-red-800 mb-2">حالة المطلوب</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-sm font-arabic text-red-600">السبب</label>
                                    <p className="font-arabic text-red-800">{selectedRecord.wanted_status.reason || 'غير محدد'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-arabic text-red-600">تاريخ بدء المراقبة</label>
                                    <p className="text-red-800">{formatDate(selectedRecord.wanted_status.monitor_start_date)}</p>
                                  </div>
                                  {selectedRecord.wanted_status.monitor_end_date && (
                                    <div>
                                      <label className="text-sm font-arabic text-red-600">تاريخ انتهاء المراقبة</label>
                                      <p className="text-red-800">{formatDate(selectedRecord.wanted_status.monitor_end_date)}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Card>
                        </TabsContent>

                        <TabsContent value="violations" className="space-y-4">
                          {selectedRecord.traffic_violations.length === 0 ? (
                            <p className="text-center text-muted-foreground font-arabic py-8">
                              لا توجد مخالفات مرورية
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {selectedRecord.traffic_violations.map((violation) => (
                                <Card key={violation.id} className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h5 className="font-semibold font-arabic">{violation.record_type}</h5>
                                      <p className="text-sm text-muted-foreground">
                                        {formatDate(violation.record_date)}
                                      </p>
                                    </div>
                                    <Badge variant={violation.is_resolved ? 'default' : 'secondary'}>
                                      {violation.is_resolved ? 'محلولة' : 'غير محلولة'}
                                    </Badge>
                                  </div>
                                  {violation.details && (
                                    <p className="text-sm font-arabic text-muted-foreground">
                                      {violation.details}
                                    </p>
                                  )}
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="cybercrime" className="space-y-4">
                          {selectedRecord.cybercrime_reports.length === 0 ? (
                            <p className="text-center text-muted-foreground font-arabic py-8">
                              لا توجد بلاغات جرائم إلكترونية
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {selectedRecord.cybercrime_reports.map((report) => (
                                <Card key={report.id} className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h5 className="font-semibold font-arabic">{report.crime_type}</h5>
                                      <p className="text-sm text-muted-foreground">
                                        {formatDate(report.created_at)}
                                      </p>
                                      {report.platform && (
                                        <p className="text-sm text-blue-600 font-arabic">
                                          المنصة: {report.platform}
                                        </p>
                                      )}
                                    </div>
                                    {getStatusBadge(report.status)}
                                  </div>
                                  <p className="text-sm font-arabic text-muted-foreground">
                                    {report.description}
                                  </p>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="incidents" className="space-y-4">
                          {selectedRecord.incidents.length === 0 ? (
                            <p className="text-center text-muted-foreground font-arabic py-8">
                              لا توجد حوادث
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {selectedRecord.incidents.map((incident) => (
                                <Card key={incident.id} className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h5 className="font-semibold font-arabic">{incident.title}</h5>
                                      <p className="text-sm text-muted-foreground">
                                        {formatDate(incident.created_at)}
                                      </p>
                                      <p className="text-sm text-blue-600 font-arabic">
                                        النوع: {incident.incident_type}
                                      </p>
                                      {incident.location_address && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                          <MapPin className="h-3 w-3" />
                                          <span className="font-arabic">{incident.location_address}</span>
                                        </div>
                                      )}
                                    </div>
                                    {getStatusBadge(incident.status)}
                                  </div>
                                  <p className="text-sm font-arabic text-muted-foreground">
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
            <p className="text-xl font-arabic text-muted-foreground mb-2">
              {t('citizen_records.no_records')}
            </p>
            <p className="text-muted-foreground font-arabic">
              لم يتم العثور على سجلات مطابقة للبحث
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenRecords;