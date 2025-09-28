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

    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')

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
                text: 'حلل هذه الصورة للوجه بدقة عالية وقدم وصفاً شاملاً ومفصلاً للملامح المميزة للوجه للتعرف الدقيق عليه. يجب أن يشمل التحليل: 1) شكل ولون العين وسماكة الحاجبين وقوس الحاجب 2) شكل وحجم الأنف وفتحات الأنف 3) شكل الوجه (بيضاوي/دائري/مربع/قلب) وتعريف خط الفك 4) حجم الفم وسماكة الشفاه 5) بنية الخدين وعظام الوجنتين 6) لون ونسيج البشرة 7) أي علامات مميزة أو ندوب أو خصائص فريدة 8) لون الشعر وخط الشعر 9) تماثل الوجه. كن محدداً جداً ومفصلاً لتمكين المطابقة الدقيقة للوجه. أرجع فقط التحليل التفصيلي للوجه بالعربية.'
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
        max_tokens: 1000
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

    let bestMatch = null
    let highestSimilarity = 0

    for (const citizen of citizens) {
      if (citizen.face_embedding) {
        const similarity = calculateEnhancedSimilarity(faceDescription, citizen.face_embedding)
        
        console.log(`Comparing with ${citizen.full_name}: ${similarity.toFixed(3)} similarity`)
        
        if (similarity > highestSimilarity && similarity > 0.35) {
          highestSimilarity = similarity
          bestMatch = {
            id: citizen.id,
            national_id: citizen.national_id,
            name: citizen.full_name,
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

function calculateEnhancedSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  const wordSimilarity = intersection.size / union.size

  const phrases1 = []
  const phrases2 = []
  
  for (let i = 0; i < words1.length - 1; i++) {
    phrases1.push(`${words1[i]} ${words1[i + 1]}`)
  }
  for (let i = 0; i < words2.length - 1; i++) {
    phrases2.push(`${words2[i]} ${words2[i + 1]}`)
  }
  
  const phraseSet1 = new Set(phrases1)
  const phraseSet2 = new Set(phrases2)
  const phraseIntersection = new Set([...phraseSet1].filter(x => phraseSet2.has(x)))
  const phraseUnion = new Set([...phraseSet1, ...phraseSet2])
  
  const phraseSimilarity = phraseUnion.size > 0 ? phraseIntersection.size / phraseUnion.size : 0

  const ngrams1 = generateNgrams(text1.toLowerCase(), 3)
  const ngrams2 = generateNgrams(text2.toLowerCase(), 3)
  
  const ngramSet1 = new Set(ngrams1)
  const ngramSet2 = new Set(ngrams2)
  const ngramIntersection = new Set([...ngramSet1].filter(x => ngramSet2.has(x)))
  const ngramUnion = new Set([...ngramSet1, ...ngramSet2])
  
  const ngramSimilarity = ngramUnion.size > 0 ? ngramIntersection.size / ngramUnion.size : 0

  const finalSimilarity = (wordSimilarity * 0.5) + (phraseSimilarity * 0.3) + (ngramSimilarity * 0.2)
  
  return finalSimilarity
}

function generateNgrams(text: string, n: number): string[] {
  const ngrams = []
  for (let i = 0; i <= text.length - n; i++) {
    ngrams.push(text.substring(i, i + n))
  }
  return ngrams
}