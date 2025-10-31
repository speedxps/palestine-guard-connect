import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BackButton } from '@/components/BackButton';
import { 
  User, Car, AlertTriangle, Home, Laptop, Scale, 
  Bell, Users, FileText, Camera, Activity, MapPin 
} from 'lucide-react';
import { toast } from 'sonner';

interface ComprehensiveProfile {
  citizen: any;
  vehicles: any[];
  violations: any[];
  cybercrimeCases: any[];
  judicialCases: any[];
  incidents: any[];
  notifications: any[];
  properties: any[];
  family: any[];
  wantedStatus: any;
  documents: any[];
  faceData: any;
}

export default function CitizenProfile() {
  const { nationalId } = useParams<{ nationalId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ComprehensiveProfile | null>(null);

  useEffect(() => {
    if (nationalId) {
      fetchComprehensiveProfile(nationalId);
    }
  }, [nationalId]);

  const fetchComprehensiveProfile = async (natId: string) => {
    setLoading(true);
    try {
      // جلب بيانات المواطن
      const { data: citizen, error: citizenError } = await supabase
        .from('citizens')
        .select('*')
        .eq('national_id', natId)
        .single();

      if (citizenError) throw citizenError;
      if (!citizen) {
        toast.error('لم يتم العثور على المواطن');
        return;
      }

      // جلب جميع البيانات المرتبطة بالتوازي
      const [
        vehiclesRes,
        violationsRes,
        cyberCasesRes,
        judicialCasesRes,
        incidentsRes,
        notificationsRes,
        propertiesRes,
        familyRes,
        wantedRes,
        documentsRes,
        faceDataRes
      ] = await Promise.all([
        // المركبات
        supabase
          .from('vehicle_owners')
          .select('*, vehicle_registrations(*)')
          .eq('national_id', natId),
        
        // المخالفات المرورية
        supabase
          .from('traffic_records')
          .select('*')
          .eq('national_id', natId)
          .order('created_at', { ascending: false }),
        
        // قضايا الجرائم الإلكترونية
        supabase
          .from('cybercrime_cases')
          .select('*')
          .eq('national_id', natId)
          .order('created_at', { ascending: false }),
        
        // القضايا القضائية
        supabase
          .from('judicial_cases')
          .select('*')
          .eq('national_id', natId)
          .order('created_at', { ascending: false }),
        
        // الحوادث والبلاغات
        supabase
          .from('incidents')
          .select('*')
          .eq('reporter_national_id', natId)
          .order('created_at', { ascending: false }),
        
        // الاستدعاءات
        supabase
          .from('official_notifications')
          .select('*')
          .or(`recipient_national_id.eq.${natId},citizen_id.eq.${citizen.id}`)
          .order('created_at', { ascending: false }),
        
        // الأملاك
        supabase
          .from('citizen_properties')
          .select('*')
          .eq('citizen_id', citizen.id),
        
        // أفراد العائلة
        supabase
          .from('family_members')
          .select('*')
          .eq('person_id', citizen.id),
        
        // حالة المطلوبين
        supabase
          .from('wanted_persons')
          .select('*')
          .eq('citizen_id', citizen.id)
          .single(),
        
        // الوثائق
        supabase
          .from('citizen_documents')
          .select('*')
          .eq('citizen_id', citizen.id),
        
        // بيانات الوجه
        supabase
          .from('face_embeddings')
          .select('*')
          .eq('citizen_id', citizen.id)
          .limit(1)
          .single()
      ]);

      setProfile({
        citizen,
        vehicles: vehiclesRes.data || [],
        violations: violationsRes.data || [],
        cybercrimeCases: cyberCasesRes.data || [],
        judicialCases: judicialCasesRes.data || [],
        incidents: incidentsRes.data || [],
        notifications: notificationsRes.data || [],
        properties: propertiesRes.data || [],
        family: familyRes.data || [],
        wantedStatus: wantedRes.data || null,
        documents: documentsRes.data || [],
        faceData: faceDataRes.data || null
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>لم يتم العثور على بيانات المواطن</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { citizen } = profile;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">الملف الشامل للمواطن</h1>
            <p className="text-muted-foreground">رقم الهوية: {nationalId}</p>
          </div>
        </div>
        {profile.wantedStatus && (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            🚨 مطلوب
          </Badge>
        )}
      </div>

      {/* البيانات الأساسية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            البيانات الأساسية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* الصورة */}
            <div className="flex justify-center md:justify-start">
              {citizen.photo_url ? (
                <img
                  src={citizen.photo_url}
                  alt={citizen.full_name}
                  className="w-48 h-48 rounded-lg object-cover border-4 border-primary"
                />
              ) : (
                <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* المعلومات */}
            <div className="space-y-3">
              <div>
                <span className="font-semibold">الاسم الكامل:</span>
                <span className="mr-2">{citizen.full_name}</span>
              </div>
              <div>
                <span className="font-semibold">رقم الهوية:</span>
                <span className="mr-2">{citizen.national_id}</span>
              </div>
              {citizen.date_of_birth && (
                <div>
                  <span className="font-semibold">تاريخ الميلاد:</span>
                  <span className="mr-2">{new Date(citizen.date_of_birth).toLocaleDateString('ar')}</span>
                </div>
              )}
              {citizen.gender && (
                <div>
                  <span className="font-semibold">الجنس:</span>
                  <span className="mr-2">{citizen.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                </div>
              )}
              {citizen.phone && (
                <div>
                  <span className="font-semibold">الهاتف:</span>
                  <span className="mr-2">{citizen.phone}</span>
                </div>
              )}
              {citizen.address && (
                <div>
                  <span className="font-semibold">العنوان:</span>
                  <span className="mr-2">{citizen.address}</span>
                </div>
              )}
              {(citizen.latitude && citizen.longitude) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">
                    الموقع: {citizen.latitude}, {citizen.longitude}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التبويبات */}
      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="vehicles" className="flex items-center gap-1">
            <Car className="w-4 h-4" />
            <span className="hidden md:inline">مركبات</span>
            <Badge variant="secondary">{profile.vehicles.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="violations" className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden md:inline">مخالفات</span>
            <Badge variant="secondary">{profile.violations.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center gap-1">
            <Home className="w-4 h-4" />
            <span className="hidden md:inline">أملاك</span>
            <Badge variant="secondary">{profile.properties.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cyber" className="flex items-center gap-1">
            <Laptop className="w-4 h-4" />
            <span className="hidden md:inline">جرائم إلكترونية</span>
            <Badge variant="secondary">{profile.cybercrimeCases.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="judicial" className="flex items-center gap-1">
            <Scale className="w-4 h-4" />
            <span className="hidden md:inline">قضائية</span>
            <Badge variant="secondary">{profile.judicialCases.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            <span className="hidden md:inline">بلاغات</span>
            <Badge variant="secondary">{profile.incidents.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1">
            <Bell className="w-4 h-4" />
            <span className="hidden md:inline">استدعاءات</span>
            <Badge variant="secondary">{profile.notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">عائلة</span>
            <Badge variant="secondary">{profile.family.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* محتوى المركبات */}
        <TabsContent value="vehicles" className="space-y-4">
          {profile.vehicles.length === 0 ? (
            <Alert>
              <AlertDescription>لا توجد مركبات مسجلة</AlertDescription>
            </Alert>
          ) : (
            profile.vehicles.map((vehicle: any) => (
              <Card key={vehicle.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => vehicle.vehicle_registrations && navigate(`/vehicle-record/${vehicle.vehicle_registrations.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {vehicle.vehicle_registrations?.model || 'مركبة'}
                      </h3>
                      <p className="text-muted-foreground">
                        رقم اللوحة: {vehicle.vehicle_registrations?.plate_number}
                      </p>
                      {vehicle.vehicle_registrations?.color && (
                        <p className="text-sm">اللون: {vehicle.vehicle_registrations.color}</p>
                      )}
                    </div>
                    <Button variant="outline">عرض التفاصيل</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* محتوى المخالفات */}
        <TabsContent value="violations" className="space-y-4">
          {profile.violations.length === 0 ? (
            <Alert>
              <AlertDescription>لا توجد مخالفات مسجلة</AlertDescription>
            </Alert>
          ) : (
            profile.violations.map((violation: any) => (
              <Card key={violation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{violation.violation_type || 'مخالفة مرورية'}</h3>
                      <p className="text-sm text-muted-foreground">
                        التاريخ: {new Date(violation.created_at).toLocaleDateString('ar')}
                      </p>
                      {violation.fine_amount && (
                        <p className="text-sm">الغرامة: {violation.fine_amount} ريال</p>
                      )}
                    </div>
                    <Badge variant={violation.status === 'paid' ? 'default' : 'destructive'}>
                      {violation.status === 'paid' ? 'مسددة' : 'غير مسددة'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* محتوى الأملاك */}
        <TabsContent value="properties" className="space-y-4">
          {profile.properties.length === 0 ? (
            <Alert>
              <AlertDescription>لا توجد أملاك مسجلة</AlertDescription>
            </Alert>
          ) : (
            profile.properties.map((property: any) => (
              <Card key={property.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{property.property_description}</h3>
                  <p className="text-sm text-muted-foreground">النوع: {property.property_type}</p>
                  {property.value && (
                    <p className="text-sm">القيمة: {property.value} ريال</p>
                  )}
                  {property.registration_number && (
                    <p className="text-sm">رقم التسجيل: {property.registration_number}</p>
                  )}
                  <Badge variant="outline" className="mt-2">{property.status}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* محتوى قضايا الجرائم الإلكترونية */}
        <TabsContent value="cyber" className="space-y-4">
          {profile.cybercrimeCases.length === 0 ? (
            <Alert>
              <AlertDescription>لا توجد قضايا جرائم إلكترونية</AlertDescription>
            </Alert>
          ) : (
            profile.cybercrimeCases.map((caseItem: any) => (
              <Card key={caseItem.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/cybercrime-case-record/${caseItem.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{caseItem.title}</h3>
                      <p className="text-sm text-muted-foreground">رقم القضية: {caseItem.case_number}</p>
                      <p className="text-sm">النوع: {caseItem.case_type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge>{caseItem.status}</Badge>
                      <Button variant="outline" size="sm">عرض القضية</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* محتوى القضايا القضائية */}
        <TabsContent value="judicial" className="space-y-4">
          {profile.judicialCases.length === 0 ? (
            <Alert>
              <AlertDescription>لا توجد قضايا قضائية</AlertDescription>
            </Alert>
          ) : (
            profile.judicialCases.map((caseItem: any) => (
              <Card key={caseItem.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/judicial-case-record/${caseItem.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{caseItem.title}</h3>
                      <p className="text-sm text-muted-foreground">رقم القضية: {caseItem.case_number}</p>
                      <p className="text-sm">النوع: {caseItem.case_type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge>{caseItem.status}</Badge>
                      <Button variant="outline" size="sm">عرض القضية</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* محتوى البلاغات */}
        <TabsContent value="incidents" className="space-y-4">
          {profile.incidents.length === 0 ? (
            <Alert>
              <AlertDescription>لا توجد بلاغات مسجلة</AlertDescription>
            </Alert>
          ) : (
            profile.incidents.map((incident: any) => (
              <Card key={incident.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/incident-record/${incident.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{incident.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        التاريخ: {new Date(incident.created_at).toLocaleDateString('ar')}
                      </p>
                      <p className="text-sm">النوع: {incident.incident_type}</p>
                      {incident.location_address && (
                        <p className="text-sm">الموقع: {incident.location_address}</p>
                      )}
                    </div>
                    <Badge>{incident.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* محتوى الاستدعاءات */}
        <TabsContent value="notifications" className="space-y-4">
          {profile.notifications.length === 0 ? (
            <Alert>
              <AlertDescription>لا توجد استدعاءات</AlertDescription>
            </Alert>
          ) : (
            profile.notifications.map((notification: any) => (
              <Card key={notification.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{notification.subject || 'استدعاء رسمي'}</h3>
                      <p className="text-sm text-muted-foreground">
                        التاريخ: {new Date(notification.created_at).toLocaleDateString('ar')}
                      </p>
                      {notification.notification_type && (
                        <p className="text-sm">النوع: {notification.notification_type}</p>
                      )}
                    </div>
                    <Badge variant={notification.status === 'responded' ? 'default' : 'destructive'}>
                      {notification.status === 'responded' ? 'تمت الاستجابة' : 'معلق'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* محتوى العائلة */}
        <TabsContent value="family" className="space-y-4">
          {profile.family.length === 0 ? (
            <Alert>
              <AlertDescription>لا توجد بيانات عائلية مسجلة</AlertDescription>
            </Alert>
          ) : (
            profile.family.map((member: any) => (
              <Card key={member.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => member.relative_national_id && navigate(`/citizen-profile/${member.relative_national_id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{member.relative_name}</h3>
                      <p className="text-sm text-muted-foreground">العلاقة: {member.relation}</p>
                      {member.relative_national_id && (
                        <p className="text-sm">رقم الهوية: {member.relative_national_id}</p>
                      )}
                    </div>
                    {member.relative_national_id && (
                      <Button variant="outline" size="sm">عرض الملف</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
