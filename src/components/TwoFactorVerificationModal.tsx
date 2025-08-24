import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTwoFactorAuth } from '@/hooks/useTwoFactorAuth';
import { Shield, RotateCcw } from 'lucide-react';

interface TwoFactorVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail: string;
}

export const TwoFactorVerificationModal: React.FC<TwoFactorVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userEmail,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { verify } = useTwoFactorAuth();

  const handleVerification = async () => {
    if (!verificationCode && !backupCode) {
      toast({
        title: "❌ رمز مطلوب",
        description: "أدخل رمز المصادقة أو رمز النسخ الاحتياطي",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let isValid = false;
      
      if (showBackupCode && backupCode) {
        // Verify backup code
        const savedBackupCodes = localStorage.getItem('twoFactorBackupCodes');
        if (savedBackupCodes) {
          const codes = JSON.parse(savedBackupCodes);
          const codeIndex = codes.indexOf(backupCode);
          
          if (codeIndex !== -1) {
            // Remove used backup code
            codes.splice(codeIndex, 1);
            localStorage.setItem('twoFactorBackupCodes', JSON.stringify(codes));
            isValid = true;
            
            toast({
              title: "⚠️ تم استخدام رمز النسخ الاحتياطي",
              description: `متبقي ${codes.length} من رموز النسخ الاحتياطي`,
            });
          }
        }
      } else if (verificationCode) {
        // Verify TOTP code
        isValid = verify(verificationCode);
      }

      if (isValid) {
        onSuccess();
        onClose();
        resetForm();
        
        toast({
          title: "✅ تم التحقق بنجاح",
          description: "مرحباً بك في النظام",
        });
      } else {
        toast({
          title: "❌ رمز خاطئ",
          description: showBackupCode 
            ? "رمز النسخ الاحتياطي غير صحيح أو مستخدم مسبقاً"
            : "رمز المصادقة غير صحيح، تأكد من الوقت والرمز",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Two-factor verification error:', error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ في التحقق من الرمز",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setVerificationCode('');
    setBackupCode('');
    setShowBackupCode(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-arabic flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            المصادقة الثنائية
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-arabic mb-2">
              أدخل رمز المصادقة من تطبيق المصادقة الخاص بك
            </p>
            <p className="text-xs text-muted-foreground">
              {userEmail}
            </p>
          </div>

          {!showBackupCode ? (
            <div className="space-y-4">
              {/* TOTP Code Input */}
              <div className="space-y-2">
                <Label className="font-arabic">رمز المصادقة (6 أرقام):</Label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              {/* Backup Code Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowBackupCode(true)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-arabic"
                >
                  استخدام رمز النسخ الاحتياطي بدلاً من ذلك
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Backup Code Input */}
              <div className="space-y-2">
                <Label className="font-arabic">رمز النسخ الاحتياطي (8 أرقام):</Label>
                <Input
                  type="text"
                  placeholder="12345678"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="text-center text-xl tracking-widest font-mono"
                  maxLength={8}
                />
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <p className="text-xs text-orange-600 font-arabic">
                  ⚠️ ملاحظة: رموز النسخ الاحتياطي تُستخدم مرة واحدة فقط
                </p>
              </div>

              {/* Back to TOTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowBackupCode(false)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-arabic flex items-center gap-1 mx-auto"
                >
                  <RotateCcw className="h-3 w-3" />
                  العودة لرمز المصادقة العادي
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 font-arabic"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleVerification}
              disabled={isLoading || (!verificationCode && !backupCode)}
              className="flex-1 font-arabic"
            >
              {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};