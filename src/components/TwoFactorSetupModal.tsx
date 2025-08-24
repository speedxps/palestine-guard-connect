import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTwoFactorAuth } from '@/hooks/useTwoFactorAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Copy, Check, Download } from 'lucide-react';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { setup, verify, enable, generateBackupCodes } = useTwoFactorAuth();

  const handleSetup = async () => {
    if (!user?.email) {
      toast({
        title: "❌ خطأ",
        description: "لم يتم العثور على بريد إلكتروني",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await setup(user.email);
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setStep('verify');
      
      toast({
        title: "✅ تم إنشاء المفتاح",
        description: "اربط تطبيق المصادقة الآن",
      });
    } catch (error: any) {
      toast({
        title: "❌ خطأ",
        description: error.message || "فشل في إعداد المصادقة الثنائية",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "❌ رمز غير صحيح",
        description: "أدخل رمز من 6 أرقام",
        variant: "destructive",
      });
      return;
    }

    const isValid = verify(verificationCode);
    
    if (isValid) {
      // Generate backup codes
      const codes = generateBackupCodes();
      setBackupCodes(codes);
      setStep('backup');
      
      toast({
        title: "✅ تم التحقق بنجاح",
        description: "احفظ رموز النسخ الاحتياطي",
      });
    } else {
      toast({
        title: "❌ رمز خاطئ",
        description: "الرمز غير صحيح، تأكد من الوقت والرمز",
        variant: "destructive",
      });
    }
  };

  const handleComplete = () => {
    enable();
    onSuccess();
    onClose();
    
    toast({
      title: "🔒 تم تفعيل المصادقة الثنائية",
      description: "حسابك محمي الآن بالمصادقة الثنائية",
    });
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
      toast({
        title: "✅ تم النسخ",
        description: "تم نسخ المفتاح السري",
      });
    } catch (error) {
      toast({
        title: "❌ خطأ في النسخ",
        description: "انسخ المفتاح يدوياً",
        variant: "destructive",
      });
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n');
    const blob = new Blob([`رموز النسخ الاحتياطي - الشرطة الفلسطينية\n\n${codesText}\n\nاحفظ هذه الرموز في مكان آمن. كل رمز يمكن استخدامه مرة واحدة فقط.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic">
            {step === 'setup' && 'إعداد المصادقة الثنائية'}
            {step === 'verify' && 'التحقق من الإعداد'}
            {step === 'backup' && 'رموز النسخ الاحتياطي'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {step === 'setup' && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground font-arabic">
                ستحتاج إلى تطبيق مصادقة مثل Google Authenticator أو Microsoft Authenticator
              </p>
              <Button
                onClick={handleSetup}
                disabled={isLoading}
                className="w-full font-arabic"
              >
                {isLoading ? 'جاري الإعداد...' : 'بدء الإعداد'}
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground font-arabic">
                  امسح رمز QR أو أدخل المفتاح السري يدوياً
                </p>
                
                {qrCode && (
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
                  </div>
                )}
                
                {/* Manual Secret */}
                <div className="bg-muted/50 p-3 rounded-lg">
                  <Label className="text-xs font-arabic mb-2 block">المفتاح السري (للإدخال اليدوي):</Label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-background px-2 py-1 rounded flex-1 font-mono">
                      {secret}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copySecret}
                      className="p-2"
                    >
                      {secretCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div className="space-y-2">
                <Label className="font-arabic">أدخل الرمز من التطبيق (6 أرقام):</Label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('setup')}
                  className="flex-1 font-arabic"
                >
                  رجوع
                </Button>
                <Button
                  onClick={handleVerification}
                  disabled={verificationCode.length !== 6}
                  className="flex-1 font-arabic"
                >
                  تحقق
                </Button>
              </div>
            </div>
          )}

          {step === 'backup' && (
            <div className="space-y-4">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-orange-600 font-arabic mb-2">
                  ⚠️ مهم جداً: احفظ هذه الرموز
                </h4>
                <p className="text-sm text-orange-600/80 font-arabic">
                  استخدم هذه الرموز إذا فقدت جهازك. كل رمز يُستخدم مرة واحدة فقط.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="font-mono text-sm bg-background p-2 rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  onClick={downloadBackupCodes}
                  className="w-full font-arabic"
                >
                  <Download className="h-4 w-4 mr-2" />
                  تحميل الرموز
                </Button>
              </div>

              <Button
                onClick={handleComplete}
                className="w-full font-arabic"
              >
                إنهاء الإعداد
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};