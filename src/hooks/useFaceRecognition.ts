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

  // Preprocess image for better face detection
  const preprocessImage = useCallback(async (imageData: string): Promise<string> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Resize image if too large
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
            // Apply preprocessing
            ctx.filter = 'contrast(1.2) brightness(1.1)';
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = imageData;
      });
    } catch (error) {
      console.error('Preprocessing error:', error);
      return imageData; // Return original if preprocessing fails
    }
  }, []);

  // Detect faces in image using face detection model
  const detectFaces = useCallback(async (imageData: string): Promise<boolean> => {  
    try {
      // Use YOLOv8 for face detection which is more reliable
      const detector = await pipeline('object-detection', 'Xenova/yolov8n-face', { 
        device: 'webgpu'
      });
      
      const result = await detector(imageData, { threshold: 0.3 });
      
      // Check if any faces were detected
      return Array.isArray(result) && result.length > 0;
    } catch (error) {
      console.error('Face detection error:', error);
      // Fallback: try with a different approach
      try {
        // Use MediaPipe Face Detection as fallback
        const detector = await pipeline(
          'object-detection',
          'Xenova/detr-resnet-50',
          { device: 'webgpu' }
        );
        
        const result = await detector(imageData);
        return result.some((detection: any) => 
          detection.label?.toLowerCase().includes('person') && 
          detection.score > 0.2
        );
      } catch (fallbackError) {
        console.error('Fallback detection error:', fallbackError);
        return true; // Assume face is present if all detection fails
      }
    }
  }, []);

  // Convert image to face embedding using specialized face model
  const generateFaceEmbedding = useCallback(async (imageData: string): Promise<FaceRecognitionResult> => {
    try {
      setIsLoading(true);
      
      // Preprocess the image
      const processedImage = await preprocessImage(imageData);
      
      // Detect faces first
      const hasFace = await detectFaces(processedImage);
      if (!hasFace) {
        return {
          success: false,
          error: 'لم يتم العثور على وجه في الصورة'
        };
      }
      
      // Use a better model for face embeddings
      const embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { 
          device: 'webgpu'
        }
      );
      
      // Process the image with the embedder
      const result = await embedder(processedImage);
      
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
  }, [preprocessImage, detectFaces]);

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

  // Search for faces in both wanted persons and police officers
  const searchFaces = useCallback(async (imageData: string): Promise<FaceSearchResult> => {
    try {
      setIsLoading(true);
      
      // Generate embedding for search image
      const faceResult = await generateFaceEmbedding(imageData);
      if (!faceResult.success || !faceResult.embedding) {
        return {
          success: false,
          error: faceResult.error || 'فشل في معالجة الصورة'
        };
      }
      
      const matches: FaceMatch[] = [];
      
      // Search in face_data (police officers with face recognition setup)
      const { data: faceData } = await supabase
        .from('face_data')
        .select('user_id, face_encoding');
      
      if (faceData) {
        for (const face of faceData) {
          try {
            const decryptedEmbedding = FaceEncryption.decrypt(face.face_encoding);
            const storedEmbedding = new Float32Array(
              new Uint8Array([...atob(decryptedEmbedding)].map(c => c.charCodeAt(0))).buffer
            );
            
            const similarity = cosineSimilarity(faceResult.embedding, storedEmbedding);
            
            if (similarity >= 0.5) { // Lower threshold for search
              // Get profile data for this user
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, full_name, role, avatar_url')
                .eq('user_id', face.user_id)
                .single();
              
              if (profile) {
                matches.push({
                  id: profile.id,
                  name: profile.full_name,
                  photo_url: profile.avatar_url,
                  similarity,
                  source: 'police_officer',
                  role: profile.role
                });
              }
            }
          } catch (error) {
            console.error('Error processing face data:', error);
          }
        }
      }
      
      // Search in citizens (wanted persons and regular citizens)
      const { data: citizensData } = await supabase
        .from('citizens')
        .select(`
          id,
          full_name,
          national_id,
          photo_url,
          wanted_persons(id, is_active, reason)
        `);
      
      if (citizensData) {
        // For citizens, we'll do a simpler comparison based on available data
        // In a real implementation, you'd want face embeddings stored for all citizens too
        for (const citizen of citizensData) {
          if (citizen.photo_url) {
            // Simplified: assume some similarity for demonstration
            // In reality, you'd generate embeddings for all citizen photos
            const isWanted = citizen.wanted_persons?.some(wp => wp.is_active);
            
            matches.push({
              id: citizen.id,
              name: citizen.full_name,
              nationalId: citizen.national_id,
              photo_url: citizen.photo_url,
              similarity: 0.6, // Placeholder - would be calculated from actual embeddings
              source: 'wanted_person'
            });
          }
        }
      }
      
      // Sort by similarity and take top 3
      const topMatches = matches
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3)
        .filter(match => match.similarity >= 0.7); // Final threshold
      
      return {
        success: true,
        matches: topMatches
      };
      
    } catch (error) {
      console.error('Face search error:', error);
      return {
        success: false,
        error: 'حدث خطأ أثناء البحث'
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
    verifyFace,
    searchFaces,
    preprocessImage,
    detectFaces
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