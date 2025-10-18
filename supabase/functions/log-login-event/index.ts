import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, success, route } = await req.json();
    
    // Extract IP and headers
    const xForwardedFor = req.headers.get('X-Forwarded-For');
    const cfConnectingIp = req.headers.get('CF-Connecting-IP');
    const forwarded = req.headers.get('Forwarded');
    const userAgent = req.headers.get('User-Agent');
    const referer = req.headers.get('Referer');
    
    // Determine the real IP
    let ipAddress = cfConnectingIp || xForwardedFor?.split(',')[0].trim() || req.headers.get('X-Real-IP');
    
    console.log('Login event - IP extraction:', {
      xForwardedFor,
      cfConnectingIp,
      forwarded,
      determinedIp: ipAddress
    });

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(userAgent || '');
    
    // Get geolocation (simplified - in production use a proper geolocation service)
    const geolocation = await getGeolocation(ipAddress || '');

    // Log the login event
    const { data: loginEvent, error: loginError } = await supabase
      .from('login_events')
      .insert({
        user_id: userId,
        ip_address: ipAddress,
        x_forwarded_for: xForwardedFor,
        cf_connecting_ip: cfConnectingIp,
        forwarded: forwarded,
        user_agent: userAgent,
        referer: referer,
        route: route || '/login',
        success: success,
        geolocation: geolocation,
        device_info: deviceInfo,
        is_acknowledged: false
      })
      .select()
      .single();

    if (loginError) {
      console.error('Error logging login event:', loginError);
      throw loginError;
    }

    console.log('Login event logged:', loginEvent.id);

    // Get user profile to send notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('user_id', userId)
      .single();

    if (profile && success) {
      // Get user roles to send notification to their departments
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      // Create notification
      const locationStr = geolocation?.city && geolocation?.country 
        ? `${geolocation.city}, ${geolocation.country}`
        : 'موقع غير محدد';
        
      const deviceStr = deviceInfo?.browser && deviceInfo?.os
        ? `${deviceInfo.browser} على ${deviceInfo.os}`
        : 'جهاز غير معروف';

      const notificationMessage = `تم تسجيل الدخول من IP: ${ipAddress || 'غير متوفر'}
الموقع التقريبي: ${locationStr}
المتصفح: ${deviceStr}
الوقت: ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}

${profile.full_name ? `المستخدم: ${profile.full_name}` : ''}`;

      // Extract roles array for target_departments
      const targetDepts = userRoles?.map(r => r.role) || [];

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          sender_id: profile.id,
          title: 'تنبيه أمني: تسجيل دخول جديد',
          message: notificationMessage,
          priority: 'high',
          status: 'unread',
          is_system_wide: false,
          target_departments: targetDepts,
          action_url: `/profile?tab=login-history&event=${loginEvent.id}`
        });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      } else {
        console.log('Login notification created for user:', userId);
      }
    }

    return new Response(
      JSON.stringify({ success: true, eventId: loginEvent.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in log-login-event:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function parseUserAgent(userAgent: string) {
  const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/([0-9.]+)/i);
  const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/i);
  
  return {
    browser: browserMatch ? browserMatch[1] : 'Unknown',
    version: browserMatch ? browserMatch[2] : '',
    os: osMatch ? osMatch[1] : 'Unknown',
    raw: userAgent
  };
}

async function getGeolocation(ip: string) {
  // In production, use a proper geolocation API like ipapi.co or ip-api.com
  // For now, return a placeholder
  try {
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      return { city: 'Local', country: 'Local', ip };
    }
    
    // Free IP geolocation API (has rate limits)
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    if (response.ok) {
      const data = await response.json();
      return {
        ip,
        city: data.city || 'غير معروف',
        country: data.country || 'غير معروف',
        countryCode: data.countryCode,
        lat: data.lat,
        lon: data.lon,
        isp: data.isp
      };
    }
  } catch (error) {
    console.error('Geolocation lookup failed:', error);
  }
  
  return { city: 'غير معروف', country: 'غير معروف', ip };
}