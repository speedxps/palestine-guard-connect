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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

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

    const { data: citizens, error: citizensError } = await supabase
      .from('citizens')
      .select('id, full_name, photo_url, face_embedding')
      .not('photo_url', 'is', null)
      .is('face_embedding', null)

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

    console.log(`Processing ${citizens.length} citizens for face embedding generation`)

    const results = []
    let successful = 0
    let failed = 0

    for (const citizen of citizens) {
      try {
        console.log(`Processing citizen: ${citizen.full_name}`)
        
        const imageResponse = await fetch(citizen.photo_url)
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`)
        }
        
        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
        
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
                    text: 'حلل هذه الصورة للوجه وقدم وصفاً تفصيلياً للملامح المميزة للتعرف على الوجه. ركز على الملامح المميزة مثل شكل العين وبنية الأنف وخط الفك ونسب الوجه وما إلى ذلك. أرجع فقط وصف الملامح الوجهية كنص تفصيلي واحد بالعربية.'
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
          throw new Error(`OpenAI API error: ${openaiResponse.status}`)
        }

        const aiResult = await openaiResponse.json()
        const faceEmbedding = aiResult.choices[0]?.message?.content || ''

        if (!faceEmbedding) {
          throw new Error('No face embedding generated')
        }

        const { error: updateError } = await supabase
          .from('citizens')
          .update({ face_embedding: faceEmbedding })
          .eq('id', citizen.id)

        if (updateError) {
          throw new Error(`Database update error: ${updateError.message}`)
        }

        results.push({
          citizen_id: citizen.id,
          name: citizen.full_name,
          status: 'success'
        })
        successful++
        
        console.log(`Successfully processed: ${citizen.full_name}`)
        
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error: any) {
        console.error(`Error processing citizen ${citizen.full_name}:`, error)
        results.push({
          citizen_id: citizen.id,
          name: citizen.full_name,
          status: 'failed',
          error: error.message
        })
        failed++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Batch processing completed',
        summary: {
          total_citizens: citizens.length,
          processed: citizens.length,
          successful: successful,
          failed: failed
        },
        results: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('Error in batch processing:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})