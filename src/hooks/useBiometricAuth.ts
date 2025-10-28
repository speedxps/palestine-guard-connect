import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

// Dynamic import for Capacitor BiometricAuth (only available on native)
let BiometricAuth: any = null;
let biometricLoadPromise: Promise<void> | null = null;

if (Capacitor.isNativePlatform()) {
  console.log('🔐 Running on native platform, loading BiometricAuth...');
  biometricLoadPromise = (async () => {
    try {
      const module = await import('@aparajita/capacitor-biometric-auth');
      BiometricAuth = module.BiometricAuth;
      console.log('✅ BiometricAuth loaded successfully');
    } catch (e) {
      console.error('❌ BiometricAuth plugin not available:', e);
      console.log('Make sure @aparajita/capacitor-biometric-auth is installed and synced');
    }
  })();
} else {
  console.log('🌐 Running on web platform, BiometricAuth not needed');
}

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
    // Only consider it sandbox if explicitly in Lovable iframe
    return window.parent !== window && 
           (window.location.hostname.includes('lovable') || 
            window.location.hostname.includes('sandbox'));
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
      // Check if we're on a mobile device with Capacitor
      if (Capacitor.isNativePlatform()) {
        console.log('🔍 Checking biometric support on native platform...');
        
        // Wait for BiometricAuth to load
        if (biometricLoadPromise) {
          await biometricLoadPromise;
        }
        
        if (!BiometricAuth) {
          console.log('❌ BiometricAuth plugin not loaded');
          return false;
        }
        
        try {
          // Use BiometricAuth.checkBiometry() for actual device verification
          const result = await BiometricAuth.checkBiometry();
          
          console.log('📱 Biometry check result:', result);
          
          // result.isAvailable = true if device supports biometrics
          // result.biometryType = FaceID, TouchID, Fingerprint, etc.
          if (result.isAvailable) {
            console.log('✅ Biometrics available:', result.biometryType);
            return true;
          } else {
            console.log('❌ Biometrics not available on this device');
            return false;
          }
        } catch (nativeError: any) {
          console.error('❌ Native biometric check failed:', nativeError);
          
          // Check for specific error codes
          if (nativeError.code === 'biometryNotAvailable') {
            console.log('⚠️ Device does not support biometrics');
          } else if (nativeError.code === 'biometryNotEnrolled') {
            console.log('⚠️ No biometrics enrolled on device');
          }
          
          return false;
        }
      }
      
      // Check if Web Authentication API is available (web/browser)
      if (!window.PublicKeyCredential) {
        console.log('PublicKeyCredential not available');
        return false;
      }

      // Check if platform authenticator is available
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      console.log('Platform authenticator available:', available);
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

      console.log('Starting biometric registration...');

      // For native platforms (mobile apps) - use Capacitor BiometricAuth
      if (Capacitor.isNativePlatform()) {
        // Wait for BiometricAuth to load
        if (biometricLoadPromise) {
          await biometricLoadPromise;
        }
        
        if (!BiometricAuth) {
          return { 
            success: false, 
            error: '❌ المصادقة البيومترية غير متوفرة. تأكد من تثبيت الإضافة.' 
          };
        }
        
        console.log('🔐 Registering biometrics on native platform using BiometricAuth');
        
        try {
          // Use BiometricAuth.authenticate() with proper API
          const result = await BiometricAuth.authenticate({
            reason: 'تسجيل بصمتك للدخول السريع والآمن',
            androidTitle: 'تسجيل البصمة',
            androidSubtitle: 'استخدم بصمتك',
            androidConfirmationRequired: false,
            iosLocalizedFallbackTitle: 'استخدم رمز المرور',
          });

          if (result && result.verified) {
            localStorage.setItem('biometricRegistered', 'true');
            localStorage.removeItem('biometricSimulated');
            setIsRegistered(true);
            
            console.log('✅ Native biometric registration successful');
            return { success: true };
          } else {
            return { 
              success: false, 
              error: 'فشل في التحقق من البصمة' 
            };
          }
        } catch (nativeError: any) {
          console.error('❌ Native biometric registration failed:', nativeError);
          
          // Check for specific error codes from @aparajita/capacitor-biometric-auth
          if (nativeError.code === 'biometryNotEnrolled') {
            return { 
              success: false, 
              error: '⚠️ لم يتم تسجيل بصمة على الهاتف. يرجى تسجيل بصمتك في إعدادات الجهاز أولاً.' 
            };
          } else if (nativeError.code === 'biometryNotAvailable') {
            return { 
              success: false, 
              error: '❌ المصادقة البيومترية غير مدعومة على هذا الجهاز.' 
            };
          } else if (nativeError.code === 'userCancel') {
            return { 
              success: false, 
              error: 'تم إلغاء العملية من قبل المستخدم' 
            };
          }
          
          return { 
            success: false, 
            error: 'فشل في تسجيل البصمة. تأكد من تفعيل البصمة على جهازك.' 
          };
        }
      }

      // Web platform handling (existing code)
      try {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        
        const userId = new Uint8Array(32);
        crypto.getRandomValues(userId);

        const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
          challenge: challenge,
          rp: {
            name: "Palestinian Police System",
            id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
          },
          user: {
            id: userId,
            name: "user@police.ps",
            displayName: "Police User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" }
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
          const credentialId = Array.from(new Uint8Array((credential as PublicKeyCredential).rawId));
          localStorage.setItem('biometricCredentialId', JSON.stringify(credentialId));
          localStorage.setItem('biometricRegistered', 'true');
          setIsRegistered(true);
          
          return { success: true };
        } else {
          throw new Error('No credential returned');
        }
      } catch (webAuthnError: any) {
        console.log('WebAuthn not available, using fallback simulation:', webAuthnError.message);
        
        // Fallback simulation for development/testing
        const confirmReg = window.confirm('📝 تسجيل البيانات البيومترية\n\n⚠️ هذا النظام في وضع التطوير - سيتم محاكاة التسجيل.\nفي الجهاز الحقيقي: سيتم استخدام البصمة الفعلية.\n\nاضغط موافق للمتابعة.');
        
        if (!confirmReg) {
          return { success: false, error: 'تم إلغاء تسجيل البيانات البيومترية' };
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        localStorage.setItem('biometricRegistered', 'true');
        localStorage.setItem('biometricSimulated', 'true');
        setIsRegistered(true);
        
        return { success: true };
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

      console.log('Starting biometric authentication...');

      // Check if using simulated biometrics
      const isSimulated = localStorage.getItem('biometricSimulated') === 'true';
      
      if (isSimulated) {
        console.log('Using simulated biometrics');
        const confirmAuth = window.confirm('🔐 مصادقة بيومترية\n\n⚠️ وضع المحاكاة النشط\nفي الجهاز الحقيقي: سيتم استخدام البصمة الفعلية.\n\nاضغط موافق للمتابعة أو إلغاء للرفض.');
        
        if (!confirmAuth) {
          return { success: false, error: 'تم إلغاء المصادقة البيومترية' };
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const success = Math.random() > 0.1;
        
        if (success) {
          return { success: true };
        } else {
          return { success: false, error: 'فشل في التحقق من البصمة. حاول مرة أخرى.' };
        }
      }

      // For native platforms (mobile apps) - use Capacitor BiometricAuth
      if (Capacitor.isNativePlatform()) {
        // Wait for BiometricAuth to load
        if (biometricLoadPromise) {
          await biometricLoadPromise;
        }
        
        if (!BiometricAuth) {
          return { 
            success: false, 
            error: '❌ المصادقة البيومترية غير متوفرة. تأكد من تثبيت الإضافة.' 
          };
        }
        
        console.log('🔐 Authenticating on native platform using BiometricAuth');
        
        try {
          const result = await BiometricAuth.authenticate({
            reason: 'تسجيل الدخول بالبصمة',
            androidTitle: 'مصادقة بيومترية',
            androidSubtitle: 'استخدم بصمتك للدخول',
            androidConfirmationRequired: false,
            iosLocalizedFallbackTitle: 'استخدم رمز المرور',
          });

          if (result && result.verified) {
            console.log('✅ Native biometric authentication successful');
            return { success: true };
          } else {
            return { success: false, error: 'فشل في التحقق من البصمة' };
          }
        } catch (nativeError: any) {
          console.error('❌ Native biometric authentication failed:', nativeError);
          
          // Check for specific error codes from @aparajita/capacitor-biometric-auth
          if (nativeError.code === 'biometryNotEnrolled') {
            return { 
              success: false, 
              error: '⚠️ لم يتم العثور على بصمة مسجلة على الهاتف. يرجى تسجيل بصمتك في إعدادات الجهاز.' 
            };
          } else if (nativeError.code === 'biometryNotAvailable') {
            return { 
              success: false, 
              error: '❌ المصادقة البيومترية غير مدعومة على هذا الجهاز.' 
            };
          } else if (nativeError.code === 'userCancel') {
            return { 
              success: false, 
              error: 'تم إلغاء المصادقة من قبل المستخدم' 
            };
          } else if (nativeError.code === 'biometryLockout') {
            return { 
              success: false, 
              error: '⚠️ تم قفل البصمة مؤقتاً. استخدم رمز المرور أو حاول لاحقاً.' 
            };
          }
          
          return { 
            success: false, 
            error: 'فشل في التحقق من البصمة. تأكد من تسجيل بصمتك على الجهاز.' 
          };
        }
      }

      // Web platform handling (existing code)
      try {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        
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
      } catch (webAuthnError: any) {
        console.log('WebAuthn authentication failed, using fallback:', webAuthnError.message);
        
        const confirmAuth = window.confirm('🔐 مصادقة بيومترية - وضع بديل\n\n⚠️ WebAuthn غير متاح - سيتم استخدام المحاكاة.\nفي المتصفحات والأجهزة المدعومة: ستعمل البصمة الحقيقية.\n\nاضغط موافق للمتابعة.');
        
        if (!confirmAuth) {
          return { success: false, error: 'تم إلغاء المصادقة البيومترية' };
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true };
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