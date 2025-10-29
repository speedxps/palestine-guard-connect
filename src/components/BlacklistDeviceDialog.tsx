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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  reason: string;
}

interface BlacklistDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attempt: BlockedAttempt | null;
  onSuccess: () => void;
}

export const BlacklistDeviceDialog = ({
  open,
  onOpenChange,
  attempt,
  onSuccess,
}: BlacklistDeviceDialogProps) => {
  const [isBlacklisting, setIsBlacklisting] = useState(false);
  const [notes, setNotes] = useState('');

  const handleBlacklist = async () => {
    if (!attempt) return;

    setIsBlacklisting(true);
    try {
      const { data, error } = await supabase.functions.invoke('blacklist-device', {
        body: {
          userId: attempt.user_id,
          deviceFingerprint: attempt.device_fingerprint,
          deviceInfo: attempt.device_info,
          reason: attempt.reason,
          notes: notes,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('تم حظر الجهاز بنجاح');
        onSuccess();
        onOpenChange(false);
        setNotes('');
      } else {
        throw new Error(data?.error || 'فشل في حظر الجهاز');
      }
    } catch (error: any) {
      console.error('Error blacklisting device:', error);
      toast.error(error.message || 'فشل في حظر الجهاز');
    } finally {
      setIsBlacklisting(false);
    }
  };

  if (!attempt) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حظر الجهاز نهائياً</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-right">
            <p>هل أنت متأكد من حظر هذا الجهاز نهائياً؟</p>
            <div className="p-3 bg-muted rounded-md mt-3">
              <p className="font-medium text-foreground">{attempt.user_name}</p>
              <p className="text-sm text-muted-foreground">{attempt.user_email}</p>
            </div>
            <p className="text-sm mt-3 text-destructive font-medium">
              تحذير: لن يتمكن هذا الجهاز من تسجيل الدخول مرة أخرى حتى تتم إزالته من القائمة السوداء.
            </p>
            <div className="mt-4 space-y-2">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف أي ملاحظات حول سبب الحظر..."
                className="min-h-[80px]"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBlacklisting}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBlacklist}
            disabled={isBlacklisting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isBlacklisting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جارٍ الحظر...
              </>
            ) : (
              'حظر نهائياً'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
