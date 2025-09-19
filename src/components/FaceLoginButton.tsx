import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import { useAuth } from '@/contexts/AuthContext';

interface FaceLoginButtonProps {
  onSuccess: () => void;
  className?: string;
}

export const FaceLoginButton: React.FC<FaceLoginButtonProps> = ({ onSuccess, className }) => {
  const { toast } = useToast();
  const { verifyFace, isLoading } = useFaceRecognition();
  const { refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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
        title: "❌ خطأ في الكاميرا",
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

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setIsVerifying(true);
      
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      
      context?.drawImage(video, 0, 0);
      
      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
      await verifyFaceImage(imageData);
      
    } catch (error) {
      console.error('Capture error:', error);
      toast({
        title: "❌ خطأ في التقاط الصورة",
        description: "فشل في التقاط الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        await verifyFaceImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const verifyFaceImage = async (imageData: string) => {
    try {
      setIsVerifying(true);

      // Get current user data to verify against
      const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      if (!currentUser.id) {
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      const verificationResult = await verifyFace(currentUser.id, imageData);
      
      if (verificationResult.success) {
        toast({
          title: "✅ تم التحقق بنجاح",
          description: `تم التعرف على وجهك بنسبة ${Math.round((verificationResult.similarity || 0) * 100)}%`,
        });
        
        // Refresh user session
        await refreshUser();
        
        stopCamera();
        setIsOpen(false);
        onSuccess();
      } else {
        toast({
          title: "❌ فشل التحقق",
          description: verificationResult.error || "لم يتم التعرف على الوجه",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Face verification error:', error);
      toast({
        title: "❌ خطأ في التحقق",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء التحقق من الوجه",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className={`border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 ${className}`}
        disabled={isLoading}
      >
        <Camera className="h-4 w-4 mr-2" />
        {isLoading ? 'جاري التحميل...' : 'تسجيل دخول بالوجه'}
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-arabic text-center">
              تسجيل الدخول بالوجه
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center space-y-3">
              <Camera className="h-16 w-16 text-purple-400 mx-auto" />
              <h3 className="font-semibold font-arabic text-lg">التحقق من هويتك</h3>
              <p className="text-sm text-muted-foreground font-arabic">
                استخدم الكاميرا أو ارفع صورة للتحقق من وجهك
              </p>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <p className="text-xs text-purple-400 font-arabic">
                  🔐 تحقق آمن بالذكاء الاصطناعي<br/>
                  🚀 سريع ودقيق<br/>
                  🛡️ محمي ومشفر
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
                  <div className="absolute inset-0 border-2 border-purple-400/30 rounded-lg pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-purple-400 rounded-lg opacity-50"></div>
                  </div>
                </div>
                <Button 
                  onClick={captureAndVerify} 
                  className="w-full bg-purple-500 hover:bg-purple-600" 
                  size="lg"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      التقاط والتحقق
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button onClick={startCamera} className="w-full bg-purple-500 hover:bg-purple-600" size="lg">
                  <Camera className="h-4 w-4 mr-2" />
                  تشغيل الكاميرا
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-arabic mb-2">أو</p>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-purple-500/30"
                    size="lg"
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        جاري التحقق...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        رفع صورة للتحقق
                      </>
                    )}
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

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};