import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';

const FaceRecognition = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchingAnimation, setSearchingAnimation] = useState(false);
  const [currentFakeImage, setCurrentFakeImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  
  // استخدام hook التعرف على الوجوه
  const { searchFaces, isLoading: faceLoading } = useFaceRecognition();

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
    setSearchingAnimation(true);
    setResults([]);
    
    // توليد 100 صورة وهمية باستخدام خدمة pravatar
    const fakeImages = Array.from({ length: 100 }, (_, i) => 
      `https://i.pravatar.cc/300?img=${(i % 70) + 1}&random=${Math.random()}`
    );
    
    try {
      // تحويل الصورة إلى base64 لإرسالها للـ AI
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        // بدء الأنيميشن مع البحث - عرض 100 صورة
        let imageCounter = 0;
        const animationInterval = setInterval(() => {
          if (imageCounter < fakeImages.length) {
            setCurrentFakeImage(fakeImages[imageCounter]);
            imageCounter++;
          }
        }, 40); // تغيير الصورة كل 40ms (سيستغرق 4 ثواني لعرض 100 صورة)
        
        try {
          // البحث باستخدام النظام المحسن
          const searchResult = await searchFaces(imageData);
          
          // انتظار انتهاء الأنيميشن
          await new Promise(resolve => setTimeout(resolve, 4000));
          
          // إيقاف الأنيميشن
          clearInterval(animationInterval);
          
          if (!searchResult.success) {
            toast.error(searchResult.error || 'فشل في البحث');
            setLoading(false);
            setSearchingAnimation(false);
            return;
          }

          if (searchResult.matches && searchResult.matches.length > 0) {
            // تحويل النتائج للتنسيق المطلوب
            const formattedResults = searchResult.matches.map(match => ({
              id: match.id,
              full_name: match.name,
              national_id: match.nationalId,
              photo_url: match.photo_url,
              similarity: match.similarity,
              source: match.source,
              role: match.role
            }));
            
            // إظهار الصورة الحقيقية النهائية لمدة ثانية
            setCurrentFakeImage(formattedResults[0].photo_url);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setResults(formattedResults);
            setSearchingAnimation(false);
            toast.success(`تم العثور على ${formattedResults.length} تطابق محتمل`);
          } else {
            setResults([]);
            setSearchingAnimation(false);
            toast.error('لا يوجد تطابق أعلى من 70%');
          }
          
        } catch (error) {
          clearInterval(animationInterval);
          console.error('Error in face recognition:', error);
          toast.error('حدث خطأ في التعرف على الوجه');
          setSearchingAnimation(false);
        } finally {
          setLoading(false);
        }
      };
      
      reader.readAsDataURL(selectedImage);
      
    } catch (error) {
      console.error('Error searching faces:', error);
      toast.error('حدث خطأ أثناء البحث');
      setLoading(false);
      setSearchingAnimation(false);
    }
  };

  // دالة حساب التشابه (cosine similarity)
  const cosineSimilarity = (a: Float32Array, b: Float32Array): number => {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
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
                  disabled={loading || faceLoading}
                  className="w-full"
                >
                  {loading || faceLoading ? 'جاري البحث...' : 'البحث عن وجوه مشابهة'}
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
            {searchingAnimation && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="relative w-48 h-48 rounded-lg overflow-hidden border-4 border-primary animate-pulse">
                  {currentFakeImage && (
                    <img
                      src={currentFakeImage}
                      alt="جاري البحث"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-primary animate-pulse">
                    جاري البحث في قاعدة البيانات...
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    يتم الآن فحص آلاف الصور للعثور على التطابق
                  </p>
                </div>
              </div>
            )}
            
            {!searchingAnimation && results.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  أفضل {results.length} تطابق (الحد الأدنى 70%)
                </div>
                {results.map((person, index) => (
                  <div key={person.id} className="border rounded-lg overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      {person.photo_url ? (
                        <img
                          src={person.photo_url}
                          alt={person.full_name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                          <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{person.full_name}</h3>
                          <span className="text-sm px-2 py-1 rounded text-white bg-primary">
                            #{index + 1}
                          </span>
                        </div>
                        {person.national_id && (
                          <p className="text-sm text-muted-foreground">
                            الهوية: {person.national_id}
                          </p>
                        )}
                        {person.role && (
                          <p className="text-sm text-muted-foreground">
                            الدور: {person.role}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-sm px-2 py-1 rounded text-white ${
                            person.source === 'wanted_person' 
                              ? 'bg-destructive' 
                              : 'bg-blue-600'
                          }`}>
                            {person.source === 'wanted_person' 
                              ? 'مطلوب/قضية' 
                              : 'ضابط شرطة'
                            }
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            تطابق: {Math.round(person.similarity * 100)}%
                          </span>
                        </div>
                      </div>
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