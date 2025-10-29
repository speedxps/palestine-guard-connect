import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeviceToggleButtonProps {
  deviceId: string;
  userId: string;
  isActive: boolean;
  onToggle: () => void;
}

export const DeviceToggleButton = ({ deviceId, userId, isActive, onToggle }: DeviceToggleButtonProps) => {
  const [isToggling, setIsToggling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = async () => {
    // If activating, no confirmation needed
    if (!isActive) {
      await performToggle();
      return;
    }

    // If deactivating, show confirmation
    setShowConfirm(true);
  };

  const performToggle = async () => {
    setIsToggling(true);
    setShowConfirm(false);

    try {
      const { data, error } = await supabase.functions.invoke('manage-user-device', {
        body: {
          action: 'toggle',
          userId,
          deviceId,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(isActive ? 'تم تعطيل الجهاز بنجاح' : 'تم تفعيل الجهاز بنجاح');
        onToggle();
      } else {
        throw new Error(data?.error || 'فشل في تحديث حالة الجهاز');
      }
    } catch (error: any) {
      console.error('Error toggling device:', error);
      toast.error(error.message || 'فشل في تحديث حالة الجهاز');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`device-${deviceId}`} className="text-sm">
          {isActive ? 'نشط' : 'معطل'}
        </Label>
        <Switch
          id={`device-${deviceId}`}
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={isToggling}
        />
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تعطيل الجهاز</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في تعطيل هذا الجهاز؟ لن يتمكن المستخدم من تسجيل الدخول من هذا الجهاز حتى يتم تفعيله مرة أخرى.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={performToggle}>تأكيد التعطيل</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
