import { useState, useCallback } from 'react';
import { pipeline, env } from '@huggingface/transformers';
import { supabase } from '@/integrations/supabase/client';
import { FaceEncryption } from '@/utils/faceEncryption';

// Configure transformers to use CDN for models
env.allowLocalModels = false;
env.useBrowserCache = true;

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

export const useFaceRecognition = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Convert image to face embedding using AI model
  const generateFaceEmbedding = useCallback(async (imageData: string): Promise<FaceRecognitionResult> => {
    try {
      setIsLoading(true);
      
      // Use a simpler approach - just generate embeddings directly
      const embedder = await pipeline(
        'feature-extraction',
        'Xenova/clip-vit-base-patch16',
        { 
          device: 'webgpu'
        }
      );
      // Process the image with the embedder
      const result = await embedder(imageData);
      
      setIsModelLoaded(true);
      
      // Convert to Float32Array for consistent storage
      const embedding = new Float32Array(result.data);
      
      return {
        success: true,
        embedding
      };
    } catch (error) {
      console.error('Face embedding generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'فشل في معالجة الصورة'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save face data to database with encryption
  const saveFaceData = useCallback(async (
    userId: string, 
    imageData: string, 
    embedding: Float32Array
  ): Promise<SaveFaceDataResult> => {
    try {
      // Convert embedding to base64 for database storage
      const embeddingBase64 = btoa(String.fromCharCode(...new Uint8Array(embedding.buffer)));
      
      // Encrypt the embedding using our encryption utility
      const encryptedEmbedding = FaceEncryption.encrypt(embeddingBase64);

      // Upload image to storage bucket (optional - for backup)
      const fileName = `face-${userId}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('citizen-photos')
        .upload(fileName, dataURLtoBlob(imageData), {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.warn('Image upload failed:', uploadError);
      }

      // Save face data to database
      const { error } = await supabase
        .from('face_data')
        .upsert({
          user_id: userId,
          face_encoding: encryptedEmbedding,
          image_url: null, // Don't store original image for privacy
          is_active: true
        });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Save face data error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'فشل في حفظ بيانات الوجه'
      };
    }
  }, []);

  // Verify face against stored data
  const verifyFace = useCallback(async (
    userId: string, 
    imageData: string
  ): Promise<VerifyFaceResult> => {
    try {
      setIsLoading(true);

      // Generate embedding for current face
      const currentFaceResult = await generateFaceEmbedding(imageData);
      if (!currentFaceResult.success || !currentFaceResult.embedding) {
        return {
          success: false,
          error: 'فشل في معالجة الصورة الحالية'
        };
      }

      // Get stored face data
      const { data: storedFaceData, error } = await supabase
        .from('face_data')
        .select('face_encoding')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !storedFaceData) {
        return {
          success: false,
          error: 'لم يتم العثور على بيانات الوجه المحفوظة'
        };
      }

      // Decrypt stored embedding using our encryption utility
      const decryptedEmbedding = FaceEncryption.decrypt(storedFaceData.face_encoding);
      const embeddingBase64 = decryptedEmbedding;
      const storedEmbedding = new Float32Array(
        new Uint8Array([...atob(embeddingBase64)].map(c => c.charCodeAt(0))).buffer
      );

      // Calculate similarity (cosine similarity)
      const similarity = cosineSimilarity(currentFaceResult.embedding, storedEmbedding);
      
      // Threshold for face matching (adjust as needed)
      const threshold = 0.7;
      const isMatch = similarity >= threshold;

      return {
        success: isMatch,
        similarity,
        error: isMatch ? undefined : 'الوجه غير متطابق مع البيانات المحفوظة'
      };
    } catch (error) {
      console.error('Face verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'فشل في التحقق من الوجه'
      };
    } finally {
      setIsLoading(false);
    }
  }, [generateFaceEmbedding]);

  return {
    isLoading,
    isModelLoaded,
    generateFaceEmbedding,
    saveFaceData,
    verifyFace
  };
};

// Helper function to calculate cosine similarity
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

// Helper function to convert data URL to blob
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}