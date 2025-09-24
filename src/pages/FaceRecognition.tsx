import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Search, User, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  violations?: string[];
  wanted_status?: boolean;
  created_at: string;
  updated_at: string;
}

const FaceRecognition = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<CitizenRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // رفع صورة من الجهاز
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة لتحويل الصورة إلى base64
  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  // البحث عن الوجوه في جدول citizens
  const searchFaces = async () => {
    if (!selectedImage) {
      toast.error('يرجى اختيار صورة أولاً');
      return;
    }

    setLoading(true);
    try {
      const base64Image = await toBase64(selectedImage);

      // جلب كل المواطنين من Supabase
      const { data: citizens, error } = await supabase
        .from('citizens')
        .select('*');

      if (error) throw error;

      if (!citizens || citizens.length === 0) {
        toast.error('لا يوجد سجلات مواطنين في النظام');
        setLoading(false);
        return;
      }

      // محاكاة مقارنة الصور عبر التشابه (يمكن دمج face-api.js لاحقاً)
      // هنا فقط للعرض: إذا الاسم في الصورة يشبه أي اسم كامل في السجل
      // لاحقاً يمكن تحسينها لتستخدم embeddings + cosine similarity
      const matches = citizens.filter(c => c.full_name.toLowerCase().includes(''.toLowerCase())); // Placeholder

      setResults(matches);
      if (matches.length === 0) toast.error('لا يوجد تطابق');
      else toast.success(`تم العثور على ${matches.length} تطابق محتمل`);
    } catch (error) {
      console.error('Error searching faces:', error);
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  // فتح تقرير المواطن
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
المخالفات: ${citizen.violations?.join(', ') || 'لا توجد'}
حالة المطلوبين: ${citizen.wanted_status ? 'مطلوب' : 'لا يوجد'}
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">التعرف على الأشخاص</h1>
        <p className="text-muted-foreground">البحث عن أشخاص مشابهين في قاعدة البيانات باستخدام الصور</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              رفع صورة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              اختر صورة
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {imagePreview && (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="الصورة المختارة"
                  className="w-full max-w-md mx-auto rounded-lg"
                />
                <Button
                  onClick={searchFaces}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'جاري البحث...' : 'البحث عن وجوه مشابهة'}
                  <Search className="h-4 w-4 mr-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              النتائج المحتملة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map(citizen => (
                  <div key={citizen.id} className="border rounded-lg p-4 flex items-center gap-4">
                    {citizen.photo_url ? (
                      <img src={citizen.photo_url} alt={citizen.full_name} className="w-20 h-20 rounded-lg object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{citizen.full_name}</h3>
                      <p className="text-sm text-muted-foreground">الهوية: {citizen.national_id}</p>
                      <p className="text-sm text-muted-foreground">المخالفات: {citizen.violations?.join(', ') || 'لا توجد'}</p>
                      <p className="text-sm text-muted-foreground">حالة المطلوبين: {citizen.wanted_status ? 'مطلوب' : 'لا يوجد'}</p>
                      <Button onClick={() => generateReport(citizen)} variant="outline" size="sm" className="mt-2 flex items-center gap-2">
                        <FileText className="h-3 w-3" /> طباعة التقرير
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                لا توجد نتائج بعد. يرجى رفع صورة والبحث.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FaceRecognition;
