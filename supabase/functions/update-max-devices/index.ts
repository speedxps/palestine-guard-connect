import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Update max devices request received');

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get and verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('لا يوجد تصريح دخول');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user with admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(JSON.stringify({ error: 'غير مصرح' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User verified:', user.id);

    // Check if user is admin
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      throw new Error('فشل في التحقق من الصلاحيات');
    }

    const isAdmin = userRoles?.some(r => r.role === 'admin') ?? false;

    if (!isAdmin) {
      console.error('User is not admin');
      return new Response(JSON.stringify({ error: 'ليس لديك صلاحية للوصول' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { userId, maxDevices } = await req.json();

    if (!userId || maxDevices === undefined || maxDevices === null) {
      return new Response(JSON.stringify({ error: 'معلومات غير مكتملة' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate maxDevices
    if (maxDevices < 1 || maxDevices > 999) {
      return new Response(JSON.stringify({ error: 'عدد غير صالح للأجهزة' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Updating max devices for user ${userId} to ${maxDevices}`);

    // Update max_devices_allowed in profiles table
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ max_devices_allowed: maxDevices })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating max devices:', updateError);
      throw new Error('فشل في تحديث عدد الأجهزة');
    }

    console.log('Max devices updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تحديث عدد الأجهزة المسموح بها بنجاح',
        maxDevices 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in update-max-devices:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ غير متوقع' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
