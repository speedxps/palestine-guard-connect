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
    console.log('Blacklist device request received');

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
    const { userId, deviceFingerprint, deviceInfo, reason, notes } = await req.json();

    if (!deviceFingerprint) {
      return new Response(JSON.stringify({ error: 'معلومات غير مكتملة' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Blacklisting device: ${deviceFingerprint}`);

    // Add to blacklist
    const { error: blacklistError } = await supabaseAdmin
      .from('device_blacklist')
      .insert({
        device_fingerprint: deviceFingerprint,
        user_id: userId,
        device_info: deviceInfo,
        reason: reason || 'تم حظره من قبل الإدارة',
        notes: notes,
        blocked_by: user.id,
      });

    if (blacklistError) {
      console.error('Error adding to blacklist:', blacklistError);
      throw new Error('فشل في إضافة الجهاز للقائمة السوداء');
    }

    // Deactivate device if it exists
    if (userId) {
      await supabaseAdmin
        .from('user_devices')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('device_fingerprint', deviceFingerprint);
    }

    // Log the blacklisting
    await supabaseAdmin
      .from('device_access_log')
      .insert({
        user_id: userId,
        device_fingerprint: deviceFingerprint,
        access_type: 'admin_blacklist',
        was_allowed: false,
        reason: reason || 'تم حظره من قبل الإدارة',
      });

    console.log('Device blacklisted successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم حظر الجهاز بنجاح',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in blacklist-device:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ غير متوقع' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
