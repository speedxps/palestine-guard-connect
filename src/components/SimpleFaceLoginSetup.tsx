import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Check, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SimpleFaceLoginSetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SimpleFaceLoginSetup = ({ onSuccess, onCancel }: SimpleFaceLoginSetupProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      console.log('🎥 محاولة فتح الكاميرا...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user'
        } 
      });
      
      console.log('✅ تم الحصول على stream من الكاميرا');
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('✅ تم تعيين stream للفيديو');
        
        // Try to play immediately
        try {
          await videoRef.current.play();
          console.log('✅ الفيديو يعمل الآن');
        } catch (playError) {
          console.log('⚠️ محاولة ثانية للتشغيل...');
          // Fallback: wait a bit and try again
          setTimeout(async () => {
            try {
              await videoRef.current?.play();
              console.log('✅ الفيديو يعمل بعد المحاولة الثانية');
            } catch (e) {
              console.error('❌ فشل تشغيل الفيديو:', e);
              toast.error('فشل في تشغيل عرض الكاميرا');
            }
          }, 100);
        }
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('❌ خطأ في فتح الكاميرا:', error);
      toast.error('فشل في الوصول للكاميرا. تأكد من السماح بالإذن.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    
    // Reduce image size for faster processing
    const maxWidth = 800;
    const maxHeight = 600;
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    
    let width = videoWidth;
    let height = videoHeight;
    
    // Scale down if needed
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      // Compress image to 0.7 quality
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.7);
      console.log('📸 Captured image size:', imageBase64.length, 'chars');
      setCapturedImage(imageBase64);
      stopCamera();
    }
  };

  const handleRegister = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      console.log('🔄 إرسال الصورة لتسجيل الوجه...');
      
      const { data, error } = await supabase.functions.invoke('process-face-registration', {
        body: { userId: user.id, imageBase64: capturedImage }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'فشل في تسجيل الوجه');

      console.log('✅ تم تسجيل الوجه بنجاح!');
      toast.success('تم تسجيل الوجه بنجاح! 🎉');
      onSuccess?.();
      
    } catch (error) {
      console.error('❌ خطأ في تسجيل الوجه:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في تسجيل الوجه');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">تسجيل الوجه للدخول السريع</h3>
        <p className="text-sm text-muted-foreground">
          التقط صورة واضحة لوجهك لاستخدامها في تسجيل الدخول
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
      </div>

      <div className="flex gap-2 justify-center">
        {isCapturing && (
          <>
            <Button onClick={captureImage} size="lg" className="gap-2">
              <Camera className="w-5 h-5" />
              التقاط الصورة
            </Button>
            <Button onClick={stopCamera} variant="outline" size="lg">
              <X className="w-5 h-5" />
              إلغاء
            </Button>
          </>
        )}

        {capturedImage && !isProcessing && (
          <>
            <Button onClick={handleRegister} size="lg" className="gap-2">
              <Check className="w-5 h-5" />
              تأكيد وحفظ
            </Button>
            <Button onClick={handleRetake} variant="outline" size="lg" className="gap-2">
              <Camera className="w-5 h-5" />
              إعادة التصوير
            </Button>
          </>
        )}

        {isProcessing && (
          <Button disabled size="lg" className="gap-2">
            <Upload className="w-5 h-5 animate-spin" />
            جاري المعالجة...
          </Button>
        )}

        {!isCapturing && !capturedImage && onCancel && (
          <Button onClick={onCancel} variant="outline" size="lg">
            إلغاء
          </Button>
        )}
      </div>
    </div>
  );
};
