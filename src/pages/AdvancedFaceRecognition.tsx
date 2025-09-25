import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Upload, 
  Search, 
  User, 
  Eye, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Shield,
  Car,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  Scan
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';

interface MatchResult {
  id: string;
  national_id: string;
  full_name: string;
  first_name: string;
  family_name: string;
  father_name?: string;
  date_of_birth?: string;
  phone?: string;
  address?: string;
  photo_url?: string;
  similarity: number;
  confidence: number;
  has_vehicle: boolean;
  created_at: string;
}

interface CitizenProperty {
  id: string;
  property_type: string;
  property_description: string;
  registration_number?: string;
  value?: number;
  status: string;
}

interface SecurityRecord {
  id: string;
  type: string;
  description: string;
  status: string;
  date: string;
}

const AdvancedFaceRecognition: React.FC = () => {
  const { user } = useAuth();
  const { searchFaces, isLoading } = useFaceRecognition();
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<MatchResult[]>([]);
  const [selectedCitizen, setSelectedCitizen] = useState<MatchResult | null>(null);
  const [citizenProperties, setCitizenProperties] = useState<CitizenProperty[]>([]);
  const [securityRecords, setSecurityRecords] = useState<SecurityRecord[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('خطأ في تشغيل الكاميرا:', error);
      toast.error('فشل في تشغيل الكاميرا');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured_photo.jpg', { type: 'image/jpeg' });
            setSelectedImage(file);
            
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
          }
        }, 'image/jpeg', 0.9);
      }
      
      stopCamera();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const performFaceSearch = async () => {
    if (!selectedImage) {
      toast.error('يرجى اختيار صورة أولاً');
      return;
    }

    setSearchStatus('processing');
    setSearchProgress(0);
    setSearchResults([]);

    try {
      // محاكاة تقدم البحث
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // تحويل الصورة إلى base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Image = reader.result as string;
          const result = await searchFaces(base64Image);
          
          clearInterval(progressInterval);
          setSearchProgress(100);
          
          if (result.success && result.matches && result.matches.length > 0) {
            // تحويل النتائج إلى التنسيق المطلوب
            const formattedResults: MatchResult[] = result.matches.map(match => ({
              id: match.id?.toString() || '',
              national_id: match.nationalId || '',
              full_name: match.name || '',
              first_name: match.name?.split(' ')[0] || '',
              family_name: match.name?.split(' ').slice(-1)[0] || '',
              father_name: '',
              date_of_birth: '',
              phone: '',
              address: '',
              photo_url: match.photo_url || '',
              similarity: match.similarity || 0,
              confidence: (match.similarity || 0) * 100,
              has_vehicle: false,
              created_at: new Date().toISOString()
            }));
            
            setSearchResults(formattedResults);
            setSearchStatus('completed');
            toast.success(`تم العثور على ${formattedResults.length} نتيجة مطابقة`);
          } else {
            setSearchStatus('error');
            toast.warning('لم يتم العثور على وجه مطابق في قاعدة البيانات');
          }
        } catch (error) {
          clearInterval(progressInterval);
          setSearchStatus('error');
          console.error('خطأ في البحث:', error);
          toast.error('حدث خطأ أثناء البحث عن الوجه');
        }
      };
      
      reader.readAsDataURL(selectedImage);
    } catch (error) {
      setSearchStatus('error');
      console.error('خطأ في البحث:', error);
      toast.error('فشل في البحث عن الوجه');
    }
  };

  const fetchCitizenDetails = async (citizenId: string) => {
    try {
      // جلب بيانات المواطن الكاملة
      const { data: citizenData, error: citizenError } = await supabase
        .from('citizens')
        .select('*')
        .eq('id', citizenId)
        .single();

      if (citizenError) throw citizenError;

      // جلب الممتلكات
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('citizen_properties')
        .select('*')
        .eq('citizen_id', citizenId);

      if (propertiesError) throw propertiesError;
      setCitizenProperties(propertiesData || []);

      // جلب السجل الأمني (مخالفات، مطلوبين)
      const { data: violationsData } = await supabase
        .from('vehicle_violations')
        .select('*')
        .eq('vehicle_id', citizenId);

      const { data: wantedData } = await supabase
        .from('wanted_persons')
        .select('*')
        .eq('citizen_id', citizenId);

      const securityRecords: SecurityRecord[] = [
        ...(violationsData || []).map(v => ({
          id: v.id,
          type: 'violation',
          description: `مخالفة: ${v.violation_type}`,
          status: v.status,
          date: v.violation_date
        })),
        ...(wantedData || []).map(w => ({
          id: w.id,
          type: 'wanted',
          description: `مطلوب: ${w.reason || 'غير محدد'}`,
          status: w.is_active ? 'active' : 'inactive',
          date: w.monitor_start_date
        }))
      ];

      setSecurityRecords(securityRecords);

    } catch (error) {
      console.error('خطأ في جلب تفاصيل المواطن:', error);
      toast.error('فشل في جلب تفاصيل المواطن');
    }
  };

  const viewCitizenProfile = async (citizen: MatchResult) => {
    setSelectedCitizen(citizen);
    await fetchCitizenDetails(citizen.id);
  };

  const generateCitizenReport = async (citizen: MatchResult) => {
    await fetchCitizenDetails(citizen.id);
    
    const reportContent = `
تقرير التعرف على الوجه
======================

نتائج المطابقة:
نسبة التطابق: ${(citizen.similarity * 100).toFixed(2)}%
درجة الثقة: ${citizen.confidence.toFixed(2)}%

البيانات الشخصية:
الاسم الكامل: ${citizen.full_name}
رقم الهوية: ${citizen.national_id}
اسم الأب: ${citizen.father_name || 'غير محدد'}
تاريخ الميلاد: ${citizen.date_of_birth || 'غير محدد'}
رقم الهاتف: ${citizen.phone || 'غير محدد'}
العنوان: ${citizen.address || 'غير محدد'}

الممتلكات:
${citizenProperties.map(p => `- ${p.property_description} (${p.registration_number || 'غير محدد'})`).join('\n') || 'لا توجد ممتلكات مسجلة'}

الحالة الأمنية:
${securityRecords.length > 0 ? securityRecords.map(s => `- ${s.description} (${s.status})`).join('\n') : 'لا توجد سجلات أمنية'}

تاريخ التقرير: ${new Date().toLocaleString('ar-SA')}
المسؤول: ${user?.full_name || 'غير محدد'}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_التعرف_${citizen.full_name}_${citizen.national_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('تم تحميل التقرير بنجاح');
  };

  const resetSearch = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setSearchResults([]);
    setSearchStatus('idle');
    setSearchProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Scan className="h-8 w-8 ml-3" />
              نظام التعرف على الوجوه المتطور
            </h1>
            <p className="text-muted-foreground mt-2">
              تحليل ذكي للوجوه مع ربط شامل بقاعدة البيانات المدنية والأمنية
            </p>
          </div>
          <Button onClick={resetSearch} variant="outline">
            بحث جديد
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* قسم رفع الصورة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 ml-2" />
                رفع أو التقاط الصورة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    رفع صورة
                  </Button>
                  <Button
                    onClick={cameraActive ? stopCamera : startCamera}
                    variant="outline"
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 ml-2" />
                    {cameraActive ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {cameraActive && (
                  <div className="space-y-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg border"
                    />
                    <Button onClick={capturePhoto} className="w-full">
                      <Camera className="h-4 w-4 ml-2" />
                      التقاط الصورة
                    </Button>
                  </div>
                )}

                {imagePreview && (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="الصورة المحددة"
                        className="w-full max-h-64 object-contain rounded-lg border"
                      />
                      <Badge className="absolute top-2 left-2 bg-green-600">
                        صورة جاهزة للبحث
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={performFaceSearch}
                      disabled={isLoading || searchStatus === 'processing'}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {isLoading || searchStatus === 'processing' ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          جاري البحث...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 ml-2" />
                          بدء البحث عن الوجه
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {searchStatus === 'processing' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>تقدم البحث</span>
                      <span>{searchProgress}%</span>
                    </div>
                    <Progress value={searchProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      جاري تحليل الوجه ومقارنته مع قاعدة البيانات...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* قسم النتائج */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 ml-2" />
                نتائج البحث
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchStatus === 'idle' && (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>قم برفع صورة لبدء البحث</p>
                </div>
              )}

              {searchStatus === 'error' && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    لم يتم العثور على وجه مطابق في قاعدة البيانات. قد يكون الشخص غير مسجل أو جودة الصورة غير كافية.
                  </AlertDescription>
                </Alert>
              )}

              {searchStatus === 'completed' && searchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      تم العثور على {searchResults.length} نتيجة مطابقة
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 ml-1" />
                      مطابقة ناجحة
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {searchResults.map((result, index) => (
                      <div key={result.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex space-x-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                              {result.photo_url ? (
                                <img
                                  src={result.photo_url}
                                  alt={result.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{result.full_name}</h3>
                              <p className="text-sm text-muted-foreground">
                                رقم الهوية: {result.national_id}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge 
                                  variant={result.similarity > 0.8 ? "default" : result.similarity > 0.6 ? "secondary" : "outline"}
                                  className={
                                    result.similarity > 0.8 ? "bg-green-600" :
                                    result.similarity > 0.6 ? "bg-yellow-600" : "bg-red-600"
                                  }
                                >
                                  تطابق: {(result.similarity * 100).toFixed(1)}%
                                </Badge>
                                <Badge variant="outline">
                                  الثقة: {result.confidence.toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewCitizenProfile(result)}
                            >
                              <Eye className="h-4 w-4" />
                              عرض
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateCitizenReport(result)}
                            >
                              <FileText className="h-4 w-4" />
                              تقرير
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* نافذة ملف المواطن الكامل */}
        {selectedCitizen && (
          <Dialog open={!!selectedCitizen} onOpenChange={() => setSelectedCitizen(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Shield className="h-5 w-5 ml-2" />
                  الملف الشامل: {selectedCitizen.full_name}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">البيانات الشخصية</TabsTrigger>
                  <TabsTrigger value="properties">الممتلكات</TabsTrigger>
                  <TabsTrigger value="security">الحالة الأمنية</TabsTrigger>
                  <TabsTrigger value="match">نتائج المطابقة</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          {selectedCitizen.photo_url ? (
                            <img
                              src={selectedCitizen.photo_url}
                              alt={selectedCitizen.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <h2 className="text-2xl font-bold">{selectedCitizen.full_name}</h2>
                            <p className="text-muted-foreground">رقم الهوية: {selectedCitizen.national_id}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">اسم الأب: {selectedCitizen.father_name || 'غير محدد'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">تاريخ الميلاد: {selectedCitizen.date_of_birth || 'غير محدد'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">الهاتف: {selectedCitizen.phone || 'غير محدد'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">العنوان: {selectedCitizen.address || 'غير محدد'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="properties" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>الممتلكات المسجلة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {citizenProperties.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">لا توجد ممتلكات مسجلة</p>
                      ) : (
                        <div className="space-y-4">
                          {citizenProperties.map((property) => (
                            <div key={property.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex space-x-3">
                                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                    {property.property_type === 'vehicle' ? (
                                      <Car className="h-5 w-5" />
                                    ) : (
                                      <Building className="h-5 w-5" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{property.property_description}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {property.property_type === 'vehicle' ? 'مركبة' :
                                       property.property_type === 'real_estate' ? 'عقار' :
                                       property.property_type === 'business' ? 'شركة/محل تجاري' : 'أخرى'}
                                    </p>
                                    {property.registration_number && (
                                      <p className="text-sm">رقم التسجيل: {property.registration_number}</p>
                                    )}
                                    {property.value && (
                                      <p className="text-sm">القيمة التقديرية: {property.value} شيكل</p>
                                    )}
                                  </div>
                                </div>
                                <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                                  {property.status === 'active' ? 'نشط' : 'غير نشط'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>الحالة الأمنية والمخالفات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {securityRecords.length === 0 ? (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            لا توجد سجلات أمنية أو مخالفات مسجلة - السجل نظيف
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          {securityRecords.map((record) => (
                            <div key={record.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{record.description}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    التاريخ: {new Date(record.date).toLocaleDateString('ar-SA')}
                                  </p>
                                </div>
                                <Badge 
                                  variant={record.status === 'active' ? 'destructive' : 'secondary'}
                                >
                                  {record.status === 'active' ? 'نشط' : 'منتهي'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="match" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>تفاصيل المطابقة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">نسبة التطابق</Label>
                          <div className="flex items-center space-x-2">
                            <Progress value={selectedCitizen.similarity * 100} className="flex-1" />
                            <span className="text-sm font-mono">
                              {(selectedCitizen.similarity * 100).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">درجة الثقة</Label>
                          <div className="flex items-center space-x-2">
                            <Progress value={selectedCitizen.confidence} className="flex-1" />
                            <span className="text-sm font-mono">
                              {selectedCitizen.confidence.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">تقييم المطابقة</h4>
                        {selectedCitizen.similarity > 0.8 ? (
                          <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              مطابقة عالية الدقة - يمكن الاعتماد على النتيجة
                            </AlertDescription>
                          </Alert>
                        ) : selectedCitizen.similarity > 0.6 ? (
                          <Alert className="border-yellow-200 bg-yellow-50">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              مطابقة متوسطة - يُنصح بالتحقق الإضافي
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert className="border-red-200 bg-red-50">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                              مطابقة ضعيفة - قد تحتاج لتأكيد إضافي
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() => generateCitizenReport(selectedCitizen)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <FileText className="h-4 w-4 ml-2" />
                          تحميل التقرير الشامل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Canvas مخفي للتقاط الصور */}
      <canvas ref={canvasRef} className="hidden" />
    </DashboardLayout>
  );
};

export default AdvancedFaceRecognition;