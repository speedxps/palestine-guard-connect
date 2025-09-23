import { useState, useCallback } from 'react';
import { pipeline, env } from '@huggingface/transformers';
import { supabase } from '@/integrations/supabase/client';
import { FaceEncryption } from '@/utils/faceEncryption';

// Configure transformers to use CDN for models
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

interface SaveFaceDataResult {
  success: boolean;
  error?: string;
}

interface VerifyFaceResult {
  success: boolean;
  similarity?: number;
  error?: string;
}

interface FaceSearchResult {
  success: boolean;
  matches?: FaceMatch[];
  error?: string;
}

export const useFaceRecognition = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const preprocessImage = useCallback(async (imageData: string): Promise<string> => {
    try {
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
    } catch (error) {
      console.error('Preprocessing error:', error);
      return imageData;
    }
  }, []);

  const detectFaces = useCallback(async (imageData: string): Promise<boolean> => {
    try {
      const detector = await pipeline('object-detection', 'Xenova/detr-resnet-50', { device: 'webgpu' });
      const result = await detector(imageData);
      return result.some((detection: any) => detection.label?.toLowerCase().includes('person') && detection.score > 0.5);
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
      if (!hasFace) {
        return { success: false, error: 'لم يتم العثور على وجه في الصورة' };
      }
      const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { device: 'webgpu' });
      const result = await embedder(processedImage);
      setIsModelLoaded(true);
      const embedding = new Float32Array(result.data);
      return { success: true, embedding };
    } catch (error) {
      console.error('Face embedding generation error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'فشل في معالجة الصورة' };
    } finally {
      setIsLoading(false);
    }
  }, [preprocessImage, detectFaces]);

  const saveFaceData = useCallback(async (userId: string, imageData: string, embedding: Float32Array): Promise<SaveFaceDataResult> => {
    try {
      const embeddingBase64 = btoa(String.fromCharCode(...new Uint8Array(embedding.buffer)));
      const encryptedEmbedding = FaceEncryption.encrypt(embeddingBase64);
      const fileName = `face-${userId}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('citizen-photos').upload(fileName, dataURLtoBlob(imageData), { contentType: 'image/jpeg', upsert: true });
      if (uploadError) console.warn('Image upload failed:', uploadError);
      const { error } = await supabase.from('face_data').upsert({ user_id: userId, face_encoding: encryptedEmbedding, image_url: null, is_active: true });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Save face data error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'فشل في حفظ بيانات الوجه' };
    }
  }, []);

  const verifyFace = useCallback(async (userId: string, imageData: string): Promise<VerifyFaceResult> => {
    try {
      setIsLoading(true);
      const currentFaceResult = await generateFaceEmbedding(imageData);
      if (!currentFaceResult.success || !currentFaceResult.embedding) return { success: false, error: 'فشل في معالجة الصورة الحالية' };
      const { data: storedFaceData, error } = await supabase.from('face_data').select('face_encoding').eq('user_id', userId).eq('is_active', true).single();
      if (error || !storedFaceData) return { success: false, error: 'لم يتم العثور على بيانات الوجه المحفوظة' };
      const decryptedEmbedding = FaceEncryption.decrypt(storedFaceData.face_encoding);
      const storedEmbedding = new Float32Array(new Uint8Array([...atob(decryptedEmbedding)].map(c => c.charCodeAt(0))).buffer);
      const similarity = cosineSimilarity(currentFaceResult.embedding, storedEmbedding);
      const threshold = 0.7;
      return { success: similarity >= threshold, similarity, error: similarity >= threshold ? undefined : 'الوجه غير متطابق مع البيانات المحفوظة' };
    } catch (error) {
      console.error('Face verification error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'فشل في التحقق من الوجه' };
    } finally {
      setIsLoading(false);
    }
  }, [generateFaceEmbedding]);

  const searchFaces = useCallback(async (imageData: string): Promise<FaceSearchResult> => {
    try {
      setIsLoading(true);
      const faceResult = await generateFaceEmbedding(imageData);
      if (!faceResult.success || !faceResult.embedding) return { success: false, error: faceResult.error || 'فشل في معالجة الصورة' };
      const matches: FaceMatch[] = [];
      const { data: faceData } = await supabase.from('face_data').select('user_id, face_encoding');
      if (faceData) {
        for (const face of faceData) {
          try {
            const decryptedEmbedding = FaceEncryption.decrypt(face.face_encoding);
            const storedEmbedding = new Float32Array(new Uint8Array([...atob(decryptedEmbedding)].map(c => c.charCodeAt(0))).buffer);
            const similarity = cosineSimilarity(faceResult.embedding, storedEmbedding);
            if (similarity >= 0.5) {
              const { data: profile } = await supabase.from('profiles').select('id, full_name, role, avatar_url').eq('user_id', face.user_id).single();
              if (profile) matches.push({ id: profile.id, name: profile.full_name, photo_url: profile.avatar_url, similarity, source: 'police_officer', role: profile.role });
            }
          } catch (error) { console.error('Error processing face data:', error); }
        }
      }
      const { data: citizensData } = await supabase.from('citizens').select('id, full_name, national_id, photo_url, wanted_persons(id, is_active, reason)');
      if (citizensData) {
        for (const citizen of citizensData) {
          if (citizen.photo_url) matches.push({ id: citizen.id, name: citizen.full_name, nationalId: citizen.national_id, photo_url: citizen.photo_url, similarity: 0.6, source: 'wanted_person' });
        }
      }
      const topMatches = matches.sort((a, b) => b.similarity - a.similarity).slice(0, 3).filter(m => m.similarity >= 0.7);
      return { success: true, matches: topMatches };
    } catch (error) {
      console.error('Face search error:', error);
      return { success: false, error: 'حدث خطأ أثناء البحث' };
    } finally {
      setIsLoading(false);
    }
  }, [generateFaceEmbedding]);

  return {
    isLoading,
    isModelLoaded,
    generateFaceEmbedding,
    saveFaceData,
    verifyFace,
    searchFaces
  };
};

// Helpers
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
  let dot =
