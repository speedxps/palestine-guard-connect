import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SECRET_CODE = "1234";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, deviceFingerprint, deviceInfo, secretCode } = await req.json();

    console.log("📱 Register device request:", { userId, deviceFingerprint });

    // التحقق من الرمز السري
    if (secretCode !== SECRET_CODE) {
      console.log("❌ Invalid secret code");
      return new Response(
        JSON.stringify({ success: false, error: "الرمز السري غير صحيح" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // التحقق من وجود المستخدم
    if (!userId || !deviceFingerprint) {
      return new Response(
        JSON.stringify({ success: false, error: "بيانات غير مكتملة" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // التحقق من عدد الأجهزة المسجلة للمستخدم
    const { data: profile } = await supabase
      .from("profiles")
      .select("max_devices_allowed")
      .eq("user_id", userId)
      .single();

    const maxDevices = profile?.max_devices_allowed || 3;

    // عد الأجهزة النشطة
    const { count: activeDevices } = await supabase
      .from("user_devices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_active", true);

    if ((activeDevices || 0) >= maxDevices) {
      console.log("❌ Max devices reached:", activeDevices, "/", maxDevices);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `تم الوصول للحد الأقصى من الأجهزة (${maxDevices}). يرجى إزالة جهاز قديم أولاً.` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // التحقق من أن الجهاز غير مسجل مسبقاً
    const { data: existingDevice } = await supabase
      .from("user_devices")
      .select("id, is_active")
      .eq("user_id", userId)
      .eq("device_fingerprint", deviceFingerprint)
      .single();

    if (existingDevice) {
      // إذا كان الجهاز موجود لكن غير نشط، نفعّله
      if (!existingDevice.is_active) {
        const { error: updateError } = await supabase
          .from("user_devices")
          .update({ 
            is_active: true, 
            last_seen_at: new Date().toISOString(),
            login_count: 1
          })
          .eq("id", existingDevice.id);

        if (updateError) {
          throw updateError;
        }

        console.log("✅ Device reactivated:", deviceFingerprint);
        return new Response(
          JSON.stringify({ success: true, message: "تم إعادة تفعيل الجهاز بنجاح" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // الجهاز موجود ونشط بالفعل
      return new Response(
        JSON.stringify({ success: true, message: "الجهاز مسجل بالفعل" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // تحديد اسم الجهاز
    const deviceName = deviceInfo?.browser 
      ? `${deviceInfo.browser} على ${deviceInfo.os || 'جهاز غير معروف'}`
      : 'جهاز جديد';

    // تسجيل الجهاز الجديد
    const { error: insertError } = await supabase
      .from("user_devices")
      .insert({
        user_id: userId,
        device_fingerprint: deviceFingerprint,
        device_name: deviceName,
        device_info: deviceInfo || {},
        is_active: true,
        is_primary: (activeDevices || 0) === 0, // أول جهاز يكون الأساسي
        login_count: 1,
        last_seen_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("❌ Error inserting device:", insertError);
      throw insertError;
    }

    // تسجيل في سجل الوصول
    await supabase.from("device_access_log").insert({
      user_id: userId,
      device_fingerprint: deviceFingerprint,
      access_type: "device_registered_with_code",
      was_allowed: true,
      reason: "تم تسجيل الجهاز باستخدام الرمز السري",
      user_agent: deviceInfo?.userAgent || null,
    });

    console.log("✅ Device registered successfully:", deviceFingerprint);

    return new Response(
      JSON.stringify({ success: true, message: "تم تسجيل الجهاز بنجاح" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Error in register-device-with-code:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "حدث خطأ غير متوقع" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
