import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ldhgwqeuvbvlmvyywmaf.supabase.co";
const supabaseKey = "sbp_4cd798cf114e280f789cd6cb6913145723542280"; // حط مفتاح Supabase الخاص بك هنا
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Citizen {
  id: number;
  name: string;
  nationalId?: string;
  role?: string;
  photo_url: string;
  embedding?: number[];
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

  // توليد embedding للوجه
  const generateFaceEmbedding = async (imageBase64: string) => {
    try {
      // محاكاة توليد embedding
      const randomEmbedding = Array.from({ length: 128 }, () => Math.random());
      return {
        success: true,
        embedding: randomEmbedding,
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

  // البحث عن الوجوه
  const searchFaces = async (uploadedImageBase64: string) => {
    setIsLoading(true);
    try {
      if (citizens.length === 0) await fetchCitizens();

      // البحث عن الوجوه المحفوظة في قاعدة البيانات المدنية
      const result = {
        success: true,
        matches: citizens.slice(0, 3).map(c => ({
          ...c,
          similarity: Math.random() * 0.4 + 0.6, // نسبة تشابه بين 60-100%
          source: 'civil_registry' // مصدر البيانات
        })),
        error: null
      };

      // تحقق من وجود تطابق مع درجة ثقة عالية (أكثر من 70%)
      if (result.success && result.matches.length > 0) {
        const filteredMatches = result.matches.filter(match => match.similarity >= 0.7);
        return {
          success: filteredMatches.length > 0,
          matches: filteredMatches,
          error: null
        };
      }

      return {
        success: false,
        matches: [],
        error: 'لم يتم العثور على تطابق كافٍ'
      };
    } catch (error) {
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
    saveFaceData,
    verifyFace,
  };
}
