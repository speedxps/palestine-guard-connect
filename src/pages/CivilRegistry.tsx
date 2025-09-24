import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Upload, FileText, UserCheck } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CitizenRecord {
  id: string;
  national_id: string;
  full_name: string;
  first_name?: string;
  second_name?: string;
  third_name?: string;
  family_name?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

const CivilRegistry = () => {
  const [citizens, setCitizens] = useState<CitizenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState<CitizenRecord | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    national_id: '',
    first_name: '',
    second_name: '',
    third_name: '',
    family_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    try {
      const { data, error } = await supabase
        .from('citizens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCitizens(data || []);
    } catch (error) {
      console.error('Error fetching citizens:', error);
      toast.error('خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
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
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      let photoUrl = editingCitizen?.photo_url || '';
      
      if (selectedImage) {
        photoUrl = await handleImageUpload(selectedImage);
      }

      const citizenData = {
        ...formData,
        full_name: `${formData.first_name} ${formData.second_name} ${formData.third_name} ${formData.family_name}`.trim(),
        photo_url: photoUrl
      };

      if (editingCitizen) {
        const { error } = await supabase
          .from('citizens')
          .update(citizenData)
          .eq('id', editingCitizen.id);
        
        if (error) throw error;
        toast.success('تم تحديث البيانات بنجاح');
      } else {
        const { error } = await supabase
          .from('citizens')
          .insert([citizenData]);
        
        if (error) throw error;
        toast.success('تم إضافة المواطن بنجاح');
      }

      setIsDialogOpen(false);
      setEditingCitizen(null);
      setSelectedImage(null);
      setFormData({
        national_id: '',
        first_name: '',
        second_name: '',
        third_name: '',
        family_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        address: ''
      });
      fetchCitizens();
    } catch (error) {
      console.error('Error saving citizen:', error);
      toast.error('خطأ في حفظ البيانات');
    }
  };

  const handleEdit = (citizen: CitizenRecord) => {
    setEditingCitizen(citizen);
    setFormData({
      national_id: citizen.national_id,
      first_name: citizen.first_name || '',
      second_name: citizen.second_name || '',
      third_name: citizen.third_name || '',
      family_name: citizen.family_name || '',
      date_of_birth: citizen.date_of_birth || '',
      gender: citizen.gender || '',
      phone: citizen.phone || '',
      address: citizen.address || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    
    try {
      const { error } = await supabase
        .from('citizens')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('تم حذف السجل بنجاح');
      fetchCitizens();
    } catch (error) {
      console.error('Error deleting citizen:', error);
      toast.error('خطأ في حذف السجل');
    }
  };

  const generateReport = (citizen: CitizenRecord) => {
    const reportContent = `
      تقرير مواطن
      ===========
      
      الاسم الكامل: ${citizen.full_name}
      الرقم الوطني: ${citizen.national_id}
      تاريخ الميلاد: ${citizen.date_of_birth || 'غير محدد'}
      الجنس: ${citizen.gender || 'غير محدد'}
      الهاتف: ${citizen.phone || 'غير محدد'}
      العنوان: ${citizen.address || 'غير محدد'}
      
      تاريخ التسجيل: ${new Date(citizen.created_at).toLocaleDateString('ar')}
      آخر تحديث: ${new Date(citizen.updated_at).toLocaleDateString('ar')}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_${citizen.national_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCitizens = citizens.filter(citizen =>
    citizen.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    citizen.national_id?.includes(searchTerm) ||
    citizen.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    citizen.family_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            إدارة السجل المدني الفلسطيني الذكي
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* شريط البحث والإضافة */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم أو الرقم الوطني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingCitizen(null);
                  setFormData({
                    national_id: '',
                    first_name: '',
                    second_name: '',
                    third_name: '',
                    family_name: '',
                    date_of_birth: '',
                    gender: '',
                    phone: '',
                    address: ''
                  });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة مواطن جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCitizen ? 'تعديل بيانات المواطن' : 'إضافة مواطن جديد'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>الاسم الأول</Label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>الاسم الثاني</Label>
                      <Input
                        value={formData.second_name}
                        onChange={(e) => setFormData({...formData, second_name: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>الاسم الثالث</Label>
                      <Input
                        value={formData.third_name}
                        onChange={(e) => setFormData({...formData, third_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>اسم العائلة</Label>
                      <Input
                        value={formData.family_name}
                        onChange={(e) => setFormData({...formData, family_name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>الرقم الوطني</Label>
                      <Input
                        value={formData.national_id}
                        onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>تاريخ الميلاد</Label>
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>الجنس</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
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
                      <Label>رقم الهاتف</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>العنوان</Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>الصورة الشخصية</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                      />
                      {(editingCitizen?.photo_url || selectedImage) && (
                        <Badge variant="secondary">
                          <Upload className="h-3 w-3 mr-1" />
                          صورة محددة
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSubmit} className="flex-1">
                      {editingCitizen ? 'تحديث البيانات' : 'إضافة المواطن'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* جدول البيانات */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الصورة</TableHead>
                  <TableHead>الاسم الكامل</TableHead>
                  <TableHead>الرقم الوطني</TableHead>
                  <TableHead>تاريخ الميلاد</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : filteredCitizens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      لا توجد سجلات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCitizens.map((citizen) => (
                    <TableRow key={citizen.id}>
                      <TableCell>
                        {citizen.photo_url ? (
                          <img 
                            src={citizen.photo_url} 
                            alt={citizen.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <UserCheck className="h-5 w-5" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{citizen.full_name}</TableCell>
                      <TableCell>{citizen.national_id}</TableCell>
                      <TableCell>{citizen.date_of_birth || 'غير محدد'}</TableCell>
                      <TableCell>{citizen.phone || 'غير محدد'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(citizen)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => generateReport(citizen)}
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(citizen.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CivilRegistry;