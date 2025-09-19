import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FaceVerificationRequest {
  userId: string;
  imageData: string;
  faceEmbedding: number[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, imageData, faceEmbedding }: FaceVerificationRequest = await req.json();
    
    if (!userId || !imageData || !faceEmbedding) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get stored face data for the user
    const { data: storedFaceData, error: fetchError } = await supabase
      .from('face_data')
      .select('face_encoding')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (fetchError || !storedFaceData) {
      return new Response(
        JSON.stringify({ error: 'No face data found for user' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Decrypt stored embedding (simplified decryption)
    let storedEmbedding: number[];
    try {
      const decryptedData = atob(storedFaceData.face_encoding);
      const embeddingData = atob(decryptedData);
      const uint8Array = new Uint8Array([...embeddingData].map(c => c.charCodeAt(0)));
      const float32Array = new Float32Array(uint8Array.buffer);
      storedEmbedding = Array.from(float32Array);
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      return new Response(
        JSON.stringify({ error: 'Failed to decrypt face data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate cosine similarity between embeddings
    const similarity = calculateCosineSimilarity(faceEmbedding, storedEmbedding);
    
    // Set threshold for face matching (adjust as needed)
    const threshold = 0.75;
    const isMatch = similarity >= threshold;

    // Log verification attempt for security monitoring
    console.log(`Face verification attempt for user ${userId}: similarity=${similarity.toFixed(3)}, match=${isMatch}`);

    if (isMatch) {
      // Update last login timestamp in profiles
      await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    }

    return new Response(
      JSON.stringify({
        success: isMatch,
        similarity: similarity,
        message: isMatch ? 'Face verification successful' : 'Face verification failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Face verification error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function calculateCosineSimilarity(a: number[], b: number[]): number {
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