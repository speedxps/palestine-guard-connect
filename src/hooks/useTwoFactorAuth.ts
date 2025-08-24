import { useState, useEffect } from 'react';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

interface TwoFactorAuthResult {
  isEnabled: boolean;
  secret: string | null;
  qrCodeUrl: string | null;
  setup: (userEmail: string) => Promise<{ secret: string; qrCode: string }>;
  verify: (token: string) => boolean;
  enable: () => void;
  disable: () => void;
  generateBackupCodes: () => string[];
}

export const useTwoFactorAuth = (): TwoFactorAuthResult => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    loadTwoFactorSettings();
  }, []);

  const loadTwoFactorSettings = () => {
    try {
      const enabled = localStorage.getItem('twoFactorEnabled') === 'true';
      const savedSecret = localStorage.getItem('twoFactorSecret');
      
      setIsEnabled(enabled);
      setSecret(savedSecret);
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
      
      // Save secret (but don't enable yet)
      localStorage.setItem('twoFactorSecret', newSecret);
      
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

  const enable = () => {
    setIsEnabled(true);
    localStorage.setItem('twoFactorEnabled', 'true');
  };

  const disable = () => {
    setIsEnabled(false);
    localStorage.setItem('twoFactorEnabled', 'false');
    localStorage.removeItem('twoFactorSecret');
    localStorage.removeItem('twoFactorBackupCodes');
    setSecret(null);
    setQrCodeUrl(null);
  };

  const generateBackupCodes = (): string[] => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-digit backup codes
      const code = Math.random().toString().slice(2, 10);
      codes.push(code);
    }
    
    localStorage.setItem('twoFactorBackupCodes', JSON.stringify(codes));
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