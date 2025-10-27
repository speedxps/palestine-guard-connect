import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { citizenId, imageBase64 } = await req.json()

    if (!citizenId || !imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Citizen ID and image data are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'Lovable API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')

    const geminiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a facial feature analysis expert. Describe facial features in extreme detail for identification purposes. This is for security and law enforcement.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Describe this face in EXTREME detail in Arabic. Include: face shape (round/oval/square), eyes (shape/size/color/spacing), eyebrows (shape/thickness), nose (size/shape/width), mouth and lips (size/shape), cheeks, chin and jawline, ears, skin tone, skin texture, hair (color/density/style), facial hair (if any: beard/mustache style, color, length, density), any distinctive marks, wrinkles, age indicators. Be VERY specific and detailed. Write at least 200 words describing every visible facial feature.'
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
        max_tokens: 2000
      })
    })

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text()
      console.error('Gemini API Error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to analyze face image' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const aiResult = await geminiResponse.json()
    const faceEmbedding = aiResult.choices[0]?.message?.content || ''

    const { error: updateError } = await supabase
      .from('citizens')
      .update({ face_embedding: faceEmbedding })
      .eq('id', citizenId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to save face embedding' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        embedding: faceEmbedding
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate face embedding:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})