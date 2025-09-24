import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ldhgwqeuvbvlmvyywmaf.supabase.co";
const supabaseKey = "sbp_4cd798cf114e280f789cd6cb6913145723542280";
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Citizen {
  id: string;
  full_name: string;
  national_id: string;
  photo_url?: string;
  embedding?: number[];
  role?: string;
  source?: string;
}

export function useFaceRecognition() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // جلب المواطنين من Supabase
  const fetchCitizens = async () => {
    try {
      const { data, error } = await supabase
        .from("citizens")
        .select("*");
      if (error) throw error;
      setCitizens(data as Citizen[]);
    } catch (error) {
      console.error("Error fetching citizens:", error);
    }
  };

  // حساب cosine similarity
  const cosineSimilarity = (a: number[], b: number[]) => {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] ** 2;
      normB += b[i] ** 2;
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  // البحث عن وجوه مشابهة
  const searchFaces = async (uploadedEmbedding: number[]) => {
    setIsLoading(true);
    try {
      if (citizens.length === 0) await fetchCitizens();

      const matches = citizens.map(c => ({
        ...c,
        similarity: c.embedding ? cosineSimilarity(uploadedEmbedding, c.embedding) : 0,
        source: "civil_registry"
      }))
      .filter(c => c.similarity >= 0.7)
      .sort((a, b) => b.similarity - a.similarity);

      return {
        success: matches.length > 0,
        matches,
        error: matches.length === 0 ? "لا يوجد تطابق أعلى من 70%" : null
      };
    } catch (error) {
      return {
        success: false,
        matches: [],
        error: error instanceof Error ? error.message : "خطأ أثناء البحث"
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    citizens,
    isLoading,
    fetchCitizens,
    searchFaces
  };
}
