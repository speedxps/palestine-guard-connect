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
    const { faceDescriptor, threshold = 0.7, limit = 5 } = await req.json();

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'يجب تقديم faceDescriptor كمصفوفة' 
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

    console.log(`🔍 البحث عن وجوه مشابهة (threshold: ${threshold}, limit: ${limit})`);

    // استدعاء دالة البحث
    const { data: matches, error } = await supabase
      .rpc('search_faces_by_vector', {
        query_vector: vectorString,
        match_threshold: threshold,
        match_count: limit
      });

    if (error) {
      console.error('خطأ في البحث:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ تم العثور على ${matches?.length || 0} تطابق`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        matches: matches || [],
        count: matches?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('خطأ في search-face-vector:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'خطأ غير معروف' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});