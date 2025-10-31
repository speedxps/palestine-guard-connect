import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with auth header in global config
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Extract JWT token from "Bearer <token>" and verify it
    const jwt = authHeader.replace('Bearer ', '');
    
    // Verify user authentication using the JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication failed', details: userError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      return new Response(JSON.stringify({ error: 'Error checking permissions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User roles:', userRoles);

    const isAdmin = userRoles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      console.error('User is not admin');
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the query
    await supabaseClient.from('activity_logs').insert({
      user_id: user.id,
      activity_type: 'intelligent_query',
      activity_description: 'استعلام ذكي',
      payload: { query }
    });

    // Parse query using AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
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
            content: `أنت نظام ذكي لتحليل استعلامات البحث في نظام الشرطة الفلسطينية. حلل الاستعلام واستخرج:
1. نوع الاستعلام (national_id, name, vehicle, statistics, case_number)
2. المعرفات (أرقام، أسماء)
3. نطاق البحث (المحدد أم شامل)

أمثلة:
- "معلومات عن المواطن 123456789" -> type: national_id, id: "123456789"
- "بحث عن أحمد محمد" -> type: name, name: "أحمد محمد"
- "سيارة رقم ABC-123" -> type: vehicle, plate: "ABC-123"
- "إحصائيات المخالفات اليوم" -> type: statistics, scope: "violations_today"`
          },
          { role: 'user', content: query }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'extract_query_info',
            description: 'استخراج معلومات الاستعلام',
            parameters: {
              type: 'object',
              properties: {
                query_type: {
                  type: 'string',
                  enum: ['national_id', 'name', 'vehicle', 'statistics', 'case_number', 'general']
                },
                identifiers: {
                  type: 'object',
                  properties: {
                    national_id: { type: 'string' },
                    name: { type: 'string' },
                    vehicle_plate: { type: 'string' },
                    case_number: { type: 'string' }
                  }
                },
                scope: { type: 'string' }
              },
              required: ['query_type']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'extract_query_info' } }
      }),
    });

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const queryInfo = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    if (!queryInfo) {
      return new Response(JSON.stringify({
        response: 'عذراً، لم أتمكن من فهم استعلامك. يرجى إعادة صياغته بشكل أوضح.',
        type: 'error'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let reportData: any = {
      query,
      type: queryInfo.query_type,
      timestamp: new Date().toISOString(),
      data: {}
    };

    // Fetch data based on query type
    if (queryInfo.query_type === 'national_id' && queryInfo.identifiers?.national_id) {
      const nationalId = queryInfo.identifiers.national_id;
      
      // Call comprehensive profile function
      const { data: profileData, error: profileError } = await supabaseClient.functions.invoke(
        'get-citizen-comprehensive-profile',
        { body: { national_id: nationalId } }
      );

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }

      reportData.data = profileData || { error: 'لم يتم العثور على بيانات' };
      reportData.title = `تقرير شامل - المواطن ${nationalId}`;

    } else if (queryInfo.query_type === 'name' && queryInfo.identifiers?.name) {
      const { data: citizens } = await supabaseClient
        .from('citizens')
        .select('*')
        .ilike('full_name', `%${queryInfo.identifiers.name}%`)
        .limit(20);

      reportData.data.citizens = citizens || [];
      reportData.title = `نتائج البحث عن: ${queryInfo.identifiers.name}`;

    } else if (queryInfo.query_type === 'vehicle' && queryInfo.identifiers?.vehicle_plate) {
      const { data: vehicles } = await supabaseClient
        .from('vehicle_registrations')
        .select('*, citizens(*)')
        .eq('license_plate', queryInfo.identifiers.vehicle_plate);

      const { data: violations } = await supabaseClient
        .from('traffic_records')
        .select('*')
        .eq('license_plate', queryInfo.identifiers.vehicle_plate);

      reportData.data.vehicles = vehicles || [];
      reportData.data.violations = violations || [];
      reportData.title = `تقرير المركبة: ${queryInfo.identifiers.vehicle_plate}`;

    } else if (queryInfo.query_type === 'statistics') {
      const today = new Date().toISOString().split('T')[0];
      
      const { count: violationsCount } = await supabaseClient
        .from('traffic_records')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      const { count: incidentsCount } = await supabaseClient
        .from('incidents')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      const { count: cybercrimeCount } = await supabaseClient
        .from('cybercrime_cases')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      reportData.data.statistics = {
        violations: violationsCount || 0,
        incidents: incidentsCount || 0,
        cybercrime: cybercrimeCount || 0,
        date: today
      };
      reportData.title = 'إحصائيات اليوم';

    } else {
      reportData.data = { message: 'نوع استعلام غير مدعوم حالياً' };
      reportData.title = 'استعلام عام';
    }

    // Generate AI summary
    const summaryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'أنت مساعد ذكي لتلخيص تقارير الشرطة. اكتب ملخصاً احترافياً مختصراً بالعربية.'
          },
          {
            role: 'user',
            content: `لخص هذا التقرير بشكل احترافي:\n${JSON.stringify(reportData.data, null, 2)}`
          }
        ],
      }),
    });

    const summaryData = await summaryResponse.json();
    reportData.summary = summaryData.choices?.[0]?.message?.content || 'تم توليد التقرير بنجاح';

    return new Response(JSON.stringify(reportData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in intelligent-query:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'حدث خطأ أثناء معالجة الاستعلام',
      type: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
