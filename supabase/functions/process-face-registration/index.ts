import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, imageBase64 } = await req.json();
    console.log('📥 Face registration request for user:', userId);

    if (!userId || !imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'بيانات ناقصة' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('🤖 Generating detailed face description using Lovable AI...');

    // Generate detailed face description using Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a facial recognition expert. Provide extremely detailed, objective descriptions of faces for identification purposes. Focus on permanent features, facial structure, and unique characteristics.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this face image and provide a comprehensive description including: face shape, eye characteristics (shape, size, distance), nose features (bridge, tip, width), mouth and lips (shape, size), facial structure (jawline, cheekbones, forehead), skin tone, distinctive features (moles, marks, eyebrows), and overall proportions. Be extremely specific and detailed.'
              },
              {
                type: 'image_url',
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Lovable AI error:', aiResponse.status, errorText);
      throw new Error('فشل في تحليل الوجه بواسطة الذكاء الاصطناعي');
    }

    const aiData = await aiResponse.json();
    const faceDescription = aiData.choices[0].message.content;
    console.log('✅ Face description generated:', faceDescription.substring(0, 100) + '...');

    // Save face data to database
    console.log('💾 Saving face data to database...');
    const { error: insertError } = await supabase
      .from('face_data')
      .upsert({
        user_id: userId,
        face_encoding: faceDescription,
        image_url: imageBase64,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (insertError) {
      console.error('❌ Database error:', insertError);
      throw new Error('فشل في حفظ بيانات الوجه');
    }

    // Update profile to enable face login
    console.log('🔄 Enabling face login in profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ face_login_enabled: true })
      .eq('user_id', userId);

    if (profileError) {
      console.error('⚠️ Profile update warning:', profileError);
    }

    console.log('✅ Face registration completed successfully!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تسجيل الوجه بنجاح' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Face registration error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
