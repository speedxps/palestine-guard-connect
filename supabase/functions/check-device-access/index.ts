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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { userId, deviceFingerprint, deviceInfo } = await req.json();

    console.log('Checking device access for user:', userId);
    console.log('Device fingerprint:', deviceFingerprint);

    // Check if the device exists for this user
    const { data: existingDevice, error: deviceError } = await supabaseClient
      .from('user_devices')
      .select('*')
      .eq('user_id', userId)
      .eq('device_fingerprint', deviceFingerprint)
      .single();

    if (deviceError && deviceError.code !== 'PGRST116') {
      console.error('Error checking device:', deviceError);
      throw deviceError;
    }

    // If device exists and is active, allow access
    if (existingDevice) {
      if (existingDevice.is_active) {
        // Update last seen and login count
        await supabaseClient
          .from('user_devices')
          .update({
            last_seen_at: new Date().toISOString(),
            login_count: existingDevice.login_count + 1,
          })
          .eq('id', existingDevice.id);

        // Log successful access
        await supabaseClient
          .from('device_access_log')
          .insert({
            user_id: userId,
            device_id: existingDevice.id,
            device_fingerprint: deviceFingerprint,
            access_type: 'login_success',
            was_allowed: true,
          });

        console.log('Device access granted - existing active device');

        return new Response(
          JSON.stringify({
            allowed: true,
            device: existingDevice,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } else {
        // Device exists but is inactive
        await supabaseClient
          .from('device_access_log')
          .insert({
            user_id: userId,
            device_id: existingDevice.id,
            device_fingerprint: deviceFingerprint,
            access_type: 'login_blocked',
            was_allowed: false,
            reason: 'Device is inactive',
          });

        console.log('Device access denied - device is inactive');

        return new Response(
          JSON.stringify({
            allowed: false,
            device: null,
            reason: 'هذا الجهاز معطل من قبل الإدارة. يرجى التواصل مع المسؤول.',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }

    // Device doesn't exist - check if user has any other devices
    const { data: userDevices, error: userDevicesError } = await supabaseClient
      .from('user_devices')
      .select('id')
      .eq('user_id', userId);

    if (userDevicesError) {
      console.error('Error checking user devices:', userDevicesError);
      throw userDevicesError;
    }

    // If user has no devices, register this one as primary
    if (!userDevices || userDevices.length === 0) {
      const { data: newDevice, error: insertError } = await supabaseClient
        .from('user_devices')
        .insert({
          user_id: userId,
          device_fingerprint: deviceFingerprint,
          device_info: deviceInfo,
          is_active: true,
          is_primary: true,
          login_count: 1,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating new device:', insertError);
        throw insertError;
      }

      // Log successful registration
      await supabaseClient
        .from('device_access_log')
        .insert({
          user_id: userId,
          device_id: newDevice.id,
          device_fingerprint: deviceFingerprint,
          access_type: 'login_success',
          was_allowed: true,
          reason: 'First device registered',
        });

      console.log('New device registered and access granted');

      return new Response(
        JSON.stringify({
          allowed: true,
          device: newDevice,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // User already has devices - deny access from new device
    await supabaseClient
      .from('device_access_log')
      .insert({
        user_id: userId,
        device_id: null,
        device_fingerprint: deviceFingerprint,
        access_type: 'login_blocked',
        was_allowed: false,
        reason: 'Unauthorized device',
      });

    console.log('Device access denied - unauthorized device');

    return new Response(
      JSON.stringify({
        allowed: false,
        device: null,
        reason: 'لا يمكنك تسجيل الدخول من هذا الجهاز. يرجى التواصل مع الإدارة لإضافة جهاز جديد.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in check-device-access:', error);
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
