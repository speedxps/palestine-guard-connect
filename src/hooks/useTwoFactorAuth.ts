import { useState, useEffect } from 'react';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TwoFactorAuthResult {
  isEnabled: boolean;
  secret: string | null;
  qrCodeUrl: string | null;
  setup: (userEmail: string) => Promise<{ secret: string; qrCode: string }>;
  verify: (token: string) => boolean;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  generateBackupCodes: () => Promise<string[]>;
}

export const useTwoFactorAuth = (): TwoFactorAuthResult => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTwoFactorSettings();
    }
  }, [user]);

  const loadTwoFactorSettings = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('two_factor_enabled, two_factor_secret')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading 2FA settings:', error);
        return;
      }

      if (data) {
        setIsEnabled(data.two_factor_enabled || false);
        setSecret(data.two_factor_secret || null);
      }
    } catch (error) {
      console.error('Error loading two-factor settings:', error);
    }
  };

  const setup = async (userEmail: string): Promise<{ secret: string; qrCode: string }> => {
    try {
      // Generate a random secret (32 characters, Base32 encoded)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      let newSecret = '';
      for (let i = 0; i < 32; i++) {
        newSecret += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Create TOTP instance
      const totp = new OTPAuth.TOTP({
        issuer: 'الشرطة الفلسطينية',
        label: userEmail,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: newSecret,
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(totp.toString());
      
      setSecret(newSecret);
      setQrCodeUrl(qrCode);
      
      // Save secret to database (but don't enable yet)
      if (user?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ two_factor_secret: newSecret })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error saving 2FA secret:', updateError);
          throw new Error('فشل في حفظ المفتاح السري');
        }
      }
      
      return { secret: newSecret, qrCode };
    } catch (error) {
      console.error('Error setting up two-factor auth:', error);
      throw new Error('فشل في إعداد المصادقة الثنائية');
    }
  };

  const verify = (token: string): boolean => {
    if (!secret) return false;

    try {
      const totp = new OTPAuth.TOTP({
        issuer: 'الشرطة الفلسطينية',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
      });

      // Verify current token with some tolerance for clock skew
      const currentTime = Date.now();
      const windowSize = 1; // Allow 1 step before/after current time

      for (let i = -windowSize; i <= windowSize; i++) {
        const testTime = currentTime + (i * 30 * 1000); // 30-second periods
        const expectedToken = totp.generate({ timestamp: testTime });
        
        if (token === expectedToken) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  };

  const enable = async () => {
    if (!user?.id) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        two_factor_enabled: true,
        two_factor_setup_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error enabling 2FA:', error);
      throw new Error('فشل في تفعيل المصادقة الثنائية');
    }

    setIsEnabled(true);
  };

  const disable = async () => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: []
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error disabling 2FA:', error);
      throw new Error('فشل في تعطيل المصادقة الثنائية');
    }

    setIsEnabled(false);
    setSecret(null);
    setQrCodeUrl(null);
  };

  const generateBackupCodes = async (): Promise<string[]> => {
    if (!user?.id) return [];

    const codes = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-digit backup codes
      const code = Math.random().toString().slice(2, 10);
      codes.push(code);
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ two_factor_backup_codes: codes })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error saving backup codes:', error);
      throw new Error('فشل في حفظ رموز النسخ الاحتياطي');
    }

    return codes;
  };

  return {
    isEnabled,
    secret,
    qrCodeUrl,
    setup,
    verify,
    enable,
    disable,
    generateBackupCodes,
  };
};