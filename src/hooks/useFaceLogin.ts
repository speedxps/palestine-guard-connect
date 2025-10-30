import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFaceLogin = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyFaceAndLogin = async (imageBase64: string) => {
    setIsVerifying(true);
    
    try {
      // التحقق من صحة الصورة قبل الإرسال
      if (!imageBase64 || imageBase64.length < 100) {
        console.error('❌ Invalid image data');
        toast.error('بيانات الصورة غير صالحة');
        return { success: false, error: 'بيانات الصورة غير صالحة' };
      }

      console.log('🔐 Starting face verification...');
      console.log('📏 Image base64 length:', imageBase64.length);
      console.log('🖼️ Image base64 prefix:', imageBase64.substring(0, 50));

      const { data, error } = await supabase.functions.invoke('verify-face-login', {
        body: { imageBase64 }
      });

      console.log('📡 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        toast.error('فشل الاتصال بخدمة التحقق: ' + (error.message || 'خطأ غير معروف'));
        return { success: false, error: 'فشل الاتصال بخدمة التحقق' };
      }

      if (!data) {
        console.error('❌ No data returned from edge function');
        toast.error('لم يتم استلام بيانات من الخادم');
        return { success: false, error: 'لم يتم استلام بيانات من الخادم' };
      }

      if (!data.success) {
        console.log('❌ Verification failed:', data.error);
        toast.error(data.error || 'فشل التحقق من الوجه');
        return { success: false, error: data.error || 'فشل التحقق من الوجه' };
      }

      console.log('✅ Face verified! User:', data.email, 'Similarity:', data.similarity);
      console.log('🔑 Tokens received:', { 
        hasAccessToken: !!data.accessToken, 
        hasRefreshToken: !!data.refreshToken 
      });

      if (data.accessToken && data.refreshToken) {
        console.log('🔑 Creating session with tokens...');
        
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.accessToken,
          refresh_token: data.refreshToken
        });

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          toast.error('فشل في إنشاء الجلسة: ' + sessionError.message);
          return { success: false, error: 'فشل في إنشاء الجلسة' };
        }

        console.log('✅ Session created successfully!', sessionData);
        console.log('👤 Current user:', sessionData.user?.email);
        toast.success(`مرحباً ${data.email}! 🎉`);
      } else {
        console.error('❌ Missing tokens in response');
        toast.error('لم يتم استلام بيانات تسجيل الدخول');
        return { success: false, error: 'لم يتم استلام بيانات تسجيل الدخول' };
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
