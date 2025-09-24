import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FaceRecognition = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const searchFaces = async () => {
    if (!selectedImage) return toast.error('يرجى اختيار صورة أولاً');
    setLoading(true);
    try {
      // رفع الصورة أولاً
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `face-search/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('face-search')
        .upload(filePath, selectedImage);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('face-search')
        .getPublicUrl(filePath);

      // البحث عن تطابق مع السجلات
      const { data: citizens, error } = await supabase
        .from('citizens')
        .select('*');
      if (error) throw error;

      // مقارنة بسيطة باستخدام اسم الصورة فقط (يمكن تطويرها لاحقاً)
      const matches = citizens.filter(c =>
        c.photo_url && c.photo_url === publicUrl
      );

      if (matches.length > 0) {
        setResults(matches);
        toast.success(`تم العثور على ${matches.length} تطابق محتمل`);
      } else {
        setResults([]);
        toast.error('لا يوجد تطابق');
      }
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            التعرف على الوجه
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              <Upload className="h-4 w-4 mr-2" /> رفع صورة
            </Button>
            <Button onClick={searchFaces} variant="primary" disabled={loading}>
              {loading ? 'جاري البحث...' : 'البحث عن تطابق'}
              <Search className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          {imagePreview && <img src={imagePreview} alt="صورة" className="w-64 h-64 object-cover rounded-lg" />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>النتائج المحتملة</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((c) => (
                <div key={c.id} className="flex items-center gap-4 border p-2 rounded-lg">
                  <img src={c.photo_url} alt={c.full_name} className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold">{c.full_name}</p>
                    <p className="text-sm text-muted-foreground">الهوية: {c.national_id}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">لا توجد نتائج بعد.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceRecognition;
