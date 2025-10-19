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

      // الحصول على معلومات المستخدم
      const { data: userData } = await supabaseAdmin.auth.admin.getUserByEmail(email)

      // تسجيل المحاولة المشبوهة
      const { error: insertError } = await supabaseAdmin
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

      if (insertError) {
        console.error('Error logging suspicious attempt:', insertError)
      }

      // إرسال إشعار للأدمن
      const { data: adminProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id')
        .limit(1)

      if (adminProfiles && adminProfiles.length > 0) {
        const adminProfileId = adminProfiles[0].id

        await supabaseAdmin
          .from('notifications')
          .insert({
            sender_id: adminProfileId,
            title: '⚠️ محاولة دخول مشبوهة',
            message: `محاولة دخول من خارج فلسطين: ${email} من ${locationData?.country || 'Unknown'} - ${locationData?.city || 'Unknown'}`,
            priority: 'high',
            target_departments: ['admin', 'cybercrime'],
            status: 'unread',
            action_url: '/cybercrime-advanced',
          })
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
              title: '⚠️ محاولة دخول مشبوهة',
              message: `تم رصد محاولة دخول مشبوهة لحسابك من ${locationData?.country || 'Unknown'}`,
              priority: 'high',
              status: 'unread',
            })
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
