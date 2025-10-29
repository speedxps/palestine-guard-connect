import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.log('Starting list-users-with-devices function');

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

    // Initialize regular client for RLS-protected queries
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('لا يوجد تصريح دخول');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      throw new Error('فشل في التحقق من المستخدم');
    }

    console.log('User verified:', user.id);

    // Check if user is admin
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Error checking user roles:', rolesError);
      throw new Error('فشل في التحقق من صلاحيات المستخدم');
    }

    const isAdmin = userRoles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      console.error('User is not admin');
      return new Response(
        JSON.stringify({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Admin access verified');

    // Fetch all users using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching users:', authError);
      throw new Error('فشل في جلب المستخدمين');
    }

    const authUsers = authData.users;
    console.log(`Found ${authUsers.length} users`);

    // Fetch all devices
    const { data: devices, error: devicesError } = await supabase
      .from('user_devices')
      .select('*')
      .order('last_seen_at', { ascending: false });

    if (devicesError) {
      console.error('Error fetching devices:', devicesError);
      throw new Error('فشل في جلب الأجهزة');
    }

    console.log(`Found ${devices?.length || 0} devices`);

    // Fetch blocked attempts count (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: blockedCount, error: blockedError } = await supabase
      .from('device_access_log')
      .select('*', { count: 'exact', head: true })
      .eq('was_allowed', false)
      .gte('created_at', today.toISOString());

    if (blockedError) {
      console.error('Error fetching blocked attempts:', blockedError);
    }

    console.log(`Found ${blockedCount || 0} blocked attempts today`);

    // Combine users with their devices
    const usersWithDevices = authUsers.map(user => ({
      id: user.id,
      email: user.email || '',
      raw_user_meta_data: user.user_metadata || {},
      devices: devices?.filter(d => d.user_id === user.id) || [],
    }));

    const stats = {
      totalUsers: usersWithDevices.length,
      totalDevices: devices?.length || 0,
      blockedAttempts: blockedCount || 0,
    };

    console.log('Stats:', stats);

    return new Response(
      JSON.stringify({
        users: usersWithDevices,
        stats,
        success: true,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'حدث خطأ في الخادم',
        success: false,
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
