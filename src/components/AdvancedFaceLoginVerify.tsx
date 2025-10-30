import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2 } from 'lucide-react';
import { useFaceLogin } from '@/hooks/useFaceLogin';
import { toast } from 'sonner';
import * as faceapi from 'face-api.js';

interface AdvancedFaceLoginVerifyProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AdvancedFaceLoginVerify = ({ onSuccess, onCancel }: AdvancedFaceLoginVerifyProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { verifyFaceAndLogin, isVerifying } = useFaceLogin();

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  const loadModels = async () => {
    try {
      console.log('⏳ تحميل نماذج التعرف على الوجه...');
      const MODEL_URL = '/models';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      
      console.log('✅ تم تحميل النماذج بنجاح');
      setModelsLoaded(true);
    } catch (error) {
      console.error('❌ فشل تحميل النماذج:', error);
      toast.error('فشل في تحميل نماذج التعرف على الوجه');
    }
  };

  const startCamera = async () => {
    if (!modelsLoaded) {
      toast.error('يرجى الانتظار حتى يتم تحميل النماذج');
      return;
    }

    try {
      console.log('🎥 فتح الكاميرا...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('✅ الكاميرا تعمل');
                setIsCapturing(true);
                startFaceDetection();
              })
              .catch((err) => {
                console.error('❌ خطأ في تشغيل الفيديو:', err);
                toast.error('فشل في تشغيل الكاميرا');
              });
          }
        };
      }
    } catch (error) {
      console.error('❌ خطأ في فتح الكاميرا:', error);
      toast.error('فشل في الوصول للكاميرا');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    setIsCapturing(false);
    setFaceDetected(false);
  };

  const startFaceDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // تعيين حجم الكانفاس
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    detectionIntervalRef.current = setInterval(async () => {
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // مسح الكانفاس
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        const detection = await faceapi.detectSingleFace(
          video, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks();

        if (detection) {
          setFaceDetected(true);
          
          // رسم دائرة حول الوجه
          const box = detection.detection.box;
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          const radius = Math.max(box.width, box.height) * 0.6;

          // دائرة خضراء عند اكتشاف الوجه
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 4;
          ctx.stroke();

          // رسم معالم الوجه
          const landmarks = detection.landmarks;
          ctx.fillStyle = '#22c55e';
          landmarks.positions.forEach((point: any) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fill();
          });

        } else {
          setFaceDetected(false);
          
          // رسم دائرة زرقاء عند عدم اكتشاف وجه
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, 2 * Math.PI);
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      } catch (error) {
        console.error('خطأ في اكتشاف الوجه:', error);
      }
    }, 100);
  };

  const captureAndVerify = async () => {
    if (!faceDetected) {
      toast.error('لم يتم اكتشاف وجه واضح');
      return;
    }

    // عداد تنازلي
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // انتظار انتهاء العد
    await new Promise(resolve => setTimeout(resolve, 3000));

    // التقاط الصورة
    if (!videoRef.current || !canvasRef.current) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 800;
    tempCanvas.height = 600;
    const ctx = tempCanvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 800, 600);
      const imageBase64 = tempCanvas.toDataURL('image/jpeg', 0.7);
      
      stopCamera();
      
      // التحقق من الوجه
      const result = await verifyFaceAndLogin(imageBase64);
      if (result.success) {
        onSuccess?.();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">التحقق من الوجه</h3>
        <p className="text-sm text-muted-foreground">
          ضع وجهك في الإطار
        </p>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {!isCapturing && !isVerifying && (
          <div className="absolute inset-0 flex items-center justify-center">
            {!modelsLoaded ? (
              <div className="text-center text-white space-y-2">
                <Loader2 className="w-12 h-12 animate-spin mx-auto" />
                <p>تحميل نماذج التعرف على الوجه...</p>
              </div>
            ) : (
              <Button onClick={startCamera} size="lg" className="gap-2">
                <Camera className="w-5 h-5" />
                فتح الكاميرا
              </Button>
            )}
          </div>
        )}

        {isCapturing && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
            
            {countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/70 rounded-full w-32 h-32 flex items-center justify-center">
                  <span className="text-white text-6xl font-bold">{countdown}</span>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                faceDetected ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span className="text-white text-sm font-medium">
                  {faceDetected ? '✓ تم اكتشاف الوجه' : 'ضع وجهك في الإطار...'}
                </span>
              </div>
            </div>
          </>
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
        {isCapturing && !isVerifying && countdown === 0 && (
          <>
            <Button 
              onClick={captureAndVerify} 
              size="lg" 
              className="gap-2"
              disabled={!faceDetected}
            >
              <Camera className="w-5 h-5" />
              التقاط والتحقق
            </Button>
            <Button onClick={stopCamera} variant="outline" size="lg">
              <X className="w-5 h-5" />
              إلغاء
            </Button>
          </>
        )}

        {!isCapturing && !isVerifying && onCancel && (
          <Button onClick={onCancel} variant="outline" size="lg">
            إلغاء
          </Button>
        )}
      </div>
    </div>
  );
};