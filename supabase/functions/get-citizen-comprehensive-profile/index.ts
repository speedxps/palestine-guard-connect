import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { national_id } = await req.json();

    if (!national_id) {
      return new Response(
        JSON.stringify({ error: 'رقم الهوية مطلوب' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Fetching comprehensive profile for national_id:', national_id);

    // جلب بيانات المواطن
    const { data: citizen, error: citizenError } = await supabaseClient
      .from('citizens')
      .select('*')
      .eq('national_id', national_id)
      .single();

    if (citizenError || !citizen) {
      console.error('Error fetching citizen:', citizenError);
      return new Response(
        JSON.stringify({ error: 'لم يتم العثور على المواطن' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // جلب جميع البيانات المرتبطة بالتوازي
    const [
      vehiclesRes,
      violationsRes,
      cyberCasesRes,
      judicialCasesRes,
      incidentsRes,
      notificationsRes,
      propertiesRes,
      familyRes,
      wantedRes,
      documentsRes,
      faceDataRes,
      activityLogsRes
    ] = await Promise.all([
      // المركبات
      supabaseClient
        .from('vehicle_owners')
        .select('*, vehicle_registrations(*)')
        .eq('national_id', national_id),
      
      // المخالفات المرورية
      supabaseClient
        .from('traffic_records')
        .select('*')
        .eq('national_id', national_id)
        .order('created_at', { ascending: false })
        .limit(50),
      
      // قضايا الجرائم الإلكترونية
      supabaseClient
        .from('cybercrime_cases')
        .select('*')
        .eq('national_id', national_id)
        .order('created_at', { ascending: false }),
      
      // القضايا القضائية
      supabaseClient
        .from('judicial_cases')
        .select('*')
        .eq('national_id', national_id)
        .order('created_at', { ascending: false }),
      
      // الحوادث والبلاغات
      supabaseClient
        .from('incidents')
        .select('*')
        .eq('reporter_national_id', national_id)
        .order('created_at', { ascending: false })
        .limit(50),
      
      // الاستدعاءات
      supabaseClient
        .from('official_notifications')
        .select('*')
        .or(`recipient_national_id.eq.${national_id},citizen_id.eq.${citizen.id}`)
        .order('created_at', { ascending: false })
        .limit(50),
      
      // الأملاك
      supabaseClient
        .from('citizen_properties')
        .select('*')
        .eq('citizen_id', citizen.id),
      
      // أفراد العائلة
      supabaseClient
        .from('family_members')
        .select('*')
        .eq('person_id', citizen.id),
      
      // حالة المطلوبين
      supabaseClient
        .from('wanted_persons')
        .select('*')
        .eq('citizen_id', citizen.id)
        .maybeSingle(),
      
      // الوثائق
      supabaseClient
        .from('citizen_documents')
        .select('*')
        .eq('citizen_id', citizen.id),
      
      // بيانات الوجه
      supabaseClient
        .from('face_embeddings')
        .select('*')
        .eq('citizen_id', citizen.id)
        .limit(1)
        .maybeSingle(),
      
      // سجل النشاط
      supabaseClient
        .from('activity_logs')
        .select('*')
        .eq('metadata->>national_id', national_id)
        .order('created_at', { ascending: false })
        .limit(20)
    ]);

    // بناء الملف الشامل
    const comprehensiveProfile = {
      citizen: citizen,
      vehicles: vehiclesRes.data || [],
      violations: violationsRes.data || [],
      cybercrime_cases: cyberCasesRes.data || [],
      judicial_cases: judicialCasesRes.data || [],
      incidents: incidentsRes.data || [],
      notifications: notificationsRes.data || [],
      properties: propertiesRes.data || [],
      family: familyRes.data || [],
      wanted_status: wantedRes.data || null,
      documents: documentsRes.data || [],
      face_data: faceDataRes.data || null,
      activity_log: activityLogsRes.data || [],
      
      // الإحصائيات الملخصة
      summary: {
        vehicles_count: (vehiclesRes.data || []).length,
        violations_count: (violationsRes.data || []).length,
        violations_unpaid: (violationsRes.data || []).filter((v: any) => v.status !== 'paid').length,
        cybercrime_cases_open: (cyberCasesRes.data || []).filter((c: any) => c.status === 'open').length,
        judicial_cases_active: (judicialCasesRes.data || []).filter((c: any) => c.status !== 'closed').length,
        incidents_count: (incidentsRes.data || []).length,
        notifications_pending: (notificationsRes.data || []).filter((n: any) => n.status !== 'responded').length,
        properties_count: (propertiesRes.data || []).length,
        family_members_count: (familyRes.data || []).length,
        is_wanted: !!wantedRes.data,
        has_face_data: !!faceDataRes.data
      }
    };

    console.log('Comprehensive profile fetched successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: comprehensiveProfile 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in get-citizen-comprehensive-profile:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'حدث خطأ أثناء جلب البيانات' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
