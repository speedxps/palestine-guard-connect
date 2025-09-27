import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract image data (remove data:image/...;base64, prefix if present)
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')

    // Generate face embedding using OpenAI Vision API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this face image and return a detailed description of facial features for recognition purposes. Focus on distinctive features like eye shape, nose structure, jawline, etc. Return only the facial feature description as a single string.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API Error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to analyze face image' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const aiResult = await openaiResponse.json()
    const faceDescription = aiResult.choices[0]?.message?.content || ''

    // Get all citizens from database with their face embeddings
    const { data: citizens, error: citizensError } = await supabase
      .from('citizens')
      .select('id, national_id, full_name, photo_url, face_embedding')
      .not('face_embedding', 'is', null)

    if (citizensError) {
      console.error('Database error:', citizensError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch citizens data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find the best match by comparing face descriptions
    let bestMatch = null
    let highestSimilarity = 0

    for (const citizen of citizens) {
      if (citizen.face_embedding) {
        // Simple text similarity comparison
        const similarity = calculateTextSimilarity(faceDescription, citizen.face_embedding)
        
        if (similarity > highestSimilarity && similarity > 0.3) { // 30% threshold
          highestSimilarity = similarity
          bestMatch = {
            id: citizen.id,
            national_id: citizen.national_id,
            full_name: citizen.full_name,
            photo_url: citizen.photo_url,
            similarity: similarity
          }
        }
      }
    }

    if (bestMatch) {
      return new Response(
        JSON.stringify({
          success: true,
          matches: [bestMatch]
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          matches: [],
          error: 'لم يتم العثور على تطابق كافٍ'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error in face recognition:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Simple text similarity function
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)
  
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}