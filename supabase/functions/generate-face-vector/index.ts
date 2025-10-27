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
    const { citizenId, faceDescriptor, imageUrl } = await req.json();

    if (!citizenId || !faceDescriptor || !Array.isArray(faceDescriptor)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'يجب تقديم citizenId و faceDescriptor كمصفوفة' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من أن faceDescriptor يحتوي على 128 عنصر
    if (faceDescriptor.length !== 128) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `faceDescriptor يجب أن يحتوي على 128 عنصر، وليس ${faceDescriptor.length}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // الاتصال بـ Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // تحويل المصفوفة إلى صيغة PostgreSQL vector
    const vectorString = `[${faceDescriptor.join(',')}]`;

    // تحديث المواطن بـ face_vector
    const { error: updateError } = await supabase
      .from('citizens')
      .update({ 
        face_vector: vectorString,
        updated_at: new Date().toISOString()
      })
      .eq('id', citizenId);

    if (updateError) {
      console.error('خطأ في تحديث face_vector:', updateError);
      
      // تسجيل الخطأ
      await supabase.from('face_processing_log').insert({
        citizen_id: citizenId,
        processing_status: 'failed',
        error_message: updateError.message
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: updateError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // تسجيل النجاح
    await supabase.from('face_processing_log').insert({
      citizen_id: citizenId,
      processing_status: 'success',
      confidence_score: 1.0
    });

    console.log(`✅ تم حفظ face_vector للمواطن ${citizenId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم حفظ face_vector بنجاح',
        citizenId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('خطأ في generate-face-vector:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'خطأ غير معروف' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});