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

      // In sandbox environment, simulate authentication
      if (isSandboxEnvironment()) {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate 80% success rate for demo
        const success = Math.random() > 0.2;
        
        if (success) {
          return { success: true };
        } else {
          return { success: false, error: 'فشل في التحقق من البصمة' };
        }
      }

      // Real WebAuthn implementation for production
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: new Uint8Array(32),
        allowCredentials: [],
        userVerification: 'required',
        timeout: 60000,
      };

      // Request authentication
      await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'تم إلغاء المصادقة البيومترية' };
      } else if (error.name === 'NotSupportedError') {
        return { success: false, error: 'المصادقة البيومترية غير مدعومة' };
      } else {
        return { success: false, error: 'فشل في المصادقة البيومترية' };
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