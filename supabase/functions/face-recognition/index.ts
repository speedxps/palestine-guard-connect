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

  // First, verify that the image contains a face
  const verificationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'أنت خبير في تحليل الصور. مهمتك التحقق من وجود وجه بشري واضح في الصورة.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'هل هذه الصورة تحتوي على وجه بشري واضح؟ أجب بكلمة واحدة فقط: "نعم" أو "لا". لا تقبل الشعارات أو الرموز أو الصور غير البشرية.'
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
  const hasFace = verificationResult.choices[0]?.message?.content?.trim()
  
  if (hasFace !== 'نعم') {
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

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'أنت خبير في تحليل الوجوه للتعرف عليها. قم بوصف الوجه بدقة شديدة مع ذكر جميع التفاصيل المميزة. هذا لأغراض أمنية وقانونية.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'صف هذا الوجه بدقة شديدة باللغة العربية. اذكر: شكل الوجه (مستدير/بيضاوي/مربع)، العيون (شكلها/حجمها/لونها/المسافة بينهما)، الحواجب (شكلها/كثافتها)، الأنف (حجمه/شكله/عرضه)، الفم والشفاه (حجمها/شكلها)، الخدين، الذقن وخط الفك، الأذنين، لون البشرة، ملمس البشرة، الشعر (لونه/كثافته/شكله)، أي علامات مميزة. كن دقيقاً جداً في الوصف.'
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
      
      // Parse the error to provide better user feedback
      let errorMessage = 'Failed to analyze face image'
      try {
        const parsedError = JSON.parse(errorData)
        if (parsedError.error?.code === 'rate_limit_exceeded') {
          errorMessage = 'تم تجاوز الحد المسموح من استخدام خدمة التحليل. يرجى المحاولة لاحقاً'
        } else if (parsedError.error?.message) {
          errorMessage = 'خطأ في خدمة التحليل'
        }
      } catch (e) {
        // Keep default error message
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage,
          matches: []
        }),
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
        
        if (similarity > highestSimilarity && similarity > 0.15) {
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
  // تنظيف النصوص وإزالة الرموز الزائدة
  const cleanText = (text: string) => text
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\s]/g, ' ') // إبقاء الأحرف العربية فقط
    .replace(/\s+/g, ' ')
    .trim()
  
  const cleanText1 = cleanText(text1)
  const cleanText2 = cleanText(text2)
  
  // تحليل الكلمات المفردة
  const words1 = cleanText1.split(/\s+/).filter(w => w.length > 1)
  const words2 = cleanText2.split(/\s+/).filter(w => w.length > 1)
  
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  const wordSimilarity = union.size > 0 ? intersection.size / union.size : 0

  // تحليل العبارات (كلمتين متتاليتين)
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

  // تحليل الأحرف المتتالية (تسلسل 4 أحرف)
  const ngrams1 = generateNgrams(cleanText1, 4)
  const ngrams2 = generateNgrams(cleanText2, 4)
  
  const ngramSet1 = new Set(ngrams1)
  const ngramSet2 = new Set(ngrams2)
  const ngramIntersection = new Set([...ngramSet1].filter(x => ngramSet2.has(x)))
  const ngramUnion = new Set([...ngramSet1, ...ngramSet2])
  
  const ngramSimilarity = ngramUnion.size > 0 ? ngramIntersection.size / ngramUnion.size : 0

  // تحليل الكلمات المفتاحية المهمة
  const keyFeatures = [
    'عيون', 'عين', 'أنف', 'فم', 'شفاه', 'وجه', 'حاجب', 'خد', 'فك', 'بشرة', 'شعر',
    'دائري', 'بيضاوي', 'مربع', 'طويل', 'قصير', 'عريض', 'ضيق', 'كبير', 'صغير',
    'أسود', 'بني', 'أزرق', 'أخضر', 'رمادي', 'أبيض', 'أحمر', 'أشقر', 'داكن', 'فاتح'
  ]
  
  let keywordMatches = 0
  let totalKeywords = 0
  
  for (const keyword of keyFeatures) {
    if (cleanText1.includes(keyword) || cleanText2.includes(keyword)) {
      totalKeywords++
      if (cleanText1.includes(keyword) && cleanText2.includes(keyword)) {
        keywordMatches++
      }
    }
  }
  
  const keywordSimilarity = totalKeywords > 0 ? keywordMatches / totalKeywords : 0

  // حساب النتيجة النهائية مع أوزان محسنة
  const finalSimilarity = (wordSimilarity * 0.4) + (phraseSimilarity * 0.3) + (ngramSimilarity * 0.15) + (keywordSimilarity * 0.15)
  
  return Math.min(finalSimilarity, 1.0)
}

function generateNgrams(text: string, n: number): string[] {
  const ngrams = []
  for (let i = 0; i <= text.length - n; i++) {
    ngrams.push(text.substring(i, i + n))
  }
  return ngrams
}