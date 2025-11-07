import { useState } from 'react';
import * as faceapi from 'face-api.js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFaceApiLogin = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // استخراج face descriptor من الصورة
  const extractFaceDescriptor = async (imageElement: HTMLImageElement): Promise<Float32Array | null> => {
    try {
      console.log('🔍 Detecting face and extracting descriptor...');
      
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        console.log('❌ No face detected in image');
        return null;
      }

      const descriptor = detection.descriptor;
      
      // التحقق من أن الطول صحيح (128)
      if (descriptor.length !== 128) {
        console.error('❌ Invalid descriptor length:', descriptor.length);
        return null;
      }

      console.log('✅ Face descriptor extracted successfully (128 dimensions)');
      return descriptor;
    } catch (error) {
      console.error('❌ Error extracting face descriptor:', error);
      return null;
    }
  };

  // تسجيل الدخول باستخدام الوجه
  const loginWithFace = async (imageBase64: string) => {
    setIsProcessing(true);

    try {
      console.log('🔐 Starting face login process...');

      // تحويل base64 إلى Image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageBase64;
      });

      console.log('📸 Image loaded, extracting face descriptor...');

      // استخراج face descriptor
      const descriptor = await extractFaceDescriptor(img);
      if (!descriptor) {
        console.log('⚠️ No face detected');
        return { success: false, error: 'No face detected' };
      }

      console.log('🔍 Face descriptor extracted, searching in database...');
      console.log('📏 Descriptor length:', descriptor.length);

      // البحث في قاعدة البيانات باستخدام pgvector مع إعادة المحاولة
      let data, error;
      for (let attempt = 1; attempt <= 2; attempt++) {
        console.log(`📡 Database search attempt ${attempt}...`);
        
        const result = await supabase.functions.invoke('search-user-face-vector', {
          body: {
            faceDescriptor: Array.from(descriptor),
            threshold: 0.6, // 60% minimum match
            limit: 1
          }
        });

        data = result.data;
        error = result.error;

        if (!error && data) break;
        
        if (attempt === 1) {
          console.log('⚠️ Retrying database search...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log('📡 Database search response:', data);
      
      if (error) {
        console.error('❌ Database search error:', error);
        toast.error('فشل البحث في قاعدة البيانات');
        return { success: false, error: 'Database search failed' };
      }

      if (!data || !data.matches || data.matches.length === 0) {
        console.log('❌ No matching face found');
        return { success: false, error: 'No match found' };
      }

      const match = data.matches[0];
      console.log('✅ Face matched!', match);
      console.log('📊 Similarity:', (match.similarity * 100).toFixed(1) + '%');

      // إنشاء جلسة Supabase مباشرة
      try {
        console.log('🔑 Creating session for user:', match.email);
        
        // تسجيل الدخول باستخدام signInWithPassword
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: match.email,
          password: 'face-login-' + match.user_id
        });

        if (authError) {
          console.warn('⚠️ Standard login failed, trying alternative methods...');
          
          // محاولة OTP كبديل
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email: match.email,
            options: {
              shouldCreateUser: false,
              emailRedirectTo: window.location.origin + '/dashboard'
            }
          });

          if (otpError) {
            console.error('❌ All login methods failed');
            toast.error('فشل تسجيل الدخول - يرجى التواصل مع الدعم الفني');
            return { success: false, error: 'Login failed' };
          }

          toast.success('تم التعرف على وجهك! يرجى التحقق من بريدك الإلكتروني لإكمال تسجيل الدخول.');
          return {
            success: true,
            message: 'Check email for login link',
            similarity: match.similarity,
            email: match.email,
            userId: match.user_id
          };
        }

        console.log('✅ Session created successfully!');
        
        return {
          success: true,
          message: 'Login successful',
          similarity: match.similarity,
          email: match.email,
          userId: match.user_id
        };

      } catch (authError) {
        console.error('❌ Authentication error:', authError);
        toast.error('حدث خطأ أثناء تسجيل الدخول');
        return { success: false, error: 'Authentication failed' };
      }

    } catch (error) {
      console.error('❌ Face login error:', error);
      const errorMsg = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    loginWithFace,
    isProcessing
  };
};
