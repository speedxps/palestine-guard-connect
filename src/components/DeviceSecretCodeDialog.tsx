import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Shield, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeviceSecretCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  deviceInfo?: {
    fingerprint: string;
    deviceInfo: any;
  };
  userId: string;
}

const SECRET_CODE = '1234';

export const DeviceSecretCodeDialog: React.FC<DeviceSecretCodeDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  deviceInfo,
  userId,
}) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleVerify = async () => {
    setError('');
    
    if (code !== SECRET_CODE) {
      setError('الرمز السري غير صحيح');
      setCode('');
      return;
    }

    setIsVerifying(true);

    try {
      // استدعاء edge function لتسجيل الجهاز الجديد
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error: regError } = await supabase.functions.invoke('register-device-with-code', {
        body: {
          userId,
          deviceFingerprint: deviceInfo?.fingerprint,
          deviceInfo: deviceInfo?.deviceInfo,
          secretCode: code,
        },
      });

      if (regError) {
        throw regError;
      }

      toast({
        title: '✅ تم تسجيل الجهاز بنجاح',
        description: 'يمكنك الآن استخدام هذا الجهاز لتسجيل الدخول',
      });

      onSuccess();
    } catch (err) {
      console.error('Error registering device:', err);
      setError('حدث خطأ أثناء تسجيل الجهاز');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            تسجيل جهاز جديد
          </DialogTitle>
          <DialogDescription className="text-right">
            هذا الجهاز غير مسجل في حسابك. أدخل الرمز السري لإضافته كجهاز مصرح به.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              أدخل الرمز السري المكون من 4 أرقام
            </p>
          </div>

          <div dir="ltr">
            <InputOTP
              maxLength={4}
              value={code}
              onChange={(value) => {
                setCode(value);
                setError('');
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isVerifying}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleVerify}
              className="flex-1"
              disabled={code.length !== 4 || isVerifying}
            >
              {isVerifying ? 'جاري التحقق...' : 'تأكيد'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
