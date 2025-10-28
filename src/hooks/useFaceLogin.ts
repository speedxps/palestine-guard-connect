import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFaceLogin = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyFaceAndLogin = async (imageBase64: string) => {
    setIsVerifying(true);
    
    try {
      console.log('🔐 بدء عملية التحقق من الوجه...');

      // استدعاء edge function للتحقق من الوجه
      const { data, error } = await supabase.functions.invoke('verify-face-login', {
        body: { imageBase64 }
      });

      if (error) {
        console.error('❌ خطأ في استدعاء edge function:', error);
        throw new Error('فشل الاتصال بخدمة التحقق');
      }

      if (!data.success) {
        console.log('❌ فشل التحقق:', data.error);
        return { 
          success: false, 
          error: data.error || 'فشل التحقق من الوجه' 
        };
      }

      console.log('✅ تم التحقق بنجاح! المستخدم:', data.email, 'التشابه:', data.similarity);

      // إنشاء جلسة Supabase باستخدام الـ tokens المُرجعة
      if (data.accessToken && data.refreshToken) {
        console.log('🔑 إنشاء جلسة Supabase...');
        
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.accessToken,
          refresh_token: data.refreshToken
        });

        if (sessionError) {
          console.error('❌ خطأ في إنشاء الجلسة:', sessionError);
          return {
            success: false,
            error: 'فشل في إنشاء الجلسة'
          };
        }

        console.log('✅ تم إنشاء الجلسة بنجاح!');
        toast.success('تم تسجيل الدخول بنجاح! 🎉');
      }

      return {
        success: true,
        message: data.message,
        similarity: data.similarity,
        email: data.email,
        userId: data.userId
      };

    } catch (error) {
      console.error('❌ خطأ في عملية تسجيل الدخول بالوجه:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      };
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyFaceAndLogin,
    isVerifying
  };
};
