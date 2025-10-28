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

  // First, verify that the image contains a face
  const verificationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
          content: 'You are an image analysis expert. Your task is to verify if there is a clear human face in the image.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Does this image contain a clear human face? Answer with only one word: "yes" or "no". Do not accept logos, symbols, or non-human images.'
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
      max_tokens: 10
    })
  })

  if (!verificationResponse.ok) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'فشل في التحقق من الصورة',
        matches: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  const verificationResult = await verificationResponse.json()
  const hasFace = verificationResult.choices[0]?.message?.content?.trim()?.toLowerCase()
  
  if (!hasFace?.includes('yes')) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'الصورة لا تحتوي على وجه بشري واضح. يرجى رفع صورة وجه فقط.',
        matches: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

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
        JSON.stringify({ 
          success: false,
          error: 'خطأ في تحليل الصورة. يرجى المحاولة مرة أخرى.',
          matches: []
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const aiResult = await geminiResponse.json()
    const faceDescription = aiResult.choices[0]?.message?.content || ''
    
    console.log('Face description generated:', faceDescription.substring(0, 100) + '...')

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

    const matches: Array<{
      id: string;
      national_id: string;
      name: string;
      photo_url: string;
      similarity: number;
    }> = []

    console.log(`Starting AI comparison for ${citizens.length} citizens...`)

    // استخدام AI للمقارنة الذكية لكل مواطن
    for (const citizen of citizens) {
      if (citizen.face_embedding) {
        try {
          const similarity = await compareWithAI(
            faceDescription, 
            citizen.face_embedding,
            lovableApiKey
          )
          
          console.log(`AI Comparison with ${citizen.full_name}: ${similarity.toFixed(1)}% similarity`)
          
          // رفع الحد الأدنى إلى 70%
          if (similarity >= 70) {
            matches.push({
              id: citizen.id,
              national_id: citizen.national_id,
              name: citizen.full_name,
              photo_url: citizen.photo_url,
              similarity: similarity / 100 // تحويل إلى نسبة من 0 إلى 1
            })
          }
        } catch (error) {
          console.error(`Error comparing with ${citizen.full_name}:`, error)
        }
      }
    }

    // ترتيب النتائج حسب التطابق
    matches.sort((a, b) => b.similarity - a.similarity)
    
    // أخذ أفضل 3 نتائج
    const topMatches = matches.slice(0, 3)

    if (topMatches.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          matches: topMatches
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
          error: 'لم يتم العثور على تطابق كافٍ (الحد الأدنى 70%)'
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

/**
 * استخدام AI للمقارنة الذكية بين وصفي الوجه
 * يعيد نسبة التشابه من 0 إلى 100
 */
async function compareWithAI(
  description1: string, 
  description2: string,
  apiKey: string
): Promise<number> {
  
  const comparisonPrompt = `أنت خبير في التعرف على الوجوه ومقارنتها. لديك وصفان تفصيليان لوجهين. مهمتك:

1. قارن الوصفين بعناية فائقة
2. ركز على: شكل الوجه، العيون، الأنف، الفم، الشعر، البشرة، العلامات المميزة
3. أعط نسبة تشابه من 0 إلى 100
4. كن دقيقاً جداً: إذا كانت هناك اختلافات واضحة، أعط نسبة منخفضة
5. أجب برقم فقط (مثال: 85)

الوصف الأول:
${description1}

الوصف الثاني:
${description2}

النسبة المئوية للتشابه (0-100):`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in facial recognition. You compare detailed facial descriptions and return a similarity percentage from 0 to 100. Only return a number.'
          },
          {
            role: 'user',
            content: comparisonPrompt
          }
        ],
        max_tokens: 10
      })
    })

    if (!response.ok) {
      console.error('AI comparison failed:', await response.text())
      return 0
    }

    const result = await response.json()
    const similarityText = result.choices[0]?.message?.content?.trim() || '0'
    
    // استخراج الرقم من الرد
    const similarityMatch = similarityText.match(/\d+/)
    const similarity = similarityMatch ? parseInt(similarityMatch[0], 10) : 0
    
    // التأكد من أن النسبة بين 0 و 100
    return Math.max(0, Math.min(100, similarity))
    
  } catch (error) {
    console.error('Error in AI comparison:', error)
    return 0
  }
}