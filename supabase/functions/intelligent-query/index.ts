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

    // User is authenticated - allow access to intelligent query

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
4. للإحصائيات: استخرج الفترة الزمنية (day, week, month, year, custom)

أمثلة:
- "معلومات عن المواطن 123456789" -> type: national_id, id: "123456789"
- "بحث عن أحمد محمد" -> type: name, name: "أحمد محمد"
- "سيارة رقم ABC-123" -> type: vehicle, plate: "ABC-123"
- "إحصائيات المخالفات اليوم" -> type: statistics, scope: "violations", period: "day"
- "إحصائيات الأسبوع" -> type: statistics, period: "week"
- "إحصائيات من تاريخ 2024-01-01 إلى 2024-01-31" -> type: statistics, period: "custom", start: "2024-01-01", end: "2024-01-31"`
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
                scope: { type: 'string' },
                period: { type: 'string', enum: ['day', 'week', 'month', 'year', 'custom'] },
                start_date: { type: 'string' },
                end_date: { type: 'string' }
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
      
      try {
        // جلب البيانات الأساسية للمواطن
        const { data: citizenData } = await supabaseClient
          .from('citizens')
          .select('*')
          .eq('national_id', nationalId)
          .single();
        
        if (citizenData) {
          // جلب جميع البيانات المرتبطة
          const [vehiclesRes, violationsRes, cyberCasesRes, judicialCasesRes, incidentsRes] = await Promise.all([
            supabaseClient.from('vehicle_owners').select('*, vehicle_registrations(*)').eq('national_id', nationalId),
            supabaseClient.from('traffic_records').select('*').eq('national_id', nationalId).order('created_at', { ascending: false }).limit(50),
            supabaseClient.from('cybercrime_cases').select('*').eq('national_id', nationalId),
            supabaseClient.from('judicial_cases').select('*').eq('national_id', nationalId),
            supabaseClient.from('incidents').select('*').eq('reporter_national_id', nationalId).limit(20)
          ]);

          reportData.data = {
            citizen: citizenData,
            vehicles: vehiclesRes.data || [],
            violations: violationsRes.data || [],
            cybercrime_cases: cyberCasesRes.data || [],
            judicial_cases: judicialCasesRes.data || [],
            incidents: incidentsRes.data || [],
            summary: {
              total_vehicles: (vehiclesRes.data || []).length,
              total_violations: (violationsRes.data || []).length,
              pending_violations: (violationsRes.data || []).filter((v: any) => !v.is_resolved).length,
              total_cases: (cyberCasesRes.data || []).length + (judicialCasesRes.data || []).length,
              total_incidents: (incidentsRes.data || []).length,
              cybercrime_cases_open: (cyberCasesRes.data || []).filter((c: any) => c.status === 'open').length,
              judicial_cases_active: (judicialCasesRes.data || []).filter((c: any) => c.status !== 'closed').length
            }
          };
        } else {
          reportData.data = { error: 'لم يتم العثور على بيانات للمواطن' };
        }
      } catch (err) {
        console.error('Error fetching citizen data:', err);
        reportData.data = { error: 'حدث خطأ أثناء جلب البيانات' };
      }

      reportData.title = `تقرير شامل - المواطن ${nationalId}`;

    } else if (queryInfo.query_type === 'name' && queryInfo.identifiers?.name) {
      const searchName = queryInfo.identifiers.name;
      
      // البحث عن المواطنين بالاسم
      const { data: citizens } = await supabaseClient
        .from('citizens')
        .select('*')
        .ilike('full_name', `%${searchName}%`)
        .limit(20);

      if (citizens && citizens.length > 0) {
        // جلب البيانات التفصيلية لكل مواطن (نفس البيانات كما في البحث برقم الهوية)
        const citizensWithData = await Promise.all(
          citizens.map(async (citizen) => {
            const [vehiclesRes, violationsRes, cyberCasesRes, judicialCasesRes] = await Promise.all([
              supabaseClient.from('vehicle_owners').select('*, vehicle_registrations(*)').eq('national_id', citizen.national_id),
              supabaseClient.from('traffic_records').select('*').eq('national_id', citizen.national_id).limit(20),
              supabaseClient.from('cybercrime_cases').select('*').eq('national_id', citizen.national_id),
              supabaseClient.from('judicial_cases').select('*').eq('national_id', citizen.national_id)
            ]);

            return {
              ...citizen,
              vehicles: vehiclesRes.data || [],
              violations: violationsRes.data || [],
              cybercrime_cases: cyberCasesRes.data || [],
              judicial_cases: judicialCasesRes.data || [],
              summary: {
                total_vehicles: (vehiclesRes.data || []).length,
                total_violations: (violationsRes.data || []).length,
                pending_violations: (violationsRes.data || []).filter((v: any) => !v.is_resolved).length,
                total_cases: (cyberCasesRes.data || []).length + (judicialCasesRes.data || []).length
              }
            };
          })
        );

        reportData.data.citizens = citizensWithData;
      } else {
        reportData.data.citizens = [];
      }

      reportData.title = `نتائج البحث عن: ${searchName}`;

    } else if (queryInfo.query_type === 'vehicle' && queryInfo.identifiers?.vehicle_plate) {
      const plate = queryInfo.identifiers.vehicle_plate;
      
      // البحث عن المركبة
      const { data: vehicles } = await supabaseClient
        .from('vehicle_registrations')
        .select('*, citizens(*)')
        .eq('license_plate', plate);

      // جلب المخالفات
      const { data: violations } = await supabaseClient
        .from('traffic_records')
        .select('*')
        .eq('license_plate', plate)
        .order('created_at', { ascending: false });

      // جلب المالكين السابقين والحاليين
      const { data: owners } = await supabaseClient
        .from('vehicle_owners')
        .select('*, citizens(*)')
        .eq('license_plate', plate)
        .order('ownership_start_date', { ascending: false });

      reportData.data = {
        vehicles: vehicles || [],
        violations: violations || [],
        owners: owners || [],
        summary: {
          total_violations: (violations || []).length,
          pending_violations: (violations || []).filter((v: any) => !v.is_resolved).length,
          total_owners: (owners || []).length
        }
      };
      reportData.title = `تقرير المركبة: ${plate}`;

    } else if (queryInfo.query_type === 'statistics') {
      // تحديد الفترة الزمنية
      let startDate: string;
      let endDate = new Date().toISOString();
      const period = queryInfo.period || 'day';

      if (period === 'custom' && queryInfo.start_date && queryInfo.end_date) {
        startDate = new Date(queryInfo.start_date).toISOString();
        endDate = new Date(queryInfo.end_date).toISOString();
      } else {
        const now = new Date();
        switch (period) {
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
            break;
          case 'day':
          default:
            startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        }
      }
      
      const [violationsRes, incidentsRes, cybercrimeRes, judicialRes] = await Promise.all([
        supabaseClient
          .from('traffic_records')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabaseClient
          .from('incidents')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabaseClient
          .from('cybercrime_cases')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        supabaseClient
          .from('judicial_cases')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate)
      ]);

      reportData.data.statistics = {
        violations: violationsRes.count || 0,
        incidents: incidentsRes.count || 0,
        cybercrime: cybercrimeRes.count || 0,
        judicial: judicialRes.count || 0,
        period: period,
        start_date: startDate,
        end_date: endDate
      };
      
      const periodLabel = {
        day: 'اليوم',
        week: 'الأسبوع',
        month: 'الشهر',
        year: 'السنة',
        custom: `من ${new Date(startDate).toLocaleDateString('ar')} إلى ${new Date(endDate).toLocaleDateString('ar')}`
      };
      
      reportData.title = `إحصائيات ${periodLabel[period] || 'اليوم'}`;

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
