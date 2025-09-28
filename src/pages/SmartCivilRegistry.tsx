import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Camera, 
  FileText, 
  User, 
  Car, 
  Home, 
  Building,
  Download,
  History,
  Eye,
  MapPin,
  Phone,
  Calendar,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BatchProcessEmbeddings from '@/components/BatchProcessEmbeddings';

interface Citizen {
  id: string;
  national_id: string;
  first_name: string;
  second_name?: string;
  third_name?: string;
  family_name: string;
  father_name?: string;
  full_name: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  photo_url?: string;
  face_embedding?: string;
  has_vehicle: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_modified_by?: string;
  last_modified_at?: string;
}

interface CitizenProperty {
  id: string;
  citizen_id: string;
  property_type: string;
  property_description: string;
  property_details: any;
  registration_number?: string;
  value?: number;
  status: string;
  created_at: string;
}

interface AuditLog {
  id: string;
  citizen_id?: string;
  action_type: string;
  old_values?: any;
  new_values?: any;
  performed_by?: string;
  performed_at: string;
}

const SmartCivilRegistry: React.FC = () => {
  const { user } = useAuth();
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [filteredCitizens, setFilteredCitizens] = useState<Citizen[]>([]);
  const [properties, setProperties] = useState<CitizenProperty[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState<Citizen | null>(null);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [formData, setFormData] = useState({
    national_id: '',
    first_name: '',
    second_name: '',
    third_name: '',
    family_name: '',
    father_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    address: '',
    has_vehicle: false
  });

  const [propertyData, setPropertyData] = useState({
    property_type: 'vehicle',
    property_description: '',
    registration_number: '',
    value: '',
    property_details: '{}'
  });

  useEffect(() => {
    fetchCitizens();
  }, []);

  useEffect(() => {
    filterCitizens();
  }, [searchTerm, citizens]);

  const fetchCitizens = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('citizens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCitizens(data || []);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      toast.error('فشل في جلب بيانات المواطنين');
    } finally {
      setLoading(false);
    }
  };

  const fetchCitizenProperties = async (citizenId: string) => {
    try {
      const { data, error } = await supabase
        .from('citizen_properties')
        .select('*')
        .eq('citizen_id', citizenId);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('خطأ في جلب الممتلكات:', error);
    }
  };

  const fetchAuditLogs = async (citizenId: string) => {
    try {
      const { data, error } = await supabase
        .from('citizen_audit_log')
        .select('*')
        .eq('citizen_id', citizenId)
        .order('performed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('خطأ في جلب السجل:', error);
    }
  };

  const filterCitizens = () => {
    if (!searchTerm.trim()) {
      setFilteredCitizens(citizens);
      return;
    }

    const filtered = citizens.filter(citizen => 
      citizen.national_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      citizen.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      citizen.family_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      citizen.father_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${citizen.first_name} ${citizen.family_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${citizen.first_name} ${citizen.second_name} ${citizen.family_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredCitizens(filtered);
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `citizen-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('citizen-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('citizen-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      toast.error('فشل في رفع الصورة');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let photoUrl = null;
      if (imageFile) {
        photoUrl = await handleImageUpload(imageFile);
        if (!photoUrl) return;
      }

      const citizenData = {
        ...formData,
        full_name: `${formData.first_name} ${formData.second_name || ''} ${formData.third_name || ''} ${formData.family_name}`.replace(/\s+/g, ' ').trim(),
        photo_url: photoUrl || (editingCitizen?.photo_url || null),
        created_by: user?.id,
        last_modified_by: user?.id,
        last_modified_at: new Date().toISOString()
      };

      let citizenResult;
      if (editingCitizen) {
        const { data, error } = await supabase
          .from('citizens')
          .update(citizenData)
          .eq('id', editingCitizen.id)
          .select()
          .single();
        
        if (error) throw error;
        citizenResult = data;
        toast.success('تم تحديث بيانات المواطن بنجاح');
      } else {
        const { data, error } = await supabase
          .from('citizens')
          .insert([citizenData])
          .select()
          .single();
        
        if (error) throw error;
        citizenResult = data;
        toast.success('تم إضافة المواطن بنجاح');
      }

      // إذا تم رفع صورة جديدة، قم بتوليد face embedding
      if (imageFile && photoUrl && citizenResult) {
        try {
          console.log('بدء توليد face embedding للمواطن:', citizenResult.full_name);
          
          // تحويل الصورة إلى base64
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64Image = reader.result as string;
              const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-face-embedding', {
                body: { 
                  citizenId: citizenResult.id, 
                  imageBase64: base64Image 
                }
              });

              if (embeddingError) {
                console.error('خطأ في توليد face embedding:', embeddingError);
                toast.warning('تم حفظ البيانات ولكن فشل في توليد الوصف الذكي للوجه');
              } else {
                console.log('تم توليد face embedding بنجاح');
                toast.success('تم حفظ البيانات وتوليد الوصف الذكي للوجه بنجاح');
              }
            } catch (error) {
              console.error('خطأ في معالجة face embedding:', error);
            }
          };
          reader.readAsDataURL(imageFile);
        } catch (error) {
          console.error('خطأ في توليد face embedding:', error);
        }
      }

      setIsDialogOpen(false);
      setEditingCitizen(null);
      resetForm();
      fetchCitizens();
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      toast.error('فشل في حفظ البيانات');
    }
  };

  const handleEdit = (citizen: Citizen) => {
    setEditingCitizen(citizen);
    setFormData({
      national_id: citizen.national_id || '',
      first_name: citizen.first_name || '',
      second_name: citizen.second_name || '',
      third_name: citizen.third_name || '',
      family_name: citizen.family_name || '',
      father_name: citizen.father_name || '',
      date_of_birth: citizen.date_of_birth || '',
      gender: citizen.gender || '',
      phone: citizen.phone || '',
      address: citizen.address || '',
      has_vehicle: citizen.has_vehicle || false
    });
    setImagePreview(citizen.photo_url || null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (citizenId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المواطن؟ سيتم حذف جميع البيانات المرتبطة به.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('citizens')
        .delete()
        .eq('id', citizenId);

      if (error) throw error;
      toast.success('تم حذف المواطن بنجاح');
      fetchCitizens();
    } catch (error) {
      console.error('خطأ في حذف المواطن:', error);
      toast.error('فشل في حذف المواطن');
    }
  };

  const addProperty = async () => {
    if (!selectedCitizen) return;

    try {
      const propertyDetails = JSON.parse(propertyData.property_details);
      const { error } = await supabase
        .from('citizen_properties')
        .insert([{
          citizen_id: selectedCitizen.id,
          property_type: propertyData.property_type,
          property_description: propertyData.property_description,
          registration_number: propertyData.registration_number,
          value: propertyData.value ? parseFloat(propertyData.value) : null,
          property_details: propertyDetails,
          created_by: user?.id
        }]);

      if (error) throw error;
      toast.success('تم إضافة الممتلكات بنجاح');
      setPropertyData({
        property_type: 'vehicle',
        property_description: '',
        registration_number: '',
        value: '',
        property_details: '{}'
      });
      fetchCitizenProperties(selectedCitizen.id);
    } catch (error) {
      console.error('خطأ في إضافة الممتلكات:', error);
      toast.error('فشل في إضافة الممتلكات');
    }
  };

  const resetForm = () => {
    setFormData({
      national_id: '',
      first_name: '',
      second_name: '',
      third_name: '',
      family_name: '',
      father_name: '',
      date_of_birth: '',
      gender: '',
      phone: '',
      address: '',
      has_vehicle: false
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const generateReport = async (citizen: Citizen) => {
    try {
      await fetchCitizenProperties(citizen.id);
      const reportContent = `
تقرير مواطن
=============

البيانات الشخصية:
الاسم الكامل: ${citizen.full_name}
رقم الهوية: ${citizen.national_id}
اسم الأب: ${citizen.father_name || 'غير محدد'}
تاريخ الميلاد: ${citizen.date_of_birth || 'غير محدد'}
الجنس: ${citizen.gender === 'male' ? 'ذكر' : citizen.gender === 'female' ? 'أنثى' : 'غير محدد'}
رقم الهاتف: ${citizen.phone || 'غير محدد'}
العنوان: ${citizen.address || 'غير محدد'}

الممتلكات:
${properties.map(p => `- ${p.property_description} (${p.property_type})`).join('\n') || 'لا توجد ممتلكات مسجلة'}

تاريخ الإنشاء: ${new Date(citizen.created_at).toLocaleDateString('ar-SA')}
آخر تحديث: ${citizen.last_modified_at ? new Date(citizen.last_modified_at).toLocaleDateString('ar-SA') : 'لم يتم التحديث'}
      `;

      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `تقرير_${citizen.full_name}_${citizen.national_id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تحميل التقرير بنجاح');
    } catch (error) {
      console.error('خطأ في إنشاء التقرير:', error);
      toast.error('فشل في إنشاء التقرير');
    }
  };

  const viewCitizenDetails = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    fetchCitizenProperties(citizen.id);
    fetchAuditLogs(citizen.id);
    setActiveTab('overview');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">السجل المدني الفلسطيني الذكي</h1>
            <p className="text-muted-foreground mt-2">إدارة شاملة لبيانات المواطنين والتعرف على الوجوه</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 ml-2" />
                إضافة مواطن جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCitizen ? 'تعديل بيانات المواطن' : 'إضافة مواطن جديد'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="national_id">رقم الهوية *</Label>
                    <Input
                      id="national_id"
                      value={formData.national_id}
                      onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="first_name">الاسم الأول *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="second_name">الاسم الثاني</Label>
                    <Input
                      id="second_name"
                      value={formData.second_name}
                      onChange={(e) => setFormData({...formData, second_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="third_name">الاسم الثالث</Label>
                    <Input
                      id="third_name"
                      value={formData.third_name}
                      onChange={(e) => setFormData({...formData, third_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="family_name">اسم العائلة *</Label>
                    <Input
                      id="family_name"
                      value={formData.family_name}
                      onChange={(e) => setFormData({...formData, family_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="father_name">اسم الأب</Label>
                    <Input
                      id="father_name"
                      value={formData.father_name}
                      onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">الجنس</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({...formData, gender: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الجنس" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">العنوان</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="photo">الصورة الشخصية</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onload = () => setImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingCitizen ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* مكون معالجة الصور بالذكاء الاصطناعي */}
        <BatchProcessEmbeddings />

        {/* شريط البحث */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث بالاسم أو رقم الهوية أو اسم الأب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* جدول المواطنين */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 ml-2" />
              قائمة المواطنين ({filteredCitizens.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الصورة</TableHead>
                      <TableHead>رقم الهوية</TableHead>
                      <TableHead>الاسم الكامل</TableHead>
                      <TableHead>اسم الأب</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>تاريخ الإنشاء</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCitizens.map((citizen) => (
                      <TableRow key={citizen.id}>
                        <TableCell>
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                            {citizen.photo_url ? (
                              <img 
                                src={citizen.photo_url} 
                                alt={citizen.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{citizen.national_id}</TableCell>
                        <TableCell className="font-semibold">{citizen.full_name}</TableCell>
                        <TableCell>{citizen.father_name || '-'}</TableCell>
                        <TableCell>{citizen.phone || '-'}</TableCell>
                        <TableCell>{new Date(citizen.created_at).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            نشط
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewCitizenDetails(citizen)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(citizen)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => generateReport(citizen)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(citizen.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* مكون معالجة صور المواطنين بالذكاء الاصطناعي */}
        <BatchProcessEmbeddings />

        {/* نافذة تفاصيل المواطن */}
        {selectedCitizen && (
          <Dialog open={!!selectedCitizen} onOpenChange={() => setSelectedCitizen(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Shield className="h-5 w-5 ml-2" />
                  ملف المواطن: {selectedCitizen.full_name}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                  <TabsTrigger value="properties">الممتلكات</TabsTrigger>
                  <TabsTrigger value="security">الحالة الأمنية</TabsTrigger>
                  <TabsTrigger value="history">السجل</TabsTrigger>
                </TabsList>

                {/* ... باقي محتوى التابات */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>البيانات الشخصية</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                            {selectedCitizen.photo_url ? (
                              <img 
                                src={selectedCitizen.photo_url} 
                                alt={selectedCitizen.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{selectedCitizen.full_name}</h3>
                            <p className="text-muted-foreground">{selectedCitizen.national_id}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">اسم الأب:</span>
                            <p className="font-medium">{selectedCitizen.father_name || 'غير محدد'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">تاريخ الميلاد:</span>
                            <p className="font-medium">{selectedCitizen.date_of_birth || 'غير محدد'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">الجنس:</span>
                            <p className="font-medium">
                              {selectedCitizen.gender === 'male' ? 'ذكر' : selectedCitizen.gender === 'female' ? 'أنثى' : 'غير محدد'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">الهاتف:</span>
                            <p className="font-medium">{selectedCitizen.phone || 'غير محدد'}</p>
                          </div>
                        </div>
                        
                        {selectedCitizen.address && (
                          <div>
                            <span className="text-muted-foreground">العنوان:</span>
                            <p className="font-medium">{selectedCitizen.address}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="properties" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>إضافة ممتلكات جديدة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>نوع الممتلكات</Label>
                          <Select
                            value={propertyData.property_type}
                            onValueChange={(value) => setPropertyData({...propertyData, property_type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vehicle">مركبة</SelectItem>
                              <SelectItem value="real_estate">عقار</SelectItem>
                              <SelectItem value="business">شركة/محل تجاري</SelectItem>
                              <SelectItem value="other">أخرى</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>الوصف</Label>
                          <Input
                            value={propertyData.property_description}
                            onChange={(e) => setPropertyData({...propertyData, property_description: e.target.value})}
                            placeholder="وصف الممتلكات"
                          />
                        </div>
                        <div>
                          <Label>رقم التسجيل</Label>
                          <Input
                            value={propertyData.registration_number}
                            onChange={(e) => setPropertyData({...propertyData, registration_number: e.target.value})}
                            placeholder="رقم اللوحة أو رقم التسجيل"
                          />
                        </div>
                        <div>
                          <Label>القيمة التقديرية</Label>
                          <Input
                            type="number"
                            value={propertyData.value}
                            onChange={(e) => setPropertyData({...propertyData, value: e.target.value})}
                            placeholder="القيمة بالشيكل"
                          />
                        </div>
                      </div>
                      <Button onClick={addProperty} className="mt-4">
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>الممتلكات المسجلة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {properties.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">لا توجد ممتلكات مسجلة</p>
                      ) : (
                        <div className="space-y-2">
                          {properties.map((property) => (
                            <div key={property.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start">
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
                                    <p className="text-sm">القيمة: {property.value} شيكل</p>
                                  )}
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
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      سيتم عرض المخالفات والحالة الأمنية للمواطن هنا من الأنظمة المرتبطة
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>سجل العمليات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {auditLogs.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">لا توجد عمليات مسجلة</p>
                      ) : (
                        <div className="space-y-2">
                          {auditLogs.map((log) => (
                            <div key={log.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Badge variant="outline">
                                    {log.action_type === 'create' ? 'إنشاء' :
                                     log.action_type === 'update' ? 'تحديث' :
                                     log.action_type === 'delete' ? 'حذف' : 'عرض'}
                                  </Badge>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {new Date(log.performed_at).toLocaleString('ar-SA')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SmartCivilRegistry;