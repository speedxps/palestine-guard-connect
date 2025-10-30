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
    console.log('Get blocked attempts request received');

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
    
    // Extract user ID from JWT (JWT is already verified by Deno with verify_jwt = true)
    let userId: string;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
      if (!userId) {
        throw new Error('Invalid token payload');
      }
      console.log('User verified:', userId);
    } catch (e) {
      console.error('Error parsing JWT:', e);
      return new Response(JSON.stringify({ error: 'غير مصرح' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

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

    // Get blocked login attempts (where was_allowed = false and access_type = 'login_blocked')
    const { data: blockedAttempts, error: attemptsError } = await supabaseAdmin
      .from('device_access_log')
      .select('*')
      .eq('was_allowed', false)
      .eq('access_type', 'login_blocked')
      .order('created_at', { ascending: false })
      .limit(100);

    if (attemptsError) {
      console.error('Error fetching blocked attempts:', attemptsError);
      throw new Error('فشل في جلب محاولات الدخول المحظورة');
    }

    // Get user details for each attempt
    const userIds = [...new Set(blockedAttempts?.map(a => a.user_id).filter(Boolean) || [])];
    
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
    }

    const usersMap = new Map();
    authUsers?.users.forEach(u => {
      usersMap.set(u.id, {
        email: u.email,
        full_name: u.user_metadata?.full_name || u.email,
      });
    });

    // Combine attempts with user data
    const attemptsWithUserData = blockedAttempts?.map(attempt => ({
      ...attempt,
      user_email: usersMap.get(attempt.user_id)?.email || 'غير معروف',
      user_name: usersMap.get(attempt.user_id)?.full_name || 'غير معروف',
    })) || [];

    console.log(`Found ${attemptsWithUserData.length} blocked attempts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        attempts: attemptsWithUserData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-blocked-attempts:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ غير متوقع' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
