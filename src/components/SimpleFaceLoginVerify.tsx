import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X } from 'lucide-react';
import { useFaceLogin } from '@/hooks/useFaceLogin';

interface SimpleFaceLoginVerifyProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SimpleFaceLoginVerify = ({ onSuccess, onCancel }: SimpleFaceLoginVerifyProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { verifyFaceAndLogin, isVerifying } = useFaceLogin();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('خطأ في فتح الكاميرا:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageBase64);
      stopCamera();

      // Auto verify
      const result = await verifyFaceAndLogin(imageBase64);
      if (result.success) {
        onSuccess?.();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">تسجيل الدخول بالوجه</h3>
        <p className="text-sm text-muted-foreground">
          انظر للكاميرا والتقط صورة لوجهك
        </p>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {!isCapturing && !capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button onClick={startCamera} size="lg" className="gap-2">
              <Camera className="w-5 h-5" />
              فتح الكاميرا
            </Button>
          </div>
        )}

        {isCapturing && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured face"
            className="w-full h-full object-cover"
          />
        )}

        {isVerifying && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center text-white space-y-2">
              <Loader2 className="w-12 h-12 animate-spin mx-auto" />
              <p className="text-lg font-semibold">جاري التحقق من الوجه...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-center">
        {isCapturing && !isVerifying && (
          <>
            <Button onClick={captureImage} size="lg" className="gap-2">
              <Camera className="w-5 h-5" />
              التقاط والتحقق
            </Button>
            <Button onClick={stopCamera} variant="outline" size="lg">
              <X className="w-5 h-5" />
              إلغاء
            </Button>
          </>
        )}

        {capturedImage && !isVerifying && (
          <Button onClick={handleRetake} variant="outline" size="lg" className="gap-2">
            <Camera className="w-5 h-5" />
            إعادة المحاولة
          </Button>
        )}

        {!isCapturing && !capturedImage && !isVerifying && onCancel && (
          <Button onClick={onCancel} variant="outline" size="lg">
            إلغاء
          </Button>
        )}
      </div>
    </div>
  );
};
