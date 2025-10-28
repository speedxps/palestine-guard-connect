import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Fingerprint, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useFaceLogin } from '@/hooks/useFaceLogin';
import { supabase } from '@/integrations/supabase/client';
import { AdvancedFaceLoginSetup } from './AdvancedFaceLoginSetup';
import { AdvancedFaceLoginVerify } from './AdvancedFaceLoginVerify';

interface IntegratedLoginButtonProps {
  onSuccess: () => void;
  isSubmitting?: boolean;
}

export const IntegratedLoginButton = ({ onSuccess, isSubmitting }: IntegratedLoginButtonProps) => {
  const [hasFaceLogin, setHasFaceLogin] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFaceSetup, setShowFaceSetup] = useState(false);
  const [showFaceVerify, setShowFaceVerify] = useState(false);

  const { isSupported: biometricSupported, isRegistered: biometricRegistered, authenticate: authenticateBiometric } = useBiometricAuth();
  const { verifyFaceAndLogin, isVerifying } = useFaceLogin();

  useEffect(() => {
    checkAvailableMethods();
  }, []);

  const checkAvailableMethods = async () => {
    try {
      console.log('🔍 Checking available biometric methods...');
      
      // Priority 1: Check localStorage first (fast, works without user)
      const faceEnabledLocal = localStorage.getItem('faceLoginEnabled') === 'true';
      const bioEnabledLocal = localStorage.getItem('biometricEnabled') === 'true';
      
      console.log('📦 localStorage status:', { faceEnabledLocal, bioEnabledLocal });
      
      // Set immediately from localStorage
      setHasFaceLogin(faceEnabledLocal);
      setHasBiometric(bioEnabledLocal && biometricSupported && biometricRegistered);
      
      // Priority 2: Then verify with database if user exists (optional sync)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('👤 User found, syncing with database...');
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('face_login_enabled, biometric_enabled')
          .eq('user_id', user.id)
          .single();

        if (!error && profile) {
          console.log('✅ Database sync:', profile);
          
          // Update states and localStorage
          setHasFaceLogin(profile.face_login_enabled || false);
          setHasBiometric(profile.biometric_enabled || false);
          
          localStorage.setItem('faceLoginEnabled', profile.face_login_enabled ? 'true' : 'false');
          localStorage.setItem('biometricEnabled', profile.biometric_enabled ? 'true' : 'false');
        }
      } else {
        console.log('ℹ️ No user logged in, using localStorage only');
      }
    } catch (error) {
      console.error('❌ Error checking biometric methods:', error);
      // In case of error, still rely on localStorage
      const faceEnabledLocal = localStorage.getItem('faceLoginEnabled') === 'true';
      const bioEnabledLocal = localStorage.getItem('biometricEnabled') === 'true';
      setHasFaceLogin(faceEnabledLocal);
      setHasBiometric(bioEnabledLocal && biometricSupported && biometricRegistered);
    }
  };

  const handleFaceLogin = () => {
    setShowFaceVerify(true);
  };

  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      toast.info('جاري التحقق من البصمة...');

      // Authenticate using biometric
      const authResult = await authenticateBiometric();

      if (!authResult.success) {
        // Show more specific error message
        const errorMessage = authResult.error || 'فشل في التحقق من البصمة';
        toast.error(errorMessage);
        return;
      }

      // Get stored user ID
      const storedUserId = localStorage.getItem('biometricUserId');
      if (!storedUserId) {
        toast.error('⚠️ لم يتم العثور على معلومات المستخدم. يرجى إعادة تسجيل البصمة من إعدادات الحساب');
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

      toast.success('✅ تم تسجيل الدخول بنجاح!');
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error: any) {
      console.error('❌ Biometric login error:', error);
      toast.error('فشل في تسجيل الدخول بالبصمة. يرجى المحاولة مرة أخرى.');
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

      {/* Face Login Verify Modal */}
      <AdvancedFaceLoginVerify
        isOpen={showFaceVerify}
        onClose={() => setShowFaceVerify(false)}
        onSuccess={onSuccess}
      />
    </>
  );
};