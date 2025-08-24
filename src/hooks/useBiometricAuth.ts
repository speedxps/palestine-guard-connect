import { useState, useEffect } from 'react';

interface BiometricAuthResult {
  isSupported: boolean;
  isAvailable: boolean;
  authenticate: () => Promise<{ success: boolean; error?: string }>;
  checkSupport: () => Promise<boolean>;
}

export const useBiometricAuth = (): BiometricAuthResult => {
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const checkSupport = async (): Promise<boolean> => {
    try {
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

      // Create credential options for authentication
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