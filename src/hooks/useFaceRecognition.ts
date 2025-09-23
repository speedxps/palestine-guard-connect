import { useState, useCallback } from "react";

// دالة لحساب التشابه الكوني بين متجهين
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// مثال لدالة توليد الـembedding للوجه (تستبدل بالـAPI الحقيقي أو النموذج)
async function generateFaceEmbedding(base64Image: string): Promise<Float32Array> {
  // محاكاة: استرجاع مصفوفة أرقام عشوائية كمثال
  return new Float32Array(Array.from({ length: 128 }, () => Math.random()));
}

// قاعدة بيانات وهمية للوجوه للتجربة
const faceDatabase: {
  id: string;
  name: string;
  nationalId?: string;
  role?: string;
  embedding: Float32Array;
  photo_url?: string;
}[] = [
  {
    id: "1",
    name: "Noor Irjan",
    nationalId: "123456789",
    role: "Officer",
    embedding: new Float32Array(Array.from({ length: 128 }, () => Math.random())),
    photo_url: "/faces/noor.png",
  },
  {
    id: "2",
    name: "Ahmad Ali",
    nationalId: "987654321",
    role: "Detective",
    embedding: new Float32Array(Array.from({ length: 128 }, () => Math.random())),
    photo_url: "/faces/ahmad.png",
  },
];

export function useFaceRecognition() {
  const [matches, setMatches] = useState<any[]>([]);

  const searchFaces = useCallback(async (base64Image: string) => {
    try {
      const queryEmbedding = await generateFaceEmbedding(base64Image);

      // البحث في قاعدة البيانات
      const results = faceDatabase.map((entry) => {
        const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
        return { ...entry, similarity };
      });

      // ترتيب حسب التشابه الأعلى
      results.sort((a, b) => b.similarity - a.similarity);

      // إعادة الوجوه التي التشابه أكبر من 0.7
      const matched = results.filter((r) => r.similarity > 0.7);

      setMatches(matched);

      return { success: true, matches: matched };
    } catch (err: any) {
      return { success: false, matches: [], error: err.message || "Error" };
    }
  }, []);

  return { matches, searchFaces };
}
