import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BatchProcessEmbeddings from '@/components/BatchProcessEmbeddings';

const MAX_IMAGE_SIZE_MB = 5;

const SmartCivilRegistry: React.FC = () => {
  const { user } = useAuth();
  const [citizens, setCitizens] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => { fetchCitizens(); }, []);

  const fetchCitizens = async () => {
    try {
      const { data, error } = await supabase.from('citizens').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCitizens(data || []);
    } catch (error) {
      console.error(error);
      toast.error('فشل في جلب بيانات المواطنين');
    }
  };

  const handleImageUpload = async (file: File) => {
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`حجم الصورة أكبر من ${MAX_IMAGE_SIZE_MB} ميغابايت`);
      return null;
    }
    try {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const filePath = `citizen-photos/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('citizen-photos').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('citizen-photos').getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error(error);
      toast.error('فشل في رفع الصورة');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let photoUrl = null;
      if (imageFile) photoUrl = await handleImageUpload(imageFile);
      if (imageFile && !photoUrl) return;

      // دمج البيانات القديمة مع الجديدة لتجنب الحذف
      const citizenData = editingCitizen
        ? { ...editingCitizen, ...formData, photo_url: photoUrl || editingCitizen.photo_url, last_modified_by: user?.id, last_modified_at: new Date().toISOString() }
        : { ...formData, full_name: `${formData.first_name} ${formData.second_name || ''} ${formData.third_name || ''} ${formData.family_name}`.trim(), photo_url: photoUrl || null, created_by: user?.id, last_modified_by: user?.id, last_modified_at: new Date().toISOString() };

      let citizenResult;
      if (editingCitizen) {
        const { data, error } = await supabase.from('citizens').update(citizenData).eq('id', editingCitizen.id).select().single();
        if (error) throw error;
        citizenResult = data;
        toast.success('تم تحديث بيانات المواطن بنجاح');
      } else {
        const { data, error } = await supabase.from('citizens').insert([citizenData]).select().single();
        if (error) throw error;
        citizenResult = data;
        toast.success('تم إضافة المواطن بنجاح');
      }

      setIsDialogOpen(false);
      setEditingCitizen(null);
      resetForm();
      fetchCitizens();
    } catch (error) {
      console.error(error);
      toast.error('فشل في حفظ البيانات');
    }
  };

  const resetForm = () => {
    setFormData({ national_id: '', first_name: '', second_name: '', third_name: '', family_name: '', father_name: '', date_of_birth: '', gender: '', phone: '', address: '', has_vehicle: false });
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">السجل المدني الفلسطيني الذكي</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
                إضافة مواطن جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingCitizen ? 'تعديل بيانات المواطن' : 'إضافة مواطن جديد'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="photo">الصورة الشخصية</Label>
                  <Input id="photo" type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onload = () => setImagePreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg hover:scale-105 transition-transform" />
                    </div>
                  )}
                  {uploading && <p className="text-sm text-muted-foreground">جاري رفع الصورة...</p>}
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                  <Button type="submit">{editingCitizen ? 'تحديث' : 'إضافة'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <BatchProcessEmbeddings />
      </div>
    </DashboardLayout>
  );
};

export default SmartCivilRegistry;
