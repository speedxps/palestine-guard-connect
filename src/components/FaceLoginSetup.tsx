import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Check, X, RefreshCw, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';


interface FaceLoginSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FaceLoginSetup: React.FC<FaceLoginSetupProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'capture' | 'confirm' | 'processing'>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "خطأ في الكاميرا",
        description: "فشل في الوصول للكاميرا. تأكد من إعطاء الإذن للتطبيق.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      
      context?.drawImage(video, 0, 0);
      
      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      setStep('confirm');
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setStep('capture');
    startCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
        setStep('confirm');
      };
      reader.readAsDataURL(file);
    }
  };

  const processFaceData = async () => {
    if (!capturedImage || !user) return;

    setLoading(true);
    setStep('processing');

    try {
      const imageBase64 = capturedImage.split(',')[1];

      console.log('🔐 Saving face data via Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('save-face-data', {
        body: { userId: user.id, imageBase64 }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'فشل في حفظ بيانات الوجه');
      }

      console.log('✅ Face data saved successfully');

      localStorage.setItem('faceLoginEnabled', 'true');

      toast({
        title: "✅ تم حفظ بيانات الوجه",
        description: "تم تسجيل وجهك بنجاح باستخدام الذكاء الاصطناعي. يمكنك الآن استخدام تسجيل الدخول بالوجه.",
      });

      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error processing face data:', error);
      toast({
        title: "❌ خطأ في المعالجة",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء معالجة بيانات الوجه",
        variant: "destructive",
      });
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setStep('capture');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic text-center">
            إعداد تسجيل الدخول بالوجه
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'capture' && (
            <>
              <div className="text-center space-y-3">
                <Camera className="h-16 w-16 text-primary mx-auto" />
                <h3 className="font-semibold font-arabic text-lg">التقط صورة واضحة لوجهك</h3>
                <p className="text-sm text-muted-foreground font-arabic">
                  سيتم استخدام الذكاء الاصطناعي للتعرف على وجهك وحماية بياناتك
                </p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-400 font-arabic">
                    ✓ تشفير متقدم للبيانات<br/>
                    ✓ لا يتم حفظ الصور الأصلية<br/>
                    ✓ معالجة آمنة بالذكاء الاصطناعي
                  </p>
                </div>
              </div>

              {cameraActive ? (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg border shadow-lg"
                    />
                    <div className="absolute inset-0 border-2 border-primary/30 rounded-lg pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-primary rounded-lg opacity-50"></div>
                    </div>
                  </div>
                  <Button onClick={capturePhoto} className="w-full" size="lg">
                    <Camera className="h-4 w-4 mr-2" />
                    التقاط الصورة
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button onClick={startCamera} className="w-full" size="lg">
                    <Camera className="h-4 w-4 mr-2" />
                    تشغيل الكاميرا الأمامية
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-arabic mb-2">أو</p>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      size="lg"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      رفع صورة من المعرض
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'confirm' && capturedImage && (
            <>
              <div className="text-center space-y-2">
                <h3 className="font-semibold font-arabic">تأكيد الصورة</h3>
                <p className="text-sm text-muted-foreground font-arabic">
                  هل تريد استخدام هذه الصورة لتسجيل الدخول؟
                </p>
              </div>

              <div className="relative">
                <img
                  src={capturedImage}
                  alt="الصورة الملتقطة"
                  className="w-full rounded-lg border"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={retakePhoto}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  إعادة التقاط
                </Button>
                <Button
                  onClick={processFaceData}
                  disabled={loading}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {loading ? 'معالجة...' : 'تأكيد وحفظ'}
                </Button>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-4">
              <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <h3 className="font-semibold font-arabic text-lg">جاري معالجة بيانات الوجه...</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-arabic">
                  🤖 تشغيل نموذج الذكاء الاصطناعي
                </p>
                <p className="text-sm text-muted-foreground font-arabic">
                  🔐 تشفير البيانات وحفظها بأمان
                </p>
                <p className="text-sm text-muted-foreground font-arabic">
                  ⏳ يرجى الانتظار لحظات...
                </p>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
};