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

// قائمة الدول المسموحة - فلسطين
const ALLOWED_COUNTRIES = ['PS', 'PSE', 'Palestine', 'Palestinian Territory', 'State of Palestine']

serve(async (req) => {
  console.log('====== بدء التحقق من موقع تسجيل الدخول ======')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, userAgent } = await req.json()
    console.log('📧 البريد الإلكتروني:', email)

    // الحصول على IP من الرأسيات
    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const cfConnectingIp = req.headers.get('cf-connecting-ip')
    
    // استخراج IP الأول من x-forwarded-for
    let ip = 'unknown'
    if (forwardedFor) {
      ip = forwardedFor.split(',')[0].trim()
    } else if (cfConnectingIp) {
      ip = cfConnectingIp
    } else if (realIp) {
      ip = realIp
    }

    console.log('📍 IP Address:', ip)
    console.log('📍 Headers - x-forwarded-for:', forwardedFor)
    console.log('📍 Headers - x-real-ip:', realIp)
    console.log('📍 Headers - cf-connecting-ip:', cfConnectingIp)

    // إذا كان IP محلي أو غير معروف، اسمح بالدخول
    if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      console.log('✅ IP محلي أو غير معروف - السماح بالدخول')
      return new Response(
        JSON.stringify({
          allowed: true,
          blocked: false,
          location: null,
          message: '✅ الموقع مسموح (IP محلي)',
          ip: ip,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // الحصول على الموقع الجغرافي من IP
    let locationData: LocationData | null = null
    let isBlocked = false
    let countryCode = ''
    let countryName = ''

    try {
      console.log('🌍 جاري الحصول على بيانات الموقع من ipapi.co...')
      
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: {
          'User-Agent': 'Police-Operations-System/1.0'
        }
      })
      
      if (geoResponse.ok) {
        const geoData = await geoResponse.json()
        console.log('📊 بيانات ipapi.co:', JSON.stringify(geoData))
        
        // التحقق من وجود خطأ في الاستجابة
        if (geoData.error) {
          console.warn('⚠️ خطأ من ipapi.co:', geoData.reason || geoData.message)
          // في حالة الخطأ، نسمح بالدخول
          return new Response(
            JSON.stringify({
              allowed: true,
              blocked: false,
              location: null,
              message: '✅ الموقع مسموح (تعذر التحقق)',
              ip: ip,
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200
            }
          )
        }
        
        countryCode = geoData.country_code || geoData.country || ''
        countryName = geoData.country_name || geoData.country || ''
        
        locationData = {
          country: countryName || 'Unknown',
          city: geoData.city || 'Unknown',
          latitude: geoData.latitude || 0,
          longitude: geoData.longitude || 0,
        }

        console.log('📊 Location data:', locationData)
        console.log('🌍 Country Code:', countryCode, 'Country Name:', countryName)

        // التحقق من الدولة
        isBlocked = !ALLOWED_COUNTRIES.some(allowed => 
          countryCode.toUpperCase().includes(allowed.toUpperCase()) ||
          countryName.toUpperCase().includes(allowed.toUpperCase())
        )

        console.log('🔍 Is blocked:', isBlocked)
      } else {
        console.error('❌ فشل طلب ipapi.co:', geoResponse.status, geoResponse.statusText)
        // في حالة فشل الطلب، نسمح بالدخول
        return new Response(
          JSON.stringify({
            allowed: true,
            blocked: false,
            location: null,
            message: '✅ الموقع مسموح (تعذر التحقق)',
            ip: ip,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }
    } catch (geoError) {
      console.error('❌ خطأ في الحصول على الموقع الجغرافي:', geoError)
      // في حالة الخطأ، نسمح بالدخول
      return new Response(
        JSON.stringify({
          allowed: true,
          blocked: false,
          location: null,
          message: '✅ الموقع مسموح (تعذر التحقق)',
          ip: ip,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // إذا كان محظوراً، سجل المحاولة
    if (isBlocked) {
      console.log('🚫 ====== تم الحظر - محاولة دخول من خارج فلسطين ======')
      console.log('📍 IP:', ip)
      console.log('🌍 Country:', countryName, '(', countryCode, ')')
      console.log('🏙️ City:', locationData?.city)
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        // الحصول على معلومات المستخدم
        let userId: string | null = null
        try {
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
          if (users) {
            const user = users.find(u => u.email === email)
            userId = user?.id || null
          }
        } catch (err) {
          console.error('⚠️ خطأ في جلب بيانات المستخدم:', err)
        }

        // تسجيل المحاولة المشبوهة
        try {
          const { error: insertError } = await supabaseAdmin
            .from('suspicious_login_attempts')
            .insert({
              user_id: userId,
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
            console.error('❌ خطأ في تسجيل المحاولة المشبوهة:', insertError)
          } else {
            console.log('✅ تم تسجيل المحاولة المشبوهة')
          }
        } catch (err) {
          console.error('❌ خطأ في تسجيل المحاولة:', err)
        }

        // إرسال إشعارات للأدمن
        try {
          const { data: adminProfiles } = await supabaseAdmin
            .from('profiles')
            .select('id, user_id')
            .or('role.eq.admin,role.eq.cybercrime')

          if (adminProfiles && adminProfiles.length > 0) {
            console.log('📢 إرسال إشعارات لـ', adminProfiles.length, 'مستخدم')
            
            const notifications = adminProfiles.map(admin => ({
              sender_id: admin.id,
              recipient_id: admin.id,
              title: '🚨 تنبيه عاجل: محاولة دخول مشبوهة',
              message: `⛔ تم رفض محاولة دخول من خارج فلسطين!\n\n📧 البريد: ${email}\n🌍 الدولة: ${locationData?.country || 'Unknown'}\n🏙️ المدينة: ${locationData?.city || 'Unknown'}\n📍 IP: ${ip}\n⏰ الوقت: ${new Date().toLocaleString('ar-PS')}`,
              priority: 'high',
              target_departments: ['admin', 'cybercrime'],
              status: 'unread',
              action_url: '/cybercrime-advanced',
            }))

            await supabaseAdmin.from('notifications').insert(notifications)
            console.log('✅ تم إرسال الإشعارات')
          }
        } catch (err) {
          console.error('❌ خطأ في إرسال الإشعارات:', err)
        }

        // إشعار المستخدم
        if (userId) {
          try {
            const { data: userProfile } = await supabaseAdmin
              .from('profiles')
              .select('id')
              .eq('user_id', userId)
              .single()

            if (userProfile) {
              await supabaseAdmin.from('notifications').insert({
                sender_id: userProfile.id,
                recipient_id: userProfile.id,
                title: '⚠️ تحذير أمني: محاولة دخول مشبوهة',
                message: `🔒 تم رصد محاولة دخول مشبوهة لحسابك من:\n\n🌍 الدولة: ${locationData?.country || 'Unknown'}\n🏙️ المدينة: ${locationData?.city || 'Unknown'}\n📍 IP: ${ip}\n\n❌ تم رفض المحاولة تلقائياً`,
                priority: 'high',
                status: 'unread',
              })
            }
          } catch (err) {
            console.error('❌ خطأ في إشعار المستخدم:', err)
          }
        }
      }
    }

    const responseData = {
      allowed: !isBlocked,
      blocked: isBlocked,
      location: locationData,
      message: isBlocked 
        ? '⛔ تم رفض محاولة الدخول. الدخول مسموح فقط من داخل فلسطين.'
        : '✅ الموقع مسموح',
      ip: ip,
      countryCode: countryCode,
      countryName: countryName,
    }

    console.log('📤 Response:', JSON.stringify(responseData))
    console.log('====== انتهاء التحقق ======')

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('❌ خطأ حرج في verify-login-location:', error)
    
    // في حالة الخطأ، نسمح بالدخول لتجنب حظر المستخدمين بشكل خاطئ
    return new Response(
      JSON.stringify({
        allowed: true,
        blocked: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        message: '✅ الموقع مسموح (تعذر التحقق)',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
})
