import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';
import { useFaceApiLogin } from '@/hooks/useFaceApiLogin';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FaceLoginWithApiProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const FaceLoginWithApi: React.FC<FaceLoginWithApiProps> = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { loginWithFace, isProcessing, isModelsLoaded } = useFaceApiLogin();
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error('فشل في تشغيل الكاميرا');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const handleVerify = async () => {
    if (!capturedImage) {
      toast.error('الرجاء التقاط صورة أولاً');
      return;
    }

    const result = await loginWithFace(capturedImage);
    
    if (result.success) {
      toast.success('تم تسجيل الدخول بنجاح! 🎉');
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } else {
      setCapturedImage(null);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isModelsLoaded) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل نماذج التعرف على الوجوه...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isCapturing && !capturedImage && (
        <div className="space-y-3">
          <Button onClick={startCamera} className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            التقاط صورة بالكاميرا
          </Button>
          
          <label htmlFor="face-upload-login" className="block">
            <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('face-upload-login')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              رفع صورة من الجهاز
            </Button>
          </label>
          <input
            id="face-upload-login"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      )}

      {isCapturing && (
        <div className="space-y-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg border aspect-video bg-black"
          />
          <div className="flex gap-2">
            <Button onClick={captureImage} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              التقاط
            </Button>
            <Button onClick={stopCamera} variant="outline" className="flex-1">
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="space-y-3">
          <img
            src={capturedImage}
            alt="Captured face"
            className="w-full rounded-lg border"
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleVerify} 
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </Button>
            <Button 
              onClick={() => setCapturedImage(null)} 
              variant="outline"
              disabled={isProcessing}
              className="flex-1"
            >
              إعادة
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
