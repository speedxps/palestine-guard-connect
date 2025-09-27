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
  User, 
  Download, 
  Eye, 
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

  // New state for security
  const [securityStatus, setSecurityStatus] = useState<{level: string, notes: string[]}>({level: 'آمن', notes: []});

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

  // Fetch security status
  const fetchSecurityStatus = async (citizenId: string) => {
    try {
      const { data, error } = await supabase
        .from('security_status')
        .select('*')
        .eq('citizen_id', citizenId)
        .single();
      if (error) throw error;
      setSecurityStatus({level: data.level || 'آمن', notes: data.notes || []});
    } catch (error) {
      console.error('خطأ في جلب الحالة الأمنية:', error);
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
      `${citizen.first_name} ${citizen.family_name}`.toLowerCase().includes(searchTerm.toLowerCase())
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

      // Generate face embedding (existing logic)
      if (imageFile && photoUrl && citizenResult) {
        try {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64Image = reader.result as string;
              const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-face-embedding', {
                body: { citizenId: citizenResult.id, imageBase64: base64Image }
              });
              if (embeddingError) {
                console.error('خطأ في توليد face embedding:', embeddingError);
                toast.warning('تم حفظ البيانات ولكن فشل في توليد الوصف الذكي للوجه');
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
    if (!confirm('هل أنت متأكد من حذف هذا المواطن؟ سيتم حذف جميع البيانات المرتبطة به.')) return;
    try {
      const { error } = await supabase.from('citizens').delete().eq('id', citizenId);
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
          ...propertyData,
          property_details: propertyDetails,
          value: Number(propertyData.value) || 0,
          status: 'مسجل',
          created_at: new Date().toISOString()
        }]);
      if (error) throw error;
      toast.success('تم إضافة الممتلكات بنجاح');
      setPropertyData({property_type: 'vehicle', property_description: '', registration_number: '', value: '', property_details: '{}'});
      fetchCitizenProperties(selectedCitizen.id);
    } catch (error) {
      console.error('خطأ في إضافة الممتلكات:', error);
      toast.error('فشل في إضافة الممتلكات');
    }
  };

  const calculateTotalPropertyValue = () => properties.reduce((total, p) => total + (p.value || 0), 0);

  const viewCitizenDetails = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    fetchCitizenProperties(citizen.id);
    fetchAuditLogs(citizen.id);
    fetchSecurityStatus(citizen.id);
    setActiveTab('overview');
  };

  const generateReport = async (citizen: Citizen) => {
    try {
      await fetchCitizenProperties(citizen.id);
      await fetchSecurityStatus(citizen.id);

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
القيمة الإجمالية للممتلكات: ${calculateTotalPropertyValue()} شيكل

الحالة الأمنية: ${securityStatus.level}
ملاحظات أمنية:
${securityStatus.notes.join('\n') || 'لا توجد ملاحظات'}

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
    setEditingCitizen(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>المواطنون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Input
                placeholder="بحث بالاسم أو رقم الهوية"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-1 h-4 w-4" /> إضافة مواطن
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingCitizen ? 'تعديل المواطن' : 'إضافة مواطن جديد'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-2">
                    {/* Form inputs هنا */}
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم الكامل</TableHead>
                  <TableHead>رقم الهوية</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCitizens.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.full_name}</TableCell>
                    <TableCell>{c.national_id}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => viewCitizenDetails(c)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleEdit(c)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => generateReport(c)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tabs لتفاصيل المواطن */}
        {selectedCitizen && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">الملخص</TabsTrigger>
              <TabsTrigger value="properties">الممتلكات</TabsTrigger>
              <TabsTrigger value="security">الحالة الأمنية</TabsTrigger>
              <TabsTrigger value="audit">سجل التعديلات</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <p>الاسم الكامل: {selectedCitizen.full_name}</p>
              <p>رقم الهوية: {selectedCitizen.national_id}</p>
              <p>الهاتف: {selectedCitizen.phone || 'غير محدد'}</p>
              <p>العنوان: {selectedCitizen.address || 'غير محدد'}</p>
            </TabsContent>

            <TabsContent value="properties" className="space-y-2">
              <ul className="list-disc list-inside">
                {properties.map(p => <li key={p.id}>{p.property_description} ({p.property_type}) - {p.value || 0} شيكل</li>)}
              </ul>
              <p className="font-semibold">القيمة الإجمالية للممتلكات: {calculateTotalPropertyValue()} شيكل</p>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  الحالة الأمنية: <Badge variant={securityStatus.level === 'خطر' ? 'destructive' : 'default'} className="mx-2">{securityStatus.level}</Badge>
                </AlertDescription>
              </Alert>
              {securityStatus.notes.length > 0 ? (
                <ul className="mt-2 list-disc list-inside">
                  {securityStatus.notes.map((note, idx) => <li key={idx}>{note}</li>)}
                </ul>
              ) : (
                <p className="text-muted-foreground">لا توجد ملاحظات أمنية</p>
              )}
            </TabsContent>

            <TabsContent value="audit" className="space-y-2">
              <ul className="list-disc list-inside">
                {auditLogs.map(log => (
                  <li key={log.id}>
                    {log.action_type} بواسطة {log.performed_by} في {new Date(log.performed_at).toLocaleString('ar-SA')}
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SmartCivilRegistry;
