import { useState, useCallback } from 'react';
import { pipeline, env } from '@huggingface/transformers';
import { supabase } from '@/integrations/supabase/client';
import { FaceEncryption } from '@/utils/faceEncryption';

env.allowLocalModels = false;
env.useBrowserCache = true;

interface FaceMatch {
  id: string;
  name: string;
  nationalId?: string;
  photo_url?: string;
  similarity: number;
  source: 'wanted_person' | 'police_officer';
  role?: string;
}

interface FaceRecognitionResult {
  success: boolean;
  embedding?: Float32Array;
  error?: string;
}

export const useFaceRecognition = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const preprocessImage = useCallback(async (imageData: string): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    return new Promise((resolve) => {
      img.onload = () => {
        const maxSize = 512;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        if (ctx) {
          ctx.filter = 'contrast(1.2) brightness(1.1)';
          ctx.drawImage(img, 0, 0, width, height);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }, []);

  const detectFaces = useCallback(async (imageData: string): Promise<boolean> => {
    try {
      const detector = await pipeline('object-detection', 'Xenova/detr-resnet-50', { device: 'webgpu' });
      const result = await detector(imageData);
      return result.some((d: any) => d.label?.toLowerCase().includes('person') && d.score > 0.5);
    } catch (error) {
      console.error('Face detection error:', error);
      return true;
    }
  }, []);

  const generateFaceEmbedding = useCallback(async (imageData: string): Promise<FaceRecognitionResult> => {
    try {
      setIsLoading(true);
      const processedImage = await preprocessImage(imageData);
      const hasFace = await detectFaces(processedImage);
      if (!hasFace) return { success: false, error: 'لم يتم العثور على وجه في الصورة' };

      const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { device: 'webgpu' });
      const result = await embedder(processedImage);
      setIsModelLoaded(true);
      return { success: true, embedding: new Float32Array(result.data) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'فشل في معالجة الصورة' };
    } finally {
      setIsLoading(false);
    }
  }, [preprocessImage, detectFaces]);

  const searchFaces = useCallback(async (imageData: string): Promise<{ success: boolean; matches?: FaceMatch[]; error?: string }> => {
    try {
      setIsLoading(true);
      const faceResult = await generateFaceEmbedding(imageData);
      if (!faceResult.success || !faceResult.embedding) return { success: false, error: faceResult.error };

      const matches: FaceMatch[] = [];

      const { data: faceData } = await supabase.from('face_data').select('user_id, face_encoding');
      if (faceData) {
        for (const face of faceData) {
          try {
            const decrypted = FaceEncryption.decrypt(face.face_encoding);
            const storedEmbedding = new Float32Array(new Uint8Array([...atob(decrypted)].map(c => c.charCodeAt(0))).buffer);
            const similarity = cosineSimilarity(faceResult.embedding, storedEmbedding);
            if (similarity >= 0.5) {
              const { data: profile } = await supabase.from('profiles').select('id, full_name, role, avatar_url').eq('user_id', face.user_id).single();
              if (profile) {
                matches.push({ id: profile.id, name: profile.full_name, role: profile.role, photo_url: profile.avatar_url, similarity, source: 'police_officer' });
              }
            }
          } catch {}
        }
      }

      const topMatches = matches.sort((a, b) => b.similarity - a.similarity).slice(0, 3).filter(m => m.similarity >= 0.7);
      return { success: true, matches: topMatches };
    } catch (error) {
      return { success: false, error: 'حدث خطأ أثناء البحث' };
    } finally {
      setIsLoading(false);
    }
  }, [generateFaceEmbedding]);

  return { isLoading, isModelLoaded, generateFaceEmbedding, searchFaces };
};

// Helper
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; normA += a[i] * a[i]; normB += b[i] * b[i]; }
  const mag = Math.sqrt(normA) * Math.sqrt(normB);
  return mag === 0 ? 0 : dot / mag;
}
