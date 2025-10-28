import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Fingerprint, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useFaceLogin } from '@/hooks/useFaceLogin';
import { supabase } from '@/integrations/supabase/client';
import { AdvancedFaceLoginSetup } from './AdvancedFaceLoginSetup';

interface IntegratedLoginButtonProps {
  onSuccess: () => void;
  isSubmitting?: boolean;
}

export const IntegratedLoginButton = ({ onSuccess, isSubmitting }: IntegratedLoginButtonProps) => {
  const [hasFaceLogin, setHasFaceLogin] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFaceSetup, setShowFaceSetup] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const { isSupported: biometricSupported, isRegistered: biometricRegistered, authenticate: authenticateBiometric } = useBiometricAuth();
  const { verifyFaceAndLogin, isVerifying } = useFaceLogin();

  useEffect(() => {
    checkAvailableMethods();
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkAvailableMethods = async () => {
    try {
      // Check if face login is enabled (check localStorage for quick access)
      const faceEnabled = localStorage.getItem('faceLoginEnabled') === 'true';
      setHasFaceLogin(faceEnabled);

      // Check if biometric is available and registered
      const biometricAvailable = biometricSupported && biometricRegistered;
      setHasBiometric(biometricAvailable);
    } catch (error) {
      console.error('Error checking biometric methods:', error);
    }
  };

  const handleFaceLogin = async () => {
    try {
      setIsLoading(true);
      
      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setCameraStream(stream);

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });

      // Small delay to ensure camera is fully initialized
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Failed to get canvas context');
      
      ctx.drawImage(video, 0, 0);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];

      // Stop camera
      stream.getTracks().forEach(track => track.stop());
      setCameraStream(null);

      // Verify face
      toast.info('جاري التحقق من الوجه...');
      const result = await verifyFaceAndLogin(imageBase64);

      if (result.success) {
        toast.success('تم تسجيل الدخول بنجاح!');
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        toast.error(result.error || 'فشل التحقق من الوجه');
      }
    } catch (error: any) {
      console.error('Face login error:', error);
      toast.error('فشل في تسجيل الدخول بالوجه');
      
      // Clean up camera stream on error
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      toast.info('جاري التحقق من البصمة...');

      // Authenticate using biometric
      const authResult = await authenticateBiometric();

      if (!authResult.success) {
        toast.error(authResult.error || 'فشل في التحقق من البصمة');
        return;
      }

      // Get stored user ID
      const storedUserId = localStorage.getItem('biometricUserId');
      if (!storedUserId) {
        toast.error('لم يتم العثور على معلومات المستخدم. يرجى إعادة تسجيل البصمة');
        return;
      }

      // Verify with backend
      const { data, error } = await supabase.functions.invoke('verify-biometric-login', {
        body: { userId: storedUserId }
      });

      if (error) throw error;

      if (!data.success) {
        toast.error(data.error || 'فشل في التحقق من البصمة');
        return;
      }

      // Set session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.accessToken,
        refresh_token: data.session.refreshToken
      });

      if (sessionError) throw sessionError;

      toast.success('تم تسجيل الدخول بنجاح!');
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error: any) {
      console.error('Biometric login error:', error);
      toast.error('فشل في تسجيل الدخول بالبصمة');
    } finally {
      setIsLoading(false);
    }
  };

  const showBiometricOptions = hasFaceLogin || hasBiometric;

  return (
    <>
      <div className="relative w-full">
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              جاري تسجيل الدخول...
            </>
          ) : (
            'تسجيل الدخول'
          )}
        </Button>

        {/* Biometric Options - Small icons below button */}
        {showBiometricOptions && !isSubmitting && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-3 mt-3"
          >
            {hasFaceLogin && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFaceLogin}
                disabled={isLoading || isVerifying}
                className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
                title="تسجيل الدخول بالوجه"
              >
                {isLoading && !hasBiometric ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-primary" />
                )}
              </motion.button>
            )}

            {hasBiometric && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBiometricLogin}
                disabled={isLoading || isVerifying}
                className="p-3 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
                title="تسجيل الدخول بالبصمة"
              >
                {isLoading && hasBiometric ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Fingerprint className="w-5 h-5 text-primary" />
                )}
              </motion.button>
            )}
          </motion.div>
        )}

        {showBiometricOptions && !isSubmitting && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            أو استخدم المصادقة البيومترية
          </p>
        )}
      </div>

      {/* Advanced Face Setup Modal */}
      <AdvancedFaceLoginSetup
        isOpen={showFaceSetup}
        onClose={() => setShowFaceSetup(false)}
        onSuccess={() => {
          setHasFaceLogin(true);
          localStorage.setItem('faceLoginEnabled', 'true');
        }}
      />
    </>
  );
};