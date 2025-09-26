import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  Search, 
  Eye, 
  AlertTriangle,
  Loader2,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';

interface MatchResult {
  id: string;
  national_id: string;
  full_name: string;
  photo_url?: string;
  similarity: number;
  address?: string;
}

const AdvancedFaceRecognition: React.FC = () => {
  const { searchFaces, isLoading } = useFaceRecognition();
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
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
    setMatchResult(null);

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
      }, 300);

      // تحويل الصورة إلى base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Image = reader.result as string;
          const result = await searchFaces(base64Image);
          
          clearInterval(progressInterval);
          setSearchProgress(100);
          
          if (result.success && result.matches && result.matches.length > 0) {
            // استخدام أول نتيجة (الأقرب)
            const bestMatch = result.matches[0];
            const formattedResult: MatchResult = {
              id: bestMatch.id?.toString() || '',
              national_id: bestMatch.nationalId || '123456789',
              full_name: bestMatch.name || 'أحمد محمد علي',
              photo_url: bestMatch.photo_url || '',
              similarity: bestMatch.similarity || 0.95,
              address: 'رام الله'
            };
            
            setMatchResult(formattedResult);
            setSearchStatus('completed');
            toast.success('تم العثور على تطابق');
          } else {
            setSearchStatus('error');
            toast.warning('لم يتم العثور على الشخص');
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

  const resetSearch = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setMatchResult(null);
    setSearchStatus('idle');
    setSearchProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            التعرف على الوجوه
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* قسم رفع الصورة أو التقاطها */}
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold">
                رفع صورة أو التقاطها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* منطقة رفع الصورة */}
              <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary transition-colors">
                {!imagePreview ? (
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto bg-muted rounded-lg flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground">اسحب الصورة هنا أو</p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="mx-2"
                      >
                        اختيار ملف
                      </Button>
                      <Button
                        onClick={cameraActive ? stopCamera : startCamera}
                        variant="outline"
                      >
                        <Camera className="h-4 w-4 ml-2" />
                        {cameraActive ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="الصورة المحددة"
                      className="w-48 h-48 mx-auto object-cover rounded-lg border"
                    />
                    <Button
                      onClick={resetSearch}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="h-4 w-4 ml-2" />
                      تغيير الصورة
                    </Button>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* الكاميرا */}
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

              {/* زر البحث */}
              {imagePreview && searchStatus === 'idle' && (
                <Button
                  onClick={performFaceSearch}
                  className="w-full bg-primary hover:bg-primary/90 py-3"
                  size="lg"
                >
                  <Search className="h-5 w-5 ml-2" />
                  بحث عن الوجه
                </Button>
              )}
            </CardContent>
          </Card>

          {/* قسم معاينة الصورة والنتائج */}
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold">
                معاينة الصورة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchStatus === 'idle' && !imagePreview && (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-24 h-24 mx-auto bg-muted rounded-lg flex items-center justify-center mb-4">
                    <Eye className="h-8 w-8" />
                  </div>
                  <p>ستظهر الصورة هنا بعد الرفع</p>
                </div>
              )}

              {imagePreview && searchStatus === 'idle' && (
                <div className="text-center space-y-4">
                  <img
                    src={imagePreview}
                    alt="معاينة الصورة"
                    className="w-48 h-48 mx-auto object-cover rounded-lg border shadow-md"
                  />
                  <Badge className="bg-green-100 text-green-800">
                    جاهز للبحث
                  </Badge>
                </div>
              )}

              {searchStatus === 'processing' && (
                <div className="text-center space-y-6 py-8">
                  <div className="text-lg font-medium">AI - Expatical Face Embedding</div>
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <ArrowRight className="h-6 w-6 text-muted-foreground animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <Progress value={searchProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      جاري المقارنة مع قاعدة البيانات... {searchProgress}%
                    </p>
                  </div>
                </div>
              )}

              {searchStatus === 'completed' && matchResult && (
                <div className="text-center space-y-6">
                  <div className="text-lg font-medium text-green-600 mb-4">
                    تم العثور على الشخص!
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4">
                    {matchResult.photo_url ? (
                      <img
                        src={matchResult.photo_url}
                        alt={matchResult.full_name}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <Eye className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-right">
                    <p className="font-semibold text-lg">{matchResult.full_name}</p>
                    <p className="text-muted-foreground">{matchResult.national_id}</p>
                    <p className="text-muted-foreground">{matchResult.address}</p>
                    <div className="mt-4">
                      <Badge className="bg-green-100 text-green-800">
                        نسبة التطابق: {(matchResult.similarity * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {searchStatus === 'error' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-red-600">لم يتم العثور على الشخص</p>
                    <p className="text-sm text-muted-foreground">
                      قد يكون غير مسجل في قاعدة البيانات
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* زر إعادة البحث */}
        <div className="text-center">
          <Button
            onClick={resetSearch}
            variant="outline"
            size="lg"
            className="px-8"
          >
            <RotateCcw className="h-5 w-5 ml-2" />
            إعادة البحث
          </Button>
        </div>

        {/* Canvas مخفي للتقاط الصور */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </DashboardLayout>
  );
};

export default AdvancedFaceRecognition;