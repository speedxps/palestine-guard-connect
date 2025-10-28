import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { useFaceLogin } from '@/hooks/useFaceLogin';

interface FaceLoginButtonProps {
  onSuccess: () => void;
}

const FaceLoginButton: React.FC<FaceLoginButtonProps> = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { verifyFaceAndLogin, isVerifying } = useFaceLogin();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast.error('فشل في تشغيل الكاميرا');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // ضبط حجم الكانفاس
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // رسم الصورة من الفيديو
    context.drawImage(video, 0, 0);

    // تحويل الصورة إلى base64
    const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

    console.log('📸 تم التقاط الصورة، جاري التحقق...');
    toast.info('جاري التحقق من الوجه... 🔍');

    // استدعاء التحقق
    const result = await verifyFaceAndLogin(imageBase64);

    if (result.success) {
      setSimilarity(result.similarity || 0);
      toast.success(`تم تسجيل الدخول بنجاح! 🎉`, {
        description: `نسبة التطابق: ${result.similarity?.toFixed(1)}%`
      });
      
      // إيقاف الكاميرا
      stopCamera();
      
      // إغلاق النافذة
      setIsOpen(false);
      
      // استدعاء callback النجاح بعد تأخير قصير للسماح بإنشاء الجلسة
      setTimeout(() => {
        onSuccess();
      }, 500);
    } else {
      toast.error('فشل التحقق من الوجه', {
        description: result.error || 'يرجى التأكد من وضوح الصورة والإضاءة الجيدة'
      });
      setSimilarity(0);
    }
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <Camera className="h-4 w-4 mr-2" />
        تسجيل الدخول بالوجه
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">تسجيل الدخول بالوجه</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!stream ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  قم بتشغيل الكاميرا والتقاط صورة لوجهك للتحقق من هويتك
                </p>
                <Button onClick={startCamera} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  تشغيل الكاميرا
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg border-2 border-primary/20"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-80 border-2 border-primary rounded-full opacity-30" />
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    ⚡ ضع وجهك في الإطار
                  </p>
                  <p className="text-xs text-muted-foreground">
                    تأكد من وجود إضاءة كافية
                  </p>
                  {similarity && (
                    <p className="text-sm font-medium text-green-600">
                      نسبة التطابق: {similarity}%
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={captureAndVerify} 
                    disabled={isVerifying}
                    className="flex-1"
                  >
                    {isVerifying ? 'جاري التحقق...' : 'التقاط والتحقق'}
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FaceLoginButton;