import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { loadFaceApiModels, extractFaceDescriptor, extractAllFaceDescriptors } from '@/utils/faceApiLoader';
import { toast } from 'sonner';

export interface FaceMatch {
  id: string;
  national_id: string;
  full_name: string;
  photo_url: string;
  similarity: number;
}

export const useFaceApi = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // تحميل النماذج عند بدء التشغيل
  useEffect(() => {
    const initModels = async () => {
      setIsLoading(true);
      const loaded = await loadFaceApiModels();
      setIsModelLoaded(loaded);
      setIsLoading(false);
      
      if (!loaded) {
        setError('فشل تحميل نماذج التعرف على الوجوه');
        toast.error('فشل تحميل نماذج التعرف على الوجوه');
      }
    };

    initModels();
  }, []);

  // حفظ face vector لمواطن
  const saveFaceVector = useCallback(async (
    citizenId: string,
    faceDescriptor: Float32Array
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('generate-face-vector', {
        body: {
          citizenId,
          faceDescriptor: Array.from(faceDescriptor)
        }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'فشل في حفظ face vector');
      }

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'خطأ في حفظ face vector';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // البحث عن وجوه مشابهة
  const searchFaces = useCallback(async (
    faceDescriptor: Float32Array,
    threshold = 0.7,
    limit = 5
  ): Promise<{ success: boolean; matches?: FaceMatch[]; error?: string }> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('search-face-vector', {
        body: {
          faceDescriptor: Array.from(faceDescriptor),
          threshold,
          limit
        }
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || 'فشل في البحث');
      }

      return { 
        success: true, 
        matches: data.matches || [] 
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'خطأ في البحث';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // استخراج وحفظ face descriptor من صورة
  const processAndSaveImage = useCallback(async (
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    citizenId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!isModelLoaded) {
        throw new Error('النماذج غير محملة بعد');
      }

      setIsLoading(true);
      
      const descriptor = await extractFaceDescriptor(imageElement);
      
      if (!descriptor) {
        throw new Error('لم يتم اكتشاف وجه في الصورة');
      }

      return await saveFaceVector(citizenId, descriptor);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'خطأ في معالجة الصورة';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [isModelLoaded, saveFaceVector]);

  // استخراج والبحث من صورة
  const processAndSearchImage = useCallback(async (
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    threshold = 0.7,
    limit = 5
  ): Promise<{ success: boolean; matches?: FaceMatch[]; error?: string }> => {
    try {
      if (!isModelLoaded) {
        throw new Error('النماذج غير محملة بعد');
      }

      setIsLoading(true);
      
      const descriptor = await extractFaceDescriptor(imageElement);
      
      if (!descriptor) {
        throw new Error('لم يتم اكتشاف وجه في الصورة');
      }

      return await searchFaces(descriptor, threshold, limit);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'خطأ في معالجة الصورة';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [isModelLoaded, searchFaces]);

  return {
    isModelLoaded,
    isLoading,
    error,
    saveFaceVector,
    searchFaces,
    processAndSaveImage,
    processAndSearchImage,
    extractFaceDescriptor,
    extractAllFaceDescriptors
  };
};