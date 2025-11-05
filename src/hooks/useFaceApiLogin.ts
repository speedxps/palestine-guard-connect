import { useState } from 'react';
import * as faceapi from 'face-api.js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { loadFaceApiModels } from '@/utils/faceApiLoader';

export const useFaceApiLogin = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);

  // تحميل النماذج
  const ensureModelsLoaded = async () => {
    if (!isModelsLoaded) {
      const loaded = await loadFaceApiModels();
      setIsModelsLoaded(loaded);
      return loaded;
    }
    return true;
  };

  // استخراج face descriptor من صورة
  const extractFaceDescriptor = async (imageElement: HTMLImageElement): Promise<Float32Array | null> => {
    try {
      const detection = await faceapi
        .detectSingleFace(imageElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error('لم يتم العثور على وجه في الصورة');
        return null;
      }

      return detection.descriptor;
    } catch (error) {
      console.error('Error extracting face descriptor:', error);
      toast.error('فشل في استخراج بيانات الوجه');
      return null;
    }
  };

  // تسجيل دخول باستخدام face-api.js
  const loginWithFace = async (imageBase64: string) => {
    setIsProcessing(true);
    
    try {
      // تحميل النماذج أولاً
      const modelsLoaded = await ensureModelsLoaded();
      if (!modelsLoaded) {
        toast.error('فشل تحميل نماذج التعرف على الوجوه');
        return { success: false, error: 'فشل تحميل النماذج' };
      }

      // تحويل base64 إلى image element
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageBase64;
      });

      // استخراج face descriptor
      const faceDescriptor = await extractFaceDescriptor(img);
      if (!faceDescriptor) {
        return { success: false, error: 'فشل استخراج بيانات الوجه' };
      }

      console.log('✅ Face descriptor extracted:', faceDescriptor.length, 'dimensions');

      // تحويل Float32Array إلى array عادي للبحث
      const descriptorArray = Array.from(faceDescriptor);

      // البحث في قاعدة البيانات
      const { data: matches, error: searchError } = await supabase
        .rpc('search_user_faces_by_vector', {
          query_embedding: JSON.stringify(descriptorArray),
          match_threshold: 0.6,
          match_count: 1
        }) as any;

      if (searchError) {
        console.error('Search error:', searchError);
        toast.error('فشل البحث في قاعدة البيانات');
        return { success: false, error: 'فشل البحث' };
      }

      if (!matches || matches.length === 0) {
        toast.error('لم يتم العثور على تطابق للوجه');
        return { success: false, error: 'لا يوجد تطابق' };
      }

      const match = matches[0];
      console.log('✅ Match found:', match.email, 'Similarity:', match.similarity);

      // تسجيل الدخول باستخدام user_id
      const { data: sessionData, error: authError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: match.email,
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast.error('فشل في إنشاء جلسة الدخول');
        return { success: false, error: 'فشل المصادقة' };
      }

      // استخدام الرابط السحري لتسجيل الدخول
      toast.success(`مرحباً ${match.full_name || match.email}! 🎉`);

      return {
        success: true,
        userId: match.user_id,
        email: match.email,
        fullName: match.full_name,
        similarity: match.similarity
      };

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
    isProcessing,
    isModelsLoaded
  };
};
