import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Camera, RotateCcw, Check, X } from 'lucide-react';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';

interface FaceCameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
}

export const FaceCameraCapture = ({ onCapture, onCancel, title = "تسجيل الوجه" }: FaceCameraCaptureProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { generateFaceEmbedding } = useFaceRecognition();

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "خطأ في الكاميرا",
        description: "فشل في الوصول إلى الكاميرا. يرجى التأكد من الصلاحيات.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);

    // Validate that this looks like a face using AI
    try {
      const result = await generateFaceEmbedding(imageData);
      if (!result.success) {
        toast({
          title: "خطأ في التحقق",
          description: "لم يتم اكتشاف وجه واضح في الصورة. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
        setCapturedImage(null);
        setIsProcessing(false);
        return;
      }

      toast({
        title: "تم التقاط الصورة",
        description: "تم التقاط صورة الوجه بنجاح. يمكنك الآن الموافقة عليها أو إعادة التقاط.",
      });
    } catch (error) {
      console.error('Face validation error:', error);
      toast({
        title: "تحذير",
        description: "تم التقاط الصورة ولكن لم يتم التحقق من جودة الوجه.",
        variant: "destructive",
      });
    }
    
    setIsProcessing(false);
  }, [generateFaceEmbedding, toast]);

  const retakeImage = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
    }
  }, [capturedImage, onCapture, stopCamera]);

  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel();
  }, [stopCamera, onCancel]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Camera className="h-6 w-6" />
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Camera View */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3] max-w-md mx-auto">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                
                {/* Face Guidance Circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-primary rounded-full bg-transparent flex items-center justify-center">
                    <div className="w-56 h-56 border-2 border-primary/50 rounded-full bg-transparent">
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                          ضع وجهك داخل الدائرة
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guidelines */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/70 text-white p-3 rounded-lg text-sm">
                    <p className="text-center font-medium mb-2">تعليمات التصوير:</p>
                    <ul className="text-xs space-y-1">
                      <li>• ضع وجهك في منتصف الدائرة</li>
                      <li>• تأكد من وضوح الإضاءة</li>
                      <li>• انظر مباشرة إلى الكاميرا</li>
                      <li>• لا ترتدي نظارات أو قناع</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <img
                src={capturedImage}
                alt="Captured face"
                className="w-full h-full object-cover"
              />
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!capturedImage ? (
              <>
                <Button 
                  onClick={captureImage}
                  disabled={isProcessing || !stream}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Camera className="h-5 w-5 ml-2" />
                  {isProcessing ? 'جاري المعالجة...' : 'التقاط الصورة'}
                </Button>
                
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  size="lg"
                >
                  <X className="h-5 w-5 ml-2" />
                  إلغاء
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={confirmCapture}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-5 w-5 ml-2" />
                  موافق
                </Button>
                
                <Button 
                  onClick={retakeImage}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="h-5 w-5 ml-2" />
                  إعادة التقاط
                </Button>
                
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  size="lg"
                >
                  <X className="h-5 w-5 ml-2" />
                  إلغاء
                </Button>
              </>
            )}
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">جاري معالجة الصورة...</p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">ملاحظة أمان:</span> سيتم تشفير بيانات الوجه وحفظها بشكل آمن. 
              لن يتم حفظ الصورة الأصلية، فقط التمثيل الرقمي المشفر.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};