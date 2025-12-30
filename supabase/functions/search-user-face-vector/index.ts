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

  const startTime = Date.now();
  
  try {
    console.log('🔍 ====== بدء البحث عن وجوه المستخدمين ======');
    
    const body = await req.json();
    const { faceDescriptor, threshold = 0.6, limit = 5 } = body;

    console.log(`📊 المعلمات: threshold=${threshold}, limit=${limit}`);

    // التحقق من صحة البيانات
    if (!faceDescriptor) {
      console.error('❌ خطأ: faceDescriptor غير موجود');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'يجب تقديم faceDescriptor',
          matches: [],
          count: 0
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(faceDescriptor)) {
      console.error('❌ خطأ: faceDescriptor ليس مصفوفة');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'faceDescriptor يجب أن يكون مصفوفة',
          matches: [],
          count: 0
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من أن faceDescriptor يحتوي على 128 عنصر (face-api.js standard)
    if (faceDescriptor.length !== 128) {
      console.error(`❌ خطأ: faceDescriptor يحتوي على ${faceDescriptor.length} عنصر بدلاً من 128`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `faceDescriptor يجب أن يحتوي على 128 عنصر، وليس ${faceDescriptor.length}`,
          matches: [],
          count: 0
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ faceDescriptor صالح: ${faceDescriptor.length} عنصر`);
    console.log(`📊 أول 5 قيم: [${faceDescriptor.slice(0, 5).map((v: number) => v.toFixed(4)).join(', ')}...]`);

    // الاتصال بـ Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ خطأ: متغيرات البيئة غير موجودة');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'خطأ في إعدادات الخادم',
          matches: [],
          count: 0
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ تم الاتصال بـ Supabase');

    // جلب جميع السجلات النشطة من user_face_data
    console.log('📥 جاري جلب بيانات الوجوه من قاعدة البيانات...');
    
    const { data: faceRecords, error: fetchError } = await supabase
      .from('user_face_data')
      .select('*')
      .eq('is_active', true)
      .not('face_vector', 'is', null);

    if (fetchError) {
      console.error('❌ خطأ في جلب البيانات:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: fetchError.message,
          matches: [],
          count: 0
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 تم العثور على ${faceRecords?.length || 0} سجل وجه نشط`);

    if (!faceRecords || faceRecords.length === 0) {
      console.log('⚠️ لا توجد سجلات وجوه في قاعدة البيانات');
      return new Response(
        JSON.stringify({ 
          success: true, 
          matches: [],
          count: 0,
          threshold: threshold,
          message: 'لا توجد سجلات وجوه في قاعدة البيانات'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // حساب Cosine Similarity لكل سجل
    const results: Array<{
      user_id: string;
      email: string;
      full_name: string;
      avatar_url: string;
      similarity: number;
    }> = [];
    
    let processedCount = 0;
    let skippedCount = 0;

    for (const row of faceRecords) {
      try {
        // استخراج face_vector
        let storedVector: number[];
        const storedVectorRaw = row.face_vector;
        
        if (typeof storedVectorRaw === 'string') {
          try {
            storedVector = JSON.parse(storedVectorRaw);
          } catch {
            console.warn(`⚠️ فشل في parse face_vector لـ user_id: ${row.user_id}`);
            skippedCount++;
            continue;
          }
        } else if (Array.isArray(storedVectorRaw)) {
          storedVector = storedVectorRaw;
        } else {
          console.warn(`⚠️ تخطي سجل - نوع face_vector غير صالح لـ user_id: ${row.user_id}`);
          skippedCount++;
          continue;
        }
        
        if (!Array.isArray(storedVector) || storedVector.length !== 128) {
          console.warn(`⚠️ تخطي سجل - face_vector بطول ${storedVector?.length || 0} لـ user_id: ${row.user_id}`);
          skippedCount++;
          continue;
        }
        
        // حساب cosine similarity
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < 128; i++) {
          const a = faceDescriptor[i] || 0;
          const b = storedVector[i] || 0;
          dotProduct += a * b;
          normA += a * a;
          normB += b * b;
        }
        
        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        const similarity = denominator > 0 ? dotProduct / denominator : 0;
        
        processedCount++;
        
        if (similarity >= threshold) {
          console.log(`✅ تطابق: user_id=${row.user_id}, similarity=${(similarity * 100).toFixed(2)}%`);
          
          // جلب بيانات المستخدم
          let email = '';
          let fullName = '';
          let avatarUrl = row.face_image_url || '';
          
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(row.user_id);
            email = userData?.user?.email || '';
            fullName = userData?.user?.user_metadata?.full_name || '';
          } catch (err) {
            console.warn('⚠️ فشل جلب بيانات المستخدم من auth:', err);
          }
          
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('user_id', row.user_id)
              .maybeSingle();
            
            if (profileData) {
              fullName = profileData.full_name || fullName;
              avatarUrl = profileData.avatar_url || avatarUrl;
            }
          } catch (err) {
            console.warn('⚠️ فشل جلب بيانات الملف الشخصي:', err);
          }
          
          results.push({
            user_id: row.user_id,
            email,
            full_name: fullName,
            avatar_url: avatarUrl,
            similarity
          });
        }
      } catch (err) {
        console.error(`❌ خطأ في معالجة سجل user_id=${row.user_id}:`, err);
        skippedCount++;
      }
    }

    // ترتيب حسب التشابه (الأعلى أولاً)
    results.sort((a, b) => b.similarity - a.similarity);
    
    // أخذ أول limit نتيجة
    const topMatches = results.slice(0, limit);

    const processingTime = Date.now() - startTime;

    console.log('====== نتائج البحث ======');
    console.log(`✅ تم معالجة: ${processedCount} سجل`);
    console.log(`⚠️ تم تخطي: ${skippedCount} سجل`);
    console.log(`🎯 التطابقات: ${topMatches.length} (من ${results.length} تطابق إجمالي)`);
    console.log(`⚡ وقت المعالجة: ${processingTime}ms`);
    
    if (topMatches.length > 0) {
      console.log(`🥇 أفضل تطابق: ${topMatches[0].email} (${(topMatches[0].similarity * 100).toFixed(2)}%)`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        matches: topMatches,
        count: topMatches.length,
        totalProcessed: processedCount,
        totalSkipped: skippedCount,
        threshold: threshold,
        processingTimeMs: processingTime,
        method: 'face-api.js + manual Cosine Similarity'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ خطأ غير متوقع في search-user-face-vector:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        matches: [],
        count: 0,
        processingTimeMs: processingTime
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
