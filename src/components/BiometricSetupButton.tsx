import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface BiometricSetupButtonProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const BiometricSetupButton = ({ isEnabled, onToggle }: BiometricSetupButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isSupported, register } = useBiometricAuth();

  const handleToggleBiometric = async () => {
    if (isEnabled) {
      // Disable biometric
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
          .from('profiles')
          .update({
            biometric_enabled: false,
            biometric_registered_at: null
          })
          .eq('user_id', user.id);

        if (error) throw error;

        localStorage.removeItem('biometricRegistered');
        localStorage.removeItem('biometricCredentialId');
        localStorage.removeItem('biometricUserId');
        localStorage.removeItem('biometricSimulated');

        toast.success('تم تعطيل تسجيل الدخول بالبصمة');
        onToggle(false);
      } catch (error: any) {
        console.error('Error disabling biometric:', error);
        toast.error('فشل في تعطيل تسجيل الدخول بالبصمة');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Enable biometric
      if (!isSupported) {
        toast.error('⚠️ المصادقة البيومترية غير مدعومة على هذا الجهاز');
        return;
      }

      try {
        setIsLoading(true);
        
        // Show a helpful message before registration
        toast.info('📱 تأكد من تسجيل بصمتك على الهاتف أولاً في إعدادات الجهاز');
        
        // Call register from useBiometricAuth - this will trigger the real biometric prompt
        const result = await register();

        if (!result.success) {
          // Show specific error message
          toast.error(result.error || 'فشل في تسجيل البصمة');
          return;
        }

        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
          .from('profiles')
          .update({
            biometric_enabled: true,
            biometric_registered_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;

        // Save user ID and enabled status for biometric login
        localStorage.setItem('biometricUserId', user.id);
        localStorage.setItem('biometricEnabled', 'true');

        toast.success('تم تفعيل تسجيل الدخول بالبصمة');
        onToggle(true);
      } catch (error: any) {
        console.error('Error enabling biometric:', error);
        toast.error('فشل في تفعيل تسجيل الدخول بالبصمة');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-full ${isEnabled ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}
          >
            {isEnabled ? (
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <Fingerprint className="w-5 h-5 text-muted-foreground" />
            )}
          </motion.div>
          <div>
            <h3 className="font-semibold">تسجيل الدخول بالبصمة</h3>
            <p className="text-sm text-muted-foreground">
              {isEnabled ? 'مفعّل - جاهز للاستخدام' : 'استخدم بصمة إصبعك لتسجيل دخول سريع وآمن'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleToggleBiometric}
          disabled={isLoading}
          variant={isEnabled ? 'destructive' : 'default'}
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              جاري التحميل...
            </>
          ) : isEnabled ? (
            'تعطيل'
          ) : (
            <>
              <Fingerprint className="w-4 h-4 mr-2" />
              إعداد
            </>
          )}
        </Button>
      </div>

      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-900 dark:text-green-100">تم التفعيل بنجاح</p>
              <p className="text-green-700 dark:text-green-300 mt-1">
                يمكنك الآن استخدام بصمة إصبعك لتسجيل الدخول السريع من صفحة تسجيل الدخول
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};