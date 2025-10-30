import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('📦 Request body received:', { hasImageBase64: !!body.imageBase64, bodyKeys: Object.keys(body) });
    
    const { imageBase64 } = body;
    
    if (!imageBase64) {
      console.error('❌ No imageBase64 in request body');
      return new Response(
        JSON.stringify({ success: false, error: 'لم يتم إرسال صورة' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🔍 بدء التحقق من الوجه للدخول...");

    // التحقق من صحة بيانات الصورة
    if (!imageBase64 || imageBase64.length < 100) {
      console.error('❌ Invalid image data received. Length:', imageBase64?.length);
      return new Response(
        JSON.stringify({ success: false, error: 'بيانات الصورة غير صالحة' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure image has proper data URL prefix
    let imageDataUrl = imageBase64;
    
    // Check if it starts with just 'data:' without proper format
    if (imageDataUrl.startsWith('data:,') || (imageDataUrl.startsWith('data:') && !imageDataUrl.includes('base64'))) {
      console.error('❌ Invalid data URL format:', imageDataUrl.substring(0, 50));
      return new Response(
        JSON.stringify({ success: false, error: 'تنسيق الصورة غير صحيح' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Add prefix if needed
    if (!imageDataUrl.startsWith('data:image/')) {
      imageDataUrl = `data:image/jpeg;base64,${imageDataUrl}`;
    }

    console.log('🖼️ Image data URL prefix:', imageDataUrl.substring(0, 50));
    console.log('📏 Image data URL length:', imageDataUrl.length);

    // المرحلة 1: التحقق من وجود وجه في الصورة
    const verificationPrompt = `هل يوجد وجه واضح لإنسان في هذه الصورة؟
أجب بـ "نعم" أو "لا" فقط.
إذا كان الوجه غير واضح، أو الصورة مظلمة جداً، أو يوجد أكثر من وجه، أجب بـ "لا".`;

    console.log('🚀 Sending request to Lovable AI for face verification...');
    
    const verificationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: verificationPrompt },
              { type: "image_url", image_url: { url: imageDataUrl } }
            ]
          }
        ],
      }),
    });

    console.log('📡 AI Response status:', verificationResponse.status);

    if (!verificationResponse.ok) {
      const errorText = await verificationResponse.text();
      console.error('❌ AI Error response:', errorText);
      throw new Error(`AI verification failed: ${verificationResponse.status} - ${errorText}`);
    }

    const verificationData = await verificationResponse.json();
    const verificationResult = verificationData.choices[0].message.content.trim();

    console.log("✅ نتيجة التحقق من وجود وجه:", verificationResult);

    if (!verificationResult.includes("نعم")) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'لم يتم التعرف على وجه واضح في الصورة. تأكد من وجود إضاءة كافية وأن الوجه ظاهر بوضوح.' 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // المرحلة 2: توليد وصف تفصيلي للوجه
    const descriptionPrompt = `صف الوجه في هذه الصورة بدقة شديدة باللغة العربية. اذكر:
1. شكل الوجه (بيضاوي، مستدير، مستطيل، مربع، مثلثي)
2. العيون (حجمها، شكلها، لونها إن أمكن، المسافة بينهما)
3. الأنف (حجمه، شكله، عرضه)
4. الفم والشفاه (حجمهما، شكلهما)
5. الحواجب (شكلها، كثافتها)
6. الذقن (شكله، بروزه)
7. ملامح مميزة أخرى (شامة، ندبة، نظارات، لحية، إلخ)

أعطني وصف دقيق ومفصل في فقرة واحدة.`;

    console.log('🚀 Sending request to Lovable AI for face description...');
    
    const descriptionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: descriptionPrompt },
              { type: "image_url", image_url: { url: imageDataUrl } }
            ]
          }
        ],
      }),
    });

    console.log('📡 AI Description Response status:', descriptionResponse.status);

    if (!descriptionResponse.ok) {
      const errorText = await descriptionResponse.text();
      console.error('❌ AI Description Error:', errorText);
      throw new Error(`AI description failed: ${descriptionResponse.status} - ${errorText}`);
    }

    const descriptionData = await descriptionResponse.json();
    const inputFaceDescription = descriptionData.choices[0].message.content.trim();

    console.log("📝 وصف الوجه المدخل:", inputFaceDescription);

    // المرحلة 3: جلب جميع المستخدمين الذين فعّلوا تسجيل الدخول بالوجه
    const { data: faceRecords, error: fetchError } = await supabase
      .from('face_data')
      .select('user_id, face_encoding, image_url')
      .eq('is_active', true);

    if (fetchError) {
      console.error("❌ خطأ في جلب بيانات الوجوه:", fetchError);
      throw fetchError;
    }

    if (!faceRecords || faceRecords.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'لا يوجد مستخدمون مسجلون بتسجيل الدخول بالوجه' 
        }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔎 جاري المقارنة مع ${faceRecords.length} سجلات وجه...`);

    // المرحلة 4: مقارنة ذكية مع كل سجل
    let bestMatch: { userId: string; similarity: number; email?: string } | null = null;

    for (const record of faceRecords) {
      const storedDescription = record.face_encoding;
      
      const similarity = await compareWithAI(
        inputFaceDescription,
        storedDescription,
        LOVABLE_API_KEY
      );

      console.log(`👤 المستخدم ${record.user_id}: تشابه ${similarity}%`);

      if (similarity >= 70) {
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = {
            userId: record.user_id,
            similarity: similarity
          };
        }
      }
    }

    // المرحلة 5: التحقق من النتيجة
    if (!bestMatch) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'لم يتم العثور على تطابق. تأكد من أنك سجلت وجهك مسبقاً.' 
        }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // المرحلة 6: جلب بيانات المستخدم للتحقق من التفعيل
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email, face_login_enabled')
      .eq('user_id', bestMatch.userId)
      .single();

    if (profileError || !profile) {
      console.error("❌ خطأ في جلب بيانات المستخدم:", profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في جلب بيانات المستخدم' 
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 حالة face_login_enabled للمستخدم ${profile.email}: ${profile.face_login_enabled}`);

    // تفعيل face_login تلقائياً إذا لم يكن مفعلاً ولكن لديه بيانات وجه
    if (!profile.face_login_enabled) {
      console.log('⚙️ تفعيل face_login تلقائياً للمستخدم...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ face_login_enabled: true })
        .eq('user_id', bestMatch.userId);
      
      if (updateError) {
        console.error('⚠️ فشل في تفعيل face_login:', updateError);
      } else {
        console.log('✅ تم تفعيل face_login للمستخدم');
      }
    }

    console.log(`✅ تم العثور على تطابق! المستخدم: ${profile.email}, التشابه: ${bestMatch.similarity}%`);

    // إنشاء session token للمستخدم
    console.log('🔑 إنشاء session token للمستخدم...');
    
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: profile.email,
      options: {
        redirectTo: `${req.headers.get('origin') || 'http://localhost:8080'}/dashboard`
      }
    });

    if (sessionError) {
      console.error('❌ خطأ في إنشاء session:', sessionError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'فشل في إنشاء الجلسة'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // استخراج الـ tokens من الرابط
    const url = new URL(sessionData.properties.action_link);
    const accessToken = url.searchParams.get('access_token');
    const refreshToken = url.searchParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
      console.error('❌ لم يتم الحصول على tokens');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'فشل في الحصول على بيانات الجلسة'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log('✅ تم إنشاء session بنجاح!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم التحقق من الوجه بنجاح',
        similarity: bestMatch.similarity,
        email: profile.email,
        userId: bestMatch.userId,
        accessToken,
        refreshToken
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error("❌ خطأ في التحقق من الوجه:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * مقارنة ذكية بين وصفين للوجه باستخدام AI
 */
async function compareWithAI(
  description1: string,
  description2: string,
  apiKey: string
): Promise<number> {
  try {
    const prompt = `أنت خبير في التعرف على الوجوه. لديك وصفان لوجهين باللغة العربية.

**الوصف الأول (الصورة المدخلة):**
${description1}

**الوصف الثاني (المخزن في قاعدة البيانات):**
${description2}

هل هذان الوصفان للشخص نفسه؟

قارن بدقة شديدة:
- شكل الوجه
- العيون (حجم، شكل، لون، مسافة)
- الأنف (حجم، شكل، عرض)
- الفم والشفاه
- الحواجب
- الذقن
- الملامح المميزة

**مهم جداً:**
- إذا كانت الملامح الأساسية متطابقة بنسبة كبيرة (> 70%)، أعطني رقم عالي
- إذا كانت هناك اختلافات واضحة في الملامح الأساسية، أعطني رقم منخفض
- لا تتساهل في التطابق، الدقة مهمة جداً

أعطني فقط رقم من 0 إلى 100 يمثل نسبة التشابه بينهما.
أجب برقم فقط، بدون أي نص إضافي.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error("❌ فشل طلب المقارنة:", response.status);
      return 0;
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // استخراج الرقم من الرد
    const match = content.match(/\d+/);
    if (match) {
      const similarity = parseInt(match[0], 10);
      return Math.min(100, Math.max(0, similarity));
    }

    console.error("❌ لم يتم العثور على رقم في رد AI:", content);
    return 0;

  } catch (error) {
    console.error("❌ خطأ في مقارنة AI:", error);
    return 0;
  }
}
