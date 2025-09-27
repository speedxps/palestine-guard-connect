import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Citizen {
  id: string;
  national_id: string;
  full_name: string;
  photo_url: string;
  similarity?: number;
}

export function useFaceRecognition() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // جلب البيانات من Supabase
  const fetchCitizens = async () => {
    const { data, error } = await supabase
      .from("citizens")
      .select("*");
    if (error) throw new Error(error.message);
    setCitizens(data as Citizen[]);
  };

  // توليد face embedding (للتوافق مع الكود القديم)
  const generateFaceEmbedding = async (imageBase64: string) => {
    try {
      // محاكاة بسيطة للتوافق مع الكود القديم
      return {
        success: true,
        embedding: Array.from({ length: 128 }, () => Math.random()),
        error: null
      };
    } catch (error) {
      console.error('Error generating face embedding:', error);
      return {
        success: false,
        embedding: null,
        error: error instanceof Error ? error.message : 'خطأ في توليد embedding'
      };
    }
  };

  // توليد face embedding وحفظه
  const generateAndSaveFaceEmbedding = async (citizenId: string, imageBase64: string) => {
    try {
      // استخدام OpenAI لتحليل الوجه
      const { data, error } = await supabase.functions.invoke('generate-face-embedding', {
        body: { imageBase64, citizenId }
      });
      
      if (error) throw error;
      
      return {
        success: true,
        embedding: data.embedding,
        error: null
      };
    } catch (error) {
      console.error('Error generating face embedding:', error);
      return {
        success: false,
        embedding: null,
        error: error instanceof Error ? error.message : 'خطأ في توليد embedding'
      };
    }
  };

  // حفظ بيانات الوجه
  const saveFaceData = async (userId: string, imageUrl: string, embedding: number[]) => {
    try {
      const { error } = await supabase
        .from('face_data')
        .upsert({
          user_id: userId,
          face_encoding: JSON.stringify(embedding),
          image_url: imageUrl
        });
      
      if (error) throw error;
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Error saving face data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في حفظ البيانات'
      };
    }
  };

  // التحقق من الوجه
  const verifyFace = async (imageBase64: string) => {
    setIsLoading(true);
    try {
      const result = await searchFaces(imageBase64);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  // البحث عن الوجوه باستخدام AI حقيقي
  const searchFaces = async (uploadedImageBase64: string) => {
    setIsLoading(true);
    console.log('بدء البحث عن الوجه...');
    
    try {
      // استدعاء edge function للتعرف على الوجه
      const { data, error } = await supabase.functions.invoke('face-recognition', {
        body: { imageBase64: uploadedImageBase64 }
      });

      if (error) {
        console.error('خطأ في استدعاء face-recognition function:', error);
        throw error;
      }

      console.log('نتيجة البحث:', data);

      if (data.success && data.matches && data.matches.length > 0) {
        return {
          success: true,
          matches: data.matches,
          error: null
        };
      } else {
        return {
          success: false,
          matches: [],
          error: data.error || 'لم يتم العثور على تطابق كافٍ'
        };
      }
    } catch (error) {
      console.error('خطأ في البحث عن الوجه:', error);
      return {
        success: false,
        matches: [],
        error: error instanceof Error ? error.message : 'حدث خطأ في البحث'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    citizens,
    isLoading,
    fetchCitizens,
    searchFaces,
    generateFaceEmbedding,
    generateAndSaveFaceEmbedding,
    saveFaceData,
    verifyFace,
  };
}
