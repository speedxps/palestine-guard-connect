import { useState, useEffect } from 'react';

interface BiometricAuthResult {
  isSupported: boolean;
  isAvailable: boolean;
  isRegistered: boolean;
  authenticate: () => Promise<{ success: boolean; error?: string }>;
  register: () => Promise<{ success: boolean; error?: string }>;
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
  const [isRegistered, setIsRegistered] = useState(false);

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

  const register = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!isSupported) {
        return { success: false, error: 'المصادقة البيومترية غير مدعومة على هذا الجهاز' };
      }

      // In sandbox environment, simulate registration
      if (isSandboxEnvironment()) {
        const confirmReg = window.confirm('📝 تسجيل البيانات البيومترية\n\nسيتم تسجيل بصمتك لاستخدامها في المصادقة المستقبلية.\n\nضع إصبعك على المستشعر أو انظر إلى الكاميرا.\n\nاضغط موافق للمحاكاة.');
        
        if (!confirmReg) {
          return { success: false, error: 'تم إلغاء تسجيل البيانات البيومترية' };
        }
        
        // Simulate registration delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Save registration status
        localStorage.setItem('biometricRegistered', 'true');
        setIsRegistered(true);
        
        return { success: true };
      }

      // Real WebAuthn registration for production
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      const userId = new Uint8Array(32);
      crypto.getRandomValues(userId);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: "Palestinian Police System",
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: "user@police.ps",
          displayName: "Police User",
        },
        pubKeyCredParams: [
          {
            alg: -7, // ES256
            type: "public-key",
          },
          {
            alg: -257, // RS256
            type: "public-key",
          }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: "direct"
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      });

      if (credential) {
        // Save the credential ID for future authentication
        const credentialId = Array.from(new Uint8Array((credential as PublicKeyCredential).rawId));
        localStorage.setItem('biometricCredentialId', JSON.stringify(credentialId));
        localStorage.setItem('biometricRegistered', 'true');
        setIsRegistered(true);
        
        return { success: true };
      } else {
        return { success: false, error: 'فشل في تسجيل البيانات البيومترية' };
      }
    } catch (error: any) {
      console.error('Biometric registration error:', error);
      
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'تم رفض تسجيل البيانات البيومترية' };
      } else if (error.name === 'NotSupportedError') {
        return { success: false, error: 'تسجيل البيانات البيومترية غير مدعوم' };
      } else if (error.name === 'SecurityError') {
        return { success: false, error: 'خطأ أمني في تسجيل البيانات البيومترية' };
      } else {
        return { success: false, error: 'فشل في تسجيل البيانات البيومترية' };
      }
    }
  };

  const authenticate = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!isSupported) {
        return { success: false, error: 'المصادقة البيومترية غير مدعومة على هذا الجهاز' };
      }

      if (!isRegistered) {
        return { success: false, error: 'يجب تسجيل البيانات البيومترية أولاً' };
      }

      // In sandbox environment, simulate authentication
      if (isSandboxEnvironment()) {
        const confirmAuth = window.confirm('🔐 مصادقة بيومترية\n\nضع إصبعك على مستشعر البصمة أو انظر إلى الكاميرا للتحقق من هويتك.\n\nاضغط موافق للمحاكاة أو إلغاء للرفض.');
        
        if (!confirmAuth) {
          return { success: false, error: 'تم إلغاء المصادقة البيومترية' };
        }
        
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate 90% success rate
        const success = Math.random() > 0.1;
        
        if (success) {
          return { success: true };
        } else {
          return { success: false, error: 'فشل في التحقق من البصمة. حاول مرة أخرى.' };
        }
      }

      // Real WebAuthn authentication
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      // Get saved credential ID
      const savedCredentialId = localStorage.getItem('biometricCredentialId');
      const allowCredentials = [];
      
      if (savedCredentialId) {
        const credentialId = new Uint8Array(JSON.parse(savedCredentialId));
        allowCredentials.push({
          id: credentialId,
          type: "public-key" as const,
        });
      }
      
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge,
        allowCredentials: allowCredentials,
        userVerification: 'required',
        timeout: 60000,
      };

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
        return { success: false, error: 'فشل في المصادقة البيومترية - قد تحتاج إلى إعادة تسجيل البيانات' };
      }
    }
  };

  useEffect(() => {
    const initBiometric = async () => {
      const supported = await checkSupport();
      setIsSupported(supported);
      setIsAvailable(supported);
      
      // Check if already registered
      const registered = localStorage.getItem('biometricRegistered') === 'true';
      setIsRegistered(registered);
    };

    initBiometric();
  }, []);

  return {
    isSupported,
    isAvailable,
    isRegistered,
    authenticate,
    register,
    checkSupport,
  };
};