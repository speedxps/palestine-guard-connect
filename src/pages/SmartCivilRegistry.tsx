import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

const MAX_IMAGE_SIZE_MB = 5;

const SmartCivilRegistry: React.FC = () => {
  const { user } = useAuth();
  const [citizens, setCitizens] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    national_id: '',
    first_name: '',
    family_name: ''
  });

  useEffect(() => { fetchCitizens(); }, []);

  const fetchCitizens = async () => {
    const { data, error } = await supabase.from('citizens').select('*').order('created_at', { ascending: false });
    if (!error) setCitizens(data || []);
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
      toast.error('فشل في رفع الصورة');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const analyzeFace = async (citizenId: string, imageBase64: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-face', {
        body: { citizenId, imageBase64 }
      });
      if (error) throw error;
      setReport(data);
    } catch (err) {
      toast.error("فشل تحليل الصورة");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let photoUrl = null;
      if (imageFile) photoUrl = await handleImageUpload(imageFile);
      if (imageFile && !photoUrl) return;

      const citizenData = {
        ...formData,
        full_name: `${formData.first_name} ${formData.family_name}`.trim(),
        photo_url: photoUrl,
        created_by: user?.id,
        last_modified_by: user?.id,
        last_modified_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('citizens').insert([citizenData]).select().single();
      if (error) throw error;

      toast.success("تم إضافة المواطن بنجاح");

      // لو في صورة -> نحللها
      if (imageFile && photoUrl && data) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Image = reader.result;
          if (typeof base64Image === "string") {
            await analyzeFace(data.id, base64Image);
          }
        };
        reader.readAsDataURL(imageFile);
      }

      setIsDialogOpen(false);
      setImageFile(null);
      setImagePreview(null);
      fetchCitizens();
    } catch (err) {
      toast.error("فشل في حفظ البيانات");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">السجل المدني الفلسطيني الذكي</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setReport(null)}>إضافة مواطن جديد</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>إضافة مواطن جديد</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>الاسم الأول</Label>
                  <Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                </div>
                <div>
                  <Label>اسم العائلة</Label>
                  <Input value={formData.family_name} onChange={(e) => setFormData({ ...formData, family_name: e.target.value })} />
                </div>
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
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
                {uploading && <p className="text-sm text-muted-foreground">جاري رفع الصورة...</p>}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="submit">إضافة</Button>
                </div>
              </form>

              {report && (
                <div className="mt-6 space-y-4">
                  <Card>
                    <CardHeader><CardTitle>📋 تقرير تحليل الوجه</CardTitle></CardHeader>
                    <CardContent>
                      <p>👤 العمر التقريبي: {report.age}</p>
                      <p>🚻 الجنس: {report.gender}</p>
                      <p>👥 عدد الوجوه: {report.faces_detected}</p>
                      <p>🌟 جودة الصورة: {Math.round(report.quality_score * 100)}%</p>
                      <p>🔢 درجة الثقة: {Math.round(report.confidence * 100)}%</p>
                    </CardContent>
                  </Card>

                  {report.similar_faces?.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle>🔍 أقرب الوجوه</CardTitle></CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>الاسم</TableHead>
                              <TableHead>النسبة</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.similar_faces.map((f: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>{f.full_name}</TableCell>
                                <TableCell>{Math.round(f.similarity * 100)}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmartCivilRegistry;
