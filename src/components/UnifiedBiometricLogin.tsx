import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Fingerprint, Camera, Scan } from 'lucide-react';
import { toast } from 'sonner';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useFaceLogin } from '@/hooks/useFaceLogin';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedBiometricLoginProps {
  onSuccess: () => void;
}

const UnifiedBiometricLogin: React.FC<UnifiedBiometricLoginProps> = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState<'face' | 'fingerprint' | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoRef] = useState(React.createRef<HTMLVideoElement>());
  const [canvasRef] = useState(React.createRef<HTMLCanvasElement>());
  
  const { isSupported: isBiometricSupported, isAvailable: isBiometricAvailable, authenticate: authenticateBiometric } = useBiometricAuth();
  const { verifyFaceAndLogin, isVerifying } = useFaceLogin();
  
  const [hasBiometric, setHasBiometric] = useState(false);
  const [hasFaceLogin, setHasFaceLogin] = useState(false);

  useEffect(() => {
    checkAvailableMethods();
  }, [isBiometricSupported, isBiometricAvailable]);

  const checkAvailableMethods = async () => {
    // التحقق من البصمة
    const bioAvailable = isBiometricSupported && isBiometricAvailable;
    setHasBiometric(bioAvailable);

    // التحقق من تسجيل الوجه
    const faceEnabled = localStorage.getItem('faceLoginEnabled') === 'true';
    setHasFaceLogin(faceEnabled);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
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

  const handleFaceLogin = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

    toast.info('جاري التحقق من الوجه... 🔍');

    const result = await verifyFaceAndLogin(imageBase64);

    if (result.success) {
      toast.success(`تم تسجيل الدخول بنجاح! 🎉`);
      stopCamera();
      setIsOpen(false);
      setTimeout(() => onSuccess(), 500);
    } else {
      toast.error('فشل التحقق من الوجه', {
        description: result.error || 'يرجى التأكد من وضوح الصورة والإضاءة الجيدة'
      });
    }
  };

  const handleBiometricLogin = async () => {
    try {
      console.log('🔐 بدء تسجيل الدخول بالبصمة...');

      const authResult = await authenticateBiometric();
      
      if (!authResult.success) {
        toast.error(authResult.error || 'فشل التحقق من البصمة');
        return;
      }

      console.log('✅ تم التحقق من البصمة بنجاح!');

      // الحصول على userId من localStorage
      const userId = localStorage.getItem('biometric_user_id');
      
      if (!userId) {
        toast.error('لم يتم العثور على بيانات المستخدم. يرجى تسجيل البصمة مرة أخرى.');
        return;
      }

      // استدعاء Edge Function للتحقق وإنشاء الجلسة
      const { data, error } = await supabase.functions.invoke('verify-biometric-login', {
        body: { userId }
      });

      if (error || !data.success) {
        toast.error('فشل التحقق من البصمة', {
          description: data?.error || error?.message
        });
        return;
      }

      // إنشاء جلسة Supabase
      if (data.accessToken && data.refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.accessToken,
          refresh_token: data.refreshToken
        });

        if (sessionError) {
          toast.error('فشل في إنشاء الجلسة');
          return;
        }

        toast.success('تم تسجيل الدخول بنجاح! 🎉');
        setIsOpen(false);
        setTimeout(() => onSuccess(), 500);
      }

    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول بالبصمة:', error);
      toast.error('حدث خطأ أثناء تسجيل الدخول بالبصمة');
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setMethod(null);
  };

  const handleMethodSelect = async (selectedMethod: 'face' | 'fingerprint') => {
    setMethod(selectedMethod);
    
    if (selectedMethod === 'face') {
      await startCamera();
    } else if (selectedMethod === 'fingerprint') {
      await handleBiometricLogin();
    }
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
    setMethod(null);
  };

  // إذا لم يكن هناك أي طريقة متاحة، لا نعرض الزر
  if (!hasBiometric && !hasFaceLogin) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleOpen}
        className="w-full h-12 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
      >
        <Scan className="h-5 w-5 mr-2" />
        <span className="font-arabic">تسجيل الدخول البيومتري</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-arabic">اختر طريقة المصادقة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!method ? (
              <div className="grid grid-cols-2 gap-4">
                {hasFaceLogin && (
                  <button
                    onClick={() => handleMethodSelect('face')}
                    className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <Camera className="h-12 w-12 text-primary mb-3" />
                    <span className="font-arabic font-medium">الوجه</span>
                  </button>
                )}
                
                {hasBiometric && (
                  <button
                    onClick={() => handleMethodSelect('fingerprint')}
                    className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <Fingerprint className="h-12 w-12 text-primary mb-3" />
                    <span className="font-arabic font-medium">البصمة</span>
                  </button>
                )}
              </div>
            ) : method === 'face' && stream ? (
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
                  <p className="text-sm text-muted-foreground font-arabic">
                    ⚡ ضع وجهك في الإطار
                  </p>
                  <p className="text-xs text-muted-foreground font-arabic">
                    تأكد من وجود إضاءة كافية
                  </p>
                </div>

                <Button 
                  onClick={handleFaceLogin} 
                  disabled={isVerifying}
                  className="w-full"
                >
                  {isVerifying ? 'جاري التحقق...' : 'التقاط والتحقق'}
                </Button>
              </div>
            ) : null}
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UnifiedBiometricLogin;
