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

    // Get citizens who have photos but no face_embedding
    const { data: citizens, error: citizensError } = await supabase
      .from('citizens')
      .select('id, national_id, full_name, photo_url, face_embedding')
      .not('photo_url', 'is', null)
      .is('face_embedding', null)
      .limit(10) // Process 10 at a time

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

    console.log(`Processing ${citizens.length} citizens`)

    const results = []
    let processed = 0
    let successful = 0

    for (const citizen of citizens) {
      try {
        console.log(`Processing citizen: ${citizen.full_name} (${citizen.national_id})`)
        
        // Fetch the image from the URL
        const imageResponse = await fetch(citizen.photo_url)
        if (!imageResponse.ok) {
          console.error(`Failed to fetch image for ${citizen.full_name}`)
          results.push({
            citizen_id: citizen.id,
            name: citizen.full_name,
            status: 'failed',
            error: 'Failed to fetch image'
          })
          processed++
          continue
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))

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
                    text: 'Analyze this face image and provide a very detailed description of distinctive facial features for recognition purposes. Include: eye shape and color, nose shape and size, jawline characteristics, facial structure, eyebrow shape, mouth shape, cheek structure, and any distinctive marks. Be very specific and detailed to enable accurate face matching. Return only a detailed facial feature description.'
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
            max_tokens: 800
          })
        })

        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text()
          console.error(`OpenAI API Error for ${citizen.full_name}:`, errorText)
          results.push({
            citizen_id: citizen.id,
            name: citizen.full_name,
            status: 'failed',
            error: 'OpenAI API error'
          })
          processed++
          continue
        }

        const aiResult = await openaiResponse.json()
        const faceEmbedding = aiResult.choices[0]?.message?.content || ''

        if (!faceEmbedding) {
          console.error(`No face embedding generated for ${citizen.full_name}`)
          results.push({
            citizen_id: citizen.id,
            name: citizen.full_name,
            status: 'failed',
            error: 'No face embedding generated'
          })
          processed++
          continue
        }

        // Update the citizen record with the face embedding
        const { error: updateError } = await supabase
          .from('citizens')
          .update({ face_embedding: faceEmbedding })
          .eq('id', citizen.id)

        if (updateError) {
          console.error(`Database update error for ${citizen.full_name}:`, updateError)
          results.push({
            citizen_id: citizen.id,
            name: citizen.full_name,
            status: 'failed',
            error: 'Database update error'
          })
        } else {
          console.log(`Successfully processed ${citizen.full_name}`)
          results.push({
            citizen_id: citizen.id,
            name: citizen.full_name,
            status: 'success'
          })
          successful++
        }

        processed++

      } catch (error) {
        console.error(`Error processing ${citizen.full_name}:`, error)
        results.push({
          citizen_id: citizen.id,
          name: citizen.full_name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        processed++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processing completed`,
        summary: {
          total_citizens: citizens.length,
          processed: processed,
          successful: successful,
          failed: processed - successful
        },
        results: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in batch generate embeddings:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})