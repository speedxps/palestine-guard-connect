import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, StopCircle, Loader2 } from 'lucide-react';
import { useFaceApiLogin } from '@/hooks/useFaceApiLogin';
import { toast } from 'sonner';
import * as faceapi from 'face-api.js';

interface FaceLoginWithApiProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const FaceLoginWithApi: React.FC<FaceLoginWithApiProps> = ({ onSuccess, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [matchInfo, setMatchInfo] = useState<{ email: string; similarity: number } | null>(null);
  const [fps, setFps] = useState(0);
  const [lastFrameTime, setLastFrameTime] = useState(Date.now());

  const { loginWithFace } = useFaceApiLogin();

  // تحميل نماذج face-api.js
  const loadModels = useCallback(async () => {
    try {
      console.log('🔄 Loading face-api.js models...');
      const MODEL_URL = '/models';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      
      setIsModelsLoaded(true);
      console.log('✅ Face-api.js models loaded successfully');
    } catch (error) {
      console.error('❌ Error loading face-api.js models:', error);
      toast.error('فشل تحميل نماذج التعرف على الوجه');
    }
  }, []);

  // تشغيل الكاميرا
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        toast.success('تم تشغيل الكاميرا بنجاح');
      }
    } catch (err) {
      console.error('خطأ في تشغيل الكاميرا:', err);
      toast.error('فشل في تشغيل الكاميرا');
    }
  }, []);

  // إيقاف الكاميرا
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    setMatchInfo(null);
    toast.info('تم إيقاف الكاميرا');
  }, []);

  // معالجة إطار واحد
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive || isProcessing || !isModelsLoaded) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // تحديث حجم Canvas ليطابق الفيديو
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    setIsProcessing(true);

    try {
      // التقاط إطار الفيديو
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // تحويل Canvas إلى base64
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

      // محاولة تسجيل الدخول باستخدام الوجه
      const result = await loginWithFace(imageBase64);

      if (result.success && result.email && result.similarity) {
        console.log('✅ Face matched! User:', result.email);
        setMatchInfo({
          email: result.email,
          similarity: result.similarity
        });
        
        // إيقاف المعالجة والانتقال إلى الداشبورد
        stopCamera();
        toast.success(`مرحباً ${result.email}! 🎉`);
        
        setTimeout(() => {
          onSuccess?.();
        }, 1000);
      } else {
        setMatchInfo(null);
      }

      // حساب FPS
      const now = Date.now();
      const delta = now - lastFrameTime;
      if (delta > 0) {
        setFps(Math.round(1000 / delta));
      }
      setLastFrameTime(now);

    } catch (err) {
      console.error('خطأ في معالجة الإطار:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [isCameraActive, isProcessing, isModelsLoaded, loginWithFace, lastFrameTime, stopCamera, onSuccess]);

  // بدء المعالجة المستمرة
  useEffect(() => {
    if (isCameraActive && isModelsLoaded) {
      intervalRef.current = window.setInterval(processFrame, 2000); // معالجة كل 2 ثانية
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isCameraActive, isModelsLoaded, processFrame]);

  // تحميل النماذج عند التحميل
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // تنظيف عند الخروج
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              تسجيل الدخول بالوجه
            </CardTitle>
            <div className="flex items-center gap-2">
              {isCameraActive && (
                <Badge variant="default" className="animate-pulse">
                  مباشر • {fps} FPS
                </Badge>
              )}
              {!isModelsLoaded && (
                <Badge variant="secondary">
                  <Loader2 className="w-3 h-3 ml-1 animate-spin" />
                  تحميل النماذج...
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* منطقة الفيديو والـ Canvas */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ display: 'none' }}
            />
            
            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center space-y-4 p-6">
                  <Camera className="w-16 h-16 text-white mx-auto" />
                  <p className="text-white text-lg">اضغط على زر "تشغيل الكاميرا" للبدء</p>
                </div>
              </div>
            )}

            {/* معلومات التطابق */}
            {matchInfo && isCameraActive && (
              <div className="absolute top-4 left-4 right-4 bg-green-600/90 backdrop-blur-sm text-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">✅ تم التعرف عليك!</p>
                    <p className="text-sm">{matchInfo.email}</p>
                  </div>
                  <Badge className="bg-white text-green-600">
                    {(matchInfo.similarity * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            )}

            {/* مؤشر المعالجة */}
            {isProcessing && isCameraActive && (
              <div className="absolute bottom-4 left-4 right-4 bg-blue-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">جاري البحث عن الوجه...</span>
              </div>
            )}

            {/* تحذير تحميل النماذج */}
            {!isModelsLoaded && (
              <div className="absolute top-4 right-4 bg-yellow-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري تحميل نماذج التعرف...
              </div>
            )}
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-2">
            {!isCameraActive ? (
              <Button
                onClick={startCamera}
                className="flex-1"
                disabled={!isModelsLoaded}
              >
                <Camera className="w-4 h-4 mr-2" />
                {!isModelsLoaded ? 'جاري التحميل...' : 'تشغيل الكاميرا'}
              </Button>
            ) : (
              <Button
                onClick={stopCamera}
                variant="destructive"
                className="flex-1"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                إيقاف الكاميرا
              </Button>
            )}
            
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
              >
                إلغاء
              </Button>
            )}
          </div>

          {/* تعليمات */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📝 تعليمات:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• تأكد من وجود إضاءة جيدة</li>
              <li>• انظر مباشرة إلى الكاميرا</li>
              <li>• سيتم التعرف عليك تلقائياً خلال ثوانٍ</li>
              <li>• دقة التطابق: 99%+ في الظروف المثالية</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
