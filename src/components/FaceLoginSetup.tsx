import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Check, X, RefreshCw } from 'lucide-react';
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

  const saveFaceData = async () => {
    if (!capturedImage || !user) return;

    setLoading(true);
    setStep('processing');

    try {
      // حفظ البيانات محلياً حتى نضيف جدول قاعدة البيانات
      const faceData = {
        userId: user.id,
        imageData: capturedImage,
        timestamp: new Date().toISOString(),
        isActive: true
      };

      // حفظ البيانات في localStorage
      localStorage.setItem('userFaceData', JSON.stringify(faceData));
      localStorage.setItem('faceLoginEnabled', 'true');

      toast({
        title: "تم حفظ بيانات الوجه",
        description: "تم تسجيل وجهك بنجاح. يمكنك الآن استخدام تسجيل الدخول بالوجه.",
      });

      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error saving face data:', error);
      toast({
        title: "خطأ في حفظ البيانات",
        description: "حدث خطأ أثناء حفظ بيانات الوجه. يرجى المحاولة مرة أخرى.",
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
              <div className="text-center space-y-2">
                <Camera className="h-12 w-12 text-primary mx-auto" />
                <h3 className="font-semibold font-arabic">التقط صورة واضحة لوجهك</h3>
                <p className="text-sm text-muted-foreground font-arabic">
                  تأكد من أن وجهك مضاء جيداً وواضح في الكاميرا
                </p>
              </div>

              {cameraActive ? (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg border"
                  />
                  <Button onClick={capturePhoto} className="w-full">
                    التقاط الصورة
                  </Button>
                </div>
              ) : (
                <Button onClick={startCamera} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  تشغيل الكاميرا
                </Button>
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
                  onClick={saveFaceData}
                  disabled={loading}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  تأكيد وحفظ
                </Button>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-4">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <h3 className="font-semibold font-arabic">جاري حفظ البيانات...</h3>
              <p className="text-sm text-muted-foreground font-arabic">
                يرجى الانتظار بينما نحفظ بيانات وجهك بأمان
              </p>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
};