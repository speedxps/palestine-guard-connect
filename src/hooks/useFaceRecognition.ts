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

  // جلب البيانات من Supabase
  const fetchCitizens = async () => {
    const { data, error } = await supabase
      .from("citizens")
      .select("*");
    if (error) throw new Error(error.message);
    setCitizens(data as Citizen[]);
  };

  // مقارنة الوجوه (نفترض هنا دالة وهمية للمثال)
  const searchFaces = async (uploadedImageBase64: string) => {
    // لاحظ: هنا تحتاج تولد embeddings حقيقية للصور
    // مثال وهمي: يقارن فقط أول صورتين
    if (citizens.length === 0) await fetchCitizens();

    // dummy similarity: لو كان الرفع أي صورة، نرجع أول شخصين
    const matches = citizens.slice(0, 2).map(c => ({
      ...c,
      similarity: Math.random() * 0.3 + 0.7 // رقم وهمي للتشابه
    }));

    return {
      success: matches.length > 0,
      matches
    };
  };

  return {
    citizens,
    fetchCitizens,
    searchFaces,
  };
}
