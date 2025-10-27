import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, StopCircle } from 'lucide-react';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import { toast } from 'sonner';

interface Match {
  id: string;
  national_id: string;
  name: string;
  photo_url: string;
  similarity: number;
}

export const RealTimeFaceRecognition: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMatches, setCurrentMatches] = useState<Match[]>([]);
  const [fps, setFps] = useState(0);
  const [lastFrameTime, setLastFrameTime] = useState(Date.now());

  const { searchFaces } = useFaceRecognition();

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
    setCurrentMatches([]);
    toast.info('تم إيقاف الكاميرا');
  }, []);

  // معالجة إطار واحد
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive || isProcessing) {
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

      // البحث عن الوجوه باستخدام OpenAI
      const result = await searchFaces(imageBase64);

      if (result.success && result.matches && result.matches.length > 0) {
        setCurrentMatches(result.matches);
      } else {
        setCurrentMatches([]);
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
  }, [isCameraActive, isProcessing, searchFaces, lastFrameTime]);

  // بدء المعالجة المستمرة
  useEffect(() => {
    if (isCameraActive) {
      intervalRef.current = window.setInterval(processFrame, 3000); // معالجة كل 3 ثوانٍ
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isCameraActive, processFrame]);

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
              التعرف على الوجوه في الوقت الفعلي
            </CardTitle>
            <div className="flex items-center gap-2">
              {isCameraActive && (
                <Badge variant="default" className="animate-pulse">
                  مباشر • {fps} FPS
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
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
            
            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="text-white text-lg">الكاميرا غير نشطة</p>
              </div>
            )}
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-2">
            {!isCameraActive ? (
              <Button
                onClick={startCamera}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                تشغيل الكاميرا
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
          </div>

          {/* النتائج */}
          {currentMatches.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">التطابقات المكتشفة:</h3>
              <div className="space-y-2">
                {currentMatches.map((match, index) => (
                  <div
                    key={match.id}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    {match.photo_url && (
                      <img
                        src={match.photo_url}
                        alt={match.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{match.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {match.national_id}
                      </p>
                    </div>
                    <Badge
                      variant={match.similarity > 0.5 ? 'default' : 'secondary'}
                    >
                      {(match.similarity * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};