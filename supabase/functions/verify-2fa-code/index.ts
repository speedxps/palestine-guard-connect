import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as OTPAuth from 'npm:otpauth@9.2.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { email, code, isBackupCode } = await req.json();

    console.log('🔐 Verifying 2FA code for email:', email);

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'فشل في التحقق من المستخدم' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const user = users?.find(u => u.email === email);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'المستخدم غير موجود' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get 2FA settings from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('two_factor_enabled, two_factor_secret, two_factor_backup_codes')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ success: false, error: 'فشل في جلب إعدادات المصادقة' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!profile.two_factor_enabled) {
      return new Response(
        JSON.stringify({ success: false, error: 'المصادقة الثنائية غير مفعلة' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let isValid = false;
    let remainingBackupCodes: number | undefined;

    if (isBackupCode) {
      // Verify backup code
      const backupCodes = profile.two_factor_backup_codes || [];
      const codeIndex = backupCodes.indexOf(code);

      if (codeIndex !== -1) {
        // Remove used backup code
        backupCodes.splice(codeIndex, 1);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ two_factor_backup_codes: backupCodes })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating backup codes:', updateError);
        } else {
          isValid = true;
          remainingBackupCodes = backupCodes.length;
        }
      }
    } else {
      // Verify TOTP code
      const secret = profile.two_factor_secret;
      if (!secret) {
        return new Response(
          JSON.stringify({ success: false, error: 'المفتاح السري غير موجود' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const totp = new OTPAuth.TOTP({
        issuer: 'الشرطة الفلسطينية',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      });

      // Verify with time window tolerance
      const currentTime = Date.now();
      const windowSize = 1; // Allow 1 step before/after

      for (let i = -windowSize; i <= windowSize; i++) {
        const testTime = currentTime + (i * 30 * 1000);
        const expectedToken = totp.generate({ timestamp: testTime });
        
        if (code === expectedToken) {
          isValid = true;
          break;
        }
      }
    }

    if (isValid) {
      console.log('✅ 2FA verification successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'تم التحقق بنجاح',
          remainingBackupCodes
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
      console.log('❌ 2FA verification failed');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: isBackupCode ? 'رمز النسخ الاحتياطي غير صحيح' : 'رمز المصادقة غير صحيح' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ 2FA verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'حدث خطأ في التحقق من الرمز' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});