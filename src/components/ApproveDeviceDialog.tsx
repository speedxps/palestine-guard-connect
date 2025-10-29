import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BlockedAttempt {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  device_fingerprint: string;
  device_info: any;
}

interface ApproveDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attempt: BlockedAttempt | null;
  onSuccess: () => void;
}

export const ApproveDeviceDialog = ({
  open,
  onOpenChange,
  attempt,
  onSuccess,
}: ApproveDeviceDialogProps) => {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    if (!attempt) return;

    setIsApproving(true);
    try {
      const { data, error } = await supabase.functions.invoke('approve-device', {
        body: {
          attemptId: attempt.id,
          userId: attempt.user_id,
          deviceFingerprint: attempt.device_fingerprint,
          deviceInfo: attempt.device_info,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('تم الموافقة على الجهاز بنجاح');
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(data?.error || 'فشل في الموافقة على الجهاز');
      }
    } catch (error: any) {
      console.error('Error approving device:', error);
      toast.error(error.message || 'فشل في الموافقة على الجهاز');
    } finally {
      setIsApproving(false);
    }
  };

  if (!attempt) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>الموافقة على الجهاز</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-right">
            <p>هل أنت متأكد من الموافقة على هذا الجهاز؟</p>
            <div className="p-3 bg-muted rounded-md mt-3">
              <p className="font-medium text-foreground">{attempt.user_name}</p>
              <p className="text-sm text-muted-foreground">{attempt.user_email}</p>
            </div>
            <p className="text-sm mt-3">
              سيتم إضافة هذا الجهاز إلى قائمة الأجهزة المصرح بها ويمكن للمستخدم تسجيل الدخول منه.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isApproving}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApprove}
            disabled={isApproving}
            className="bg-primary hover:bg-primary/90"
          >
            {isApproving ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جارٍ الموافقة...
              </>
            ) : (
              'موافقة'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
