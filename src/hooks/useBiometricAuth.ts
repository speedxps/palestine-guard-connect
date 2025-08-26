import { useState, useEffect } from 'react';

interface BiometricAuthResult {
  isSupported: boolean;
  isAvailable: boolean;
  authenticate: () => Promise<{ success: boolean; error?: string }>;
  checkSupport: () => Promise<boolean>;
}

// Check if we're in a sandbox environment
const isSandboxEnvironment = () => {
  try {
    return window.location.hostname.includes('sandbox') || 
           window.location.hostname.includes('lovable') ||
           window.parent !== window; // Running in iframe
  } catch {
    return false;
  }
};

export const useBiometricAuth = (): BiometricAuthResult => {
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const checkSupport = async (): Promise<boolean> => {
    try {
      // In sandbox environment, simulate support for demo purposes
      if (isSandboxEnvironment()) {
        return true;
      }

      // Check if Web Authentication API is available
      if (!window.PublicKeyCredential) {
        return false;
      }

      // Check if platform authenticator is available
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      console.error('Biometric check error:', error);
      return false;
    }
  };

  const authenticate = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!isSupported) {
        return { success: false, error: 'المصادقة البيومترية غير مدعومة على هذا الجهاز' };
      }

      // In sandbox environment, simulate authentication with improved realism
      if (isSandboxEnvironment()) {
        // Show a more realistic authentication prompt
        const confirmAuth = window.confirm('🔐 مصادقة بيومترية\n\nضع إصبعك على مستشعر البصمة أو انظر إلى الكاميرا للتحقق من هويتك.\n\nاضغط موافق للمحاكاة أو إلغاء للرفض.');
        
        if (!confirmAuth) {
          return { success: false, error: 'تم إلغاء المصادقة البيومترية' };
        }
        
        // Simulate realistic authentication delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate 90% success rate for demo (more realistic)
        const success = Math.random() > 0.1;
        
        if (success) {
          return { success: true };
        } else {
          return { success: false, error: 'فشل في التحقق من البصمة. حاول مرة أخرى.' };
        }
      }

      // Real WebAuthn implementation for production
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge,
        allowCredentials: [],
        userVerification: 'required',
        timeout: 60000,
      };

      // Request authentication
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      if (credential) {
        return { success: true };
      } else {
        return { success: false, error: 'فشل في المصادقة البيومترية' };
      }
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'تم إلغاء المصادقة البيومترية من قبل المستخدم' };
      } else if (error.name === 'NotSupportedError') {
        return { success: false, error: 'المصادقة البيومترية غير مدعومة على هذا المتصفح' };
      } else if (error.name === 'SecurityError') {
        return { success: false, error: 'خطأ أمني في المصادقة البيومترية' };
      } else if (error.name === 'AbortError') {
        return { success: false, error: 'تم إيقاف عملية المصادقة البيومترية' };
      } else {
        return { success: false, error: 'فشل في المصادقة البيومترية - تحقق من إعدادات الجهاز' };
      }
    }
  };

  useEffect(() => {
    const initBiometric = async () => {
      const supported = await checkSupport();
      setIsSupported(supported);
      setIsAvailable(supported);
    };

    initBiometric();
  }, []);

  return {
    isSupported,
    isAvailable,
    authenticate,
    checkSupport,
  };
};