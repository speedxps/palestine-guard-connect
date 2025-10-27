import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 بدء معالجة الصور الموجودة...');

    // جلب المواطنين الذين لديهم صور ولكن لا يملكون face_vector
    const { data: citizens, error: fetchError } = await supabase
      .from('citizens')
      .select('id, national_id, full_name, photo_url')
      .not('photo_url', 'is', null)
      .is('face_vector', null)
      .limit(50); // معالجة 50 في كل مرة

    if (fetchError) {
      console.error('خطأ في جلب المواطنين:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: fetchError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!citizens || citizens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'لا توجد صور تحتاج معالجة',
          processed: 0,
          total: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 تم العثور على ${citizens.length} مواطن لمعالجة صورهم`);

    const results = {
      total: citizens.length,
      processed: 0,
      failed: 0,
      details: [] as any[]
    };

    // هذه الدالة ستُستخدم من الـ Frontend مع face-api.js
    // لأن face-api.js يعمل في المتصفح فقط
    // هنا نسجل فقط المواطنين الذين يحتاجون معالجة
    for (const citizen of citizens) {
      await supabase.from('face_processing_log').insert({
        citizen_id: citizen.id,
        processing_status: 'pending',
        error_message: 'في انتظار المعالجة من الواجهة الأمامية'
      });

      results.details.push({
        citizen_id: citizen.id,
        national_id: citizen.national_id,
        full_name: citizen.full_name,
        photo_url: citizen.photo_url,
        status: 'pending'
      });
    }

    console.log(`✅ تم تسجيل ${citizens.length} مواطن للمعالجة`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `تم تسجيل ${citizens.length} مواطن في انتظار معالجة صورهم من الواجهة الأمامية`,
        ...results,
        note: 'استخدم مكون BatchProcessEmbeddings في الواجهة الأمامية لمعالجة الصور'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('خطأ في batch-generate-face-vectors:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'خطأ غير معروف' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});