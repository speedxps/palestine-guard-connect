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
    console.log('Approve device request received');

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
    const { attemptId, userId, deviceFingerprint, deviceInfo } = await req.json();

    if (!attemptId || !userId || !deviceFingerprint) {
      return new Response(JSON.stringify({ error: 'معلومات غير مكتملة' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Approving device for user ${userId}`);

    // Check if device already exists
    const { data: existingDevice, error: checkError } = await supabaseAdmin
      .from('user_devices')
      .select('id')
      .eq('user_id', userId)
      .eq('device_fingerprint', deviceFingerprint)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing device:', checkError);
      throw new Error('فشل في التحقق من الجهاز');
    }

    if (existingDevice) {
      // Device exists, just activate it
      const { error: updateError } = await supabaseAdmin
        .from('user_devices')
        .update({ is_active: true })
        .eq('id', existingDevice.id);

      if (updateError) {
        console.error('Error activating device:', updateError);
        throw new Error('فشل في تفعيل الجهاز');
      }
    } else {
      // Create new device
      const { error: insertError } = await supabaseAdmin
        .from('user_devices')
        .insert({
          user_id: userId,
          device_fingerprint: deviceFingerprint,
          device_info: deviceInfo,
          is_active: true,
          is_primary: false,
          login_count: 0,
          notes: 'تم الموافقة من قبل الإدارة',
        });

      if (insertError) {
        console.error('Error creating device:', insertError);
        throw new Error('فشل في إنشاء الجهاز');
      }
    }

    // Log the approval
    await supabaseAdmin
      .from('device_access_log')
      .insert({
        user_id: userId,
        device_fingerprint: deviceFingerprint,
        access_type: 'admin_approval',
        was_allowed: true,
        reason: 'تمت الموافقة من قبل الإدارة',
      });

    console.log('Device approved successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم الموافقة على الجهاز بنجاح',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in approve-device:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ غير متوقع' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
