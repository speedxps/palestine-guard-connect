import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface MaxDevicesSelectorProps {
  userId: string;
  currentMax: number;
  onUpdate: (newMax: number) => void;
}

export const MaxDevicesSelector = ({ userId, currentMax, onUpdate }: MaxDevicesSelectorProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localValue, setLocalValue] = useState(currentMax.toString());

  const handleMaxDevicesChange = async (value: string) => {
    const maxDevices = parseInt(value);
    
    setLocalValue(value);
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-max-devices', {
        body: { userId, maxDevices }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('تم تحديث عدد الأجهزة المسموح بها بنجاح');
        onUpdate(maxDevices);
      } else {
        throw new Error(data?.error || 'فشل في التحديث');
      }
    } catch (error: any) {
      console.error('Error updating max devices:', error);
      toast.error(error.message || 'فشل في تحديث عدد الأجهزة');
      setLocalValue(currentMax.toString());
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={localValue}
        onValueChange={handleMaxDevicesChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">جهاز واحد</SelectItem>
          <SelectItem value="2">جهازين</SelectItem>
          <SelectItem value="3">3 أجهزة</SelectItem>
          <SelectItem value="4">4 أجهزة</SelectItem>
          <SelectItem value="5">5 أجهزة</SelectItem>
          <SelectItem value="10">10 أجهزة</SelectItem>
          <SelectItem value="999">غير محدود</SelectItem>
        </SelectContent>
      </Select>
      {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  );
};
