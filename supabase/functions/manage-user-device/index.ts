import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, deviceFingerprint, deviceId, deviceInfo, deviceName, notes } = await req.json();

    console.log('Managing user device:', { action, userId, deviceId });

    // Verify admin access
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      throw new Error('Only admins can manage devices');
    }

    switch (action) {
      case 'add':
        // Add a new device for a user
        const { data: newDevice, error: addError } = await supabaseAdmin
          .from('user_devices')
          .insert({
            user_id: userId,
            device_fingerprint: deviceFingerprint,
            device_info: deviceInfo || {},
            device_name: deviceName,
            is_active: true,
            is_primary: false,
            added_by: user.id,
            notes: notes,
          })
          .select()
          .single();

        if (addError) throw addError;

        return new Response(
          JSON.stringify({
            success: true,
            device: newDevice,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );

      case 'remove':
        // Remove a specific device
        const { error: removeError } = await supabaseAdmin
          .from('user_devices')
          .delete()
          .eq('id', deviceId);

        if (removeError) throw removeError;

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Device removed successfully',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );

      case 'reset':
        // Remove all devices for a user
        const { error: resetError } = await supabaseAdmin
          .from('user_devices')
          .delete()
          .eq('user_id', userId);

        if (resetError) throw resetError;

        return new Response(
          JSON.stringify({
            success: true,
            message: 'All devices reset successfully',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );

      case 'toggle':
        // Toggle device active status
        const { data: device, error: getError } = await supabaseAdmin
          .from('user_devices')
          .select('is_active')
          .eq('id', deviceId)
          .single();

        if (getError) throw getError;

        const { error: toggleError } = await supabaseAdmin
          .from('user_devices')
          .update({ is_active: !device.is_active })
          .eq('id', deviceId);

        if (toggleError) throw toggleError;

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Device status toggled successfully',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in manage-user-device:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
