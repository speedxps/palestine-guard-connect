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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, imageBase64 } = await req.json();

    if (!userId || !imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing userId or imageBase64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔐 Saving face data for user:', userId);

    // توليد وصف AI للوجه باستخدام Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${lovableApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: 'Describe this face in extreme detail for facial recognition. Include: face shape, eye characteristics (color, shape, distance), nose structure, mouth features, skin tone, any distinctive marks, facial proportions, and unique identifiers. Be very specific and technical.'
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error('Failed to generate face description');
    }

    const geminiData = await geminiResponse.json();
    const faceDescription = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!faceDescription) {
      throw new Error('No face description generated');
    }

    console.log('✅ Face description generated');

    // حفظ بيانات الوجه في face_data
    const { error: faceDataError } = await supabaseAdmin
      .from('face_data')
      .upsert({
        user_id: userId,
        face_encoding: faceDescription,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (faceDataError) {
      console.error('Error saving face_data:', faceDataError);
      throw faceDataError;
    }

    // تحديث profiles.face_login_enabled
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        face_login_enabled: true,
        face_registered_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw profileError;
    }

    console.log('✅ Face data saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Face data saved successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in save-face-data:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
