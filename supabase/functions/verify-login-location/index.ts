import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LocationData {
  country: string
  city: string
  latitude: number
  longitude: number
}

// قائمة الدول الم allowed - فلسطين والأراضي المحيطة
const ALLOWED_COUNTRIES = ['PS', 'PSE', 'Palestine', 'Palestinian Territory']

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, userAgent } = await req.json()

    // الحصول على IP من الرأسيات
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown'

    console.log('Login attempt from IP:', ip)

    // الحصول على الموقع الجغرافي من IP
    let locationData: LocationData | null = null
    let isBlocked = false

    if (ip !== 'unknown' && ip !== '127.0.0.1' && !ip.startsWith('192.168.')) {
      try {
        // استخدام ipapi.co للحصول على بيانات الموقع
        const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`)
        if (geoResponse.ok) {
          const geoData = await geoResponse.json()
          
          locationData = {
            country: geoData.country_name || geoData.country || 'Unknown',
            city: geoData.city || 'Unknown',
            latitude: geoData.latitude || 0,
            longitude: geoData.longitude || 0,
          }

          // التحقق من الدولة
          const countryCode = geoData.country_code || geoData.country || ''
          const countryName = geoData.country_name || geoData.country || ''
          
          isBlocked = !ALLOWED_COUNTRIES.some(allowed => 
            countryCode.toUpperCase().includes(allowed.toUpperCase()) ||
            countryName.toUpperCase().includes(allowed.toUpperCase())
          )

          console.log('Location data:', locationData)
          console.log('Is blocked:', isBlocked, 'Country:', countryName, 'Code:', countryCode)
        }
      } catch (error) {
        console.error('Error fetching geolocation:', error)
      }
    }

    // إذا كان محظوراً، سجل المحاولة
    if (isBlocked) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      console.log('Login blocked - IP from outside Palestine:', ip, locationData?.country)

      // الحصول على معلومات المستخدم
      const { data: userData } = await supabaseAdmin.auth.admin.getUserByEmail(email)

      // تسجيل المحاولة المشبوهة
      const { data: suspiciousAttempt, error: insertError } = await supabaseAdmin
        .from('suspicious_login_attempts')
        .insert({
          user_id: userData?.user?.id || null,
          email,
          ip_address: ip,
          country: locationData?.country || 'Unknown',
          city: locationData?.city || 'Unknown',
          latitude: locationData?.latitude || null,
          longitude: locationData?.longitude || null,
          user_agent: userAgent || 'Unknown',
          blocked: true,
          severity: 'high',
          status: 'pending',
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error logging suspicious attempt:', insertError)
      } else {
        console.log('Suspicious attempt logged:', suspiciousAttempt)
      }

      // الحصول على جميع الأدمن
      const { data: adminProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id')
        .or('role.eq.admin,role.eq.cybercrime')

      if (adminProfiles && adminProfiles.length > 0) {
        console.log('Sending notifications to', adminProfiles.length, 'admins')
        
        // إرسال إشعار لكل أدمن
        const notifications = adminProfiles.map(admin => ({
          sender_id: admin.id,
          recipient_id: admin.id,
          title: '🚨 محاولة دخول مشبوهة - عاجل',
          message: `محاولة دخول محظورة من خارج فلسطين!\n\nالبريد: ${email}\nالدولة: ${locationData?.country || 'Unknown'}\nالمدينة: ${locationData?.city || 'Unknown'}\nIP: ${ip}\n\nيجب التحقق من هذه المحاولة فوراً`,
          priority: 'high',
          target_departments: ['admin', 'cybercrime'],
          status: 'unread',
          action_url: '/cybercrime-advanced',
        }))

        const { error: notifError } = await supabaseAdmin
          .from('notifications')
          .insert(notifications)

        if (notifError) {
          console.error('Error sending admin notifications:', notifError)
        } else {
          console.log('Admin notifications sent successfully')
        }
      }

      // إشعار المستخدم إذا كان موجوداً
      if (userData?.user?.id) {
        const { data: userProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('user_id', userData.user.id)
          .single()

        if (userProfile) {
          await supabaseAdmin
            .from('notifications')
            .insert({
              sender_id: userProfile.id,
              recipient_id: userProfile.id,
              title: '⚠️ محاولة دخول مشبوهة لحسابك',
              message: `تم رصد محاولة دخول مشبوهة لحسابك من:\n\nالدولة: ${locationData?.country || 'Unknown'}\nالمدينة: ${locationData?.city || 'Unknown'}\nIP: ${ip}\n\nإذا لم تكن أنت من حاول الدخول، يرجى تغيير كلمة المرور فوراً`,
              priority: 'high',
              status: 'unread',
            })
          
          console.log('User notification sent')
        }
      }
    }

    return new Response(
      JSON.stringify({
        allowed: !isBlocked,
        location: locationData,
        message: isBlocked 
          ? 'تم رفض محاولة الدخول. الدخول مسموح فقط من داخل فلسطين.'
          : 'الموقع مسموح',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in verify-login-location:', error)
    
    return new Response(
      JSON.stringify({
        allowed: true, // في حالة الخطأ، نسمح بالدخول لتجنب حظر المستخدمين الشرعيين
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
})
