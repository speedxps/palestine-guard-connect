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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('فشل في الوصول للكاميرا');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      
      context?.drawImage(video, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
          setSelectedImage(file);
          setImagePreview(URL.createObjectURL(blob));
          
          // Stop camera
          const stream = video.srcObject as MediaStream;
          stream?.getTracks().forEach(track => track.stop());
          setCameraActive(false);
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const searchSimilarFaces = async () => {
    if (!selectedImage) {
      toast.error('يرجى اختيار صورة أولاً');
      return;
    }

    setLoading(true);
    try {
      // رفع الصورة للتخزين
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `face-search-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('citizen-photos')
        .upload(fileName, selectedImage);

      if (uploadError) {
        throw uploadError;
      }

      // البحث في قاعدة البيانات عن الصور المشابهة
      // هذا مثال بسيط - في التطبيق الحقيقي ستحتاج لخدمة AI للتعرف على الوجوه
      const { data: citizens, error } = await supabase
        .from('citizens')
        .select('*')
        .not('photo_url', 'is', null)
        .limit(10);

      if (error) {
        throw error;
      }

      setResults(citizens || []);
      toast.success(`تم العثور على ${citizens?.length || 0} نتيجة محتملة`);
      
    } catch (error) {
      console.error('Error searching faces:', error);
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
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
              رفع أو التقاط صورة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                رفع صورة
              </Button>
              <Button
                onClick={startCamera}
                variant="outline"
                className="flex-1"
                disabled={cameraActive}
              >
                <Camera className="h-4 w-4 mr-2" />
                التقاط صورة
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
                  className="w-full rounded-lg"
                />
                <Button onClick={capturePhoto} className="w-full">
                  التقاط الصورة
                </Button>
              </div>
            )}

            {imagePreview && (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="الصورة المختارة"
                  className="w-full max-w-md mx-auto rounded-lg"
                />
                <Button
                  onClick={searchSimilarFaces}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'جاري البحث...' : 'البحث عن وجوه مشابهة'}
                  <Search className="h-4 w-4 mr-2" />
                </Button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
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
                {results.map((person) => (
                  <div key={person.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {person.photo_url && (
                      <img
                        src={person.photo_url}
                        alt={person.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{person.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{person.national_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {person.gender === 'male' ? 'ذكر' : person.gender === 'female' ? 'أنثى' : 'غير محدد'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      تطابق محتمل
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