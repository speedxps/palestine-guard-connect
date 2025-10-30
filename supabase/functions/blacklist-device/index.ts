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

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Get JWT token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('لا يوجد تصريح دخول');
    }

    // Extract user ID from JWT (already verified by Supabase since verify_jwt = true)
    const token = authHeader.replace('Bearer ', '');
    let userId: string;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
      
      if (!userId) {
        throw new Error('User ID not found in token');
      }
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return new Response(JSON.stringify({ error: 'غير مصرح' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('User verified:', userId);

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

    // Parse request body
    const { attemptId, userId: targetUserId, deviceFingerprint, deviceInfo, reason, notes } = await req.json();

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
        user_id: targetUserId,
        device_info: deviceInfo,
        reason: reason || 'تم حظره من قبل الإدارة',
        notes: notes,
        blocked_by: userId,
      });

    if (blacklistError) {
      console.error('Error adding to blacklist:', blacklistError);
      throw new Error('فشل في إضافة الجهاز للقائمة السوداء');
    }

    // Deactivate device if it exists
    if (targetUserId) {
      await supabaseAdmin
        .from('user_devices')
        .update({ is_active: false })
        .eq('user_id', targetUserId)
        .eq('device_fingerprint', deviceFingerprint);
    }

    // Delete the blocked attempt from device_access_log
    if (attemptId) {
      await supabaseAdmin
        .from('device_access_log')
        .delete()
        .eq('id', attemptId);
    }

    // Log the blacklisting
    await supabaseAdmin
      .from('device_access_log')
      .insert({
        user_id: targetUserId,
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
