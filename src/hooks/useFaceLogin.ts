import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFaceLogin = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyFaceAndLogin = async (imageBase64: string) => {
    setIsVerifying(true);
    
    try {
      console.log('🔐 Starting face verification...');

      const { data, error } = await supabase.functions.invoke('verify-face-login', {
        body: { imageBase64 }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        toast.error('فشل الاتصال بخدمة التحقق');
        return { success: false, error: 'فشل الاتصال بخدمة التحقق' };
      }

      if (!data.success) {
        console.log('❌ Verification failed:', data.error);
        toast.error(data.error || 'فشل التحقق من الوجه');
        return { success: false, error: data.error || 'فشل التحقق من الوجه' };
      }

      console.log('✅ Face verified! User:', data.email, 'Similarity:', data.similarity);

      if (data.accessToken && data.refreshToken) {
        console.log('🔑 Creating session...');
        
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.accessToken,
          refresh_token: data.refreshToken
        });

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          toast.error('فشل في إنشاء الجلسة');
          return { success: false, error: 'فشل في إنشاء الجلسة' };
        }

        console.log('✅ Session created successfully!');
        toast.success(`مرحباً ${data.email}! 🎉`);
      }

      return {
        success: true,
        message: data.message,
        similarity: data.similarity,
        email: data.email,
        userId: data.userId
      };

    } catch (error) {
      console.error('❌ Face login error:', error);
      const errorMsg = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyFaceAndLogin,
    isVerifying
  };
};
