import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint } from 'lucide-react';
import { toast } from 'sonner';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { supabase } from '@/integrations/supabase/client';

interface BiometricLoginButtonProps {
  onSuccess: () => void;
}

const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({ onSuccess }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [canUseBiometric, setCanUseBiometric] = useState(false);
  const { isSupported, isAvailable, authenticate } = useBiometricAuth();

  useEffect(() => {
    // التحقق من أن البصمة متاحة ومدعومة
    setCanUseBiometric(isSupported && isAvailable);
  }, [isSupported, isAvailable]);

  const handleBiometricLogin = async () => {
    setIsAuthenticating(true);
    
    try {
      console.log('🔐 بدء تسجيل الدخول بالبصمة...');

      // محاولة المصادقة البيومترية
      const authResult = await authenticate();
      
      if (!authResult.success) {
        toast.error(authResult.error || 'فشل التحقق من البصمة');
        return;
      }

      console.log('✅ تم التحقق من البصمة بنجاح!');

      // حفظ حالة التحقق
      localStorage.setItem('biometric_verified', 'true');
      
      // الانتقال مباشرة - سيتم التحقق من الجلسة في الصفحة الرئيسية
      toast.success('تم التحقق من البصمة بنجاح! 🎉');
      onSuccess();

    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول بالبصمة:', error);
      toast.error('حدث خطأ أثناء تسجيل الدخول بالبصمة');
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!canUseBiometric) {
    return null; // لا نعرض الزر إذا لم تكن البصمة متاحة
  }

  return (
    <Button
      variant="outline"
      onClick={handleBiometricLogin}
      disabled={isAuthenticating}
      className="w-full"
    >
      <Fingerprint className="h-4 w-4 mr-2" />
      {isAuthenticating ? 'جاري التحقق...' : 'تسجيل الدخول بالبصمة'}
    </Button>
  );
};

export default BiometricLoginButton;
