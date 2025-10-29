import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Trash2, Eye, Clock, LogIn } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface DeviceCardProps {
  device: {
    id: string;
    device_name?: string;
    device_info: any;
    is_active: boolean;
    is_primary: boolean;
    last_seen_at: string;
    login_count: number;
    first_seen_at: string;
    notes?: string;
  };
  onViewDetails: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export const DeviceCard = ({ device, onViewDetails, onDelete, isDeleting }: DeviceCardProps) => {
  const deviceInfo = device.device_info;
  const isMobile = deviceInfo?.hardware?.touchSupport || deviceInfo?.hardware?.maxTouchPoints > 0;

  const getDeviceDisplayName = () => {
    if (device.device_name) return device.device_name;
    
    const browser = deviceInfo?.browser?.name || 'Unknown';
    const browserVersion = deviceInfo?.browser?.version || '';
    const os = deviceInfo?.os?.name || 'Unknown';
    const osVersion = deviceInfo?.os?.version || '';
    
    return `${browser} ${browserVersion} على ${os} ${osVersion}`;
  };

  return (
    <Card className={`${!device.is_active ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isMobile ? (
              <Smartphone className="h-8 w-8 text-primary" />
            ) : (
              <Monitor className="h-8 w-8 text-primary" />
            )}
            <div>
              <CardTitle className="text-lg">{getDeviceDisplayName()}</CardTitle>
              <div className="flex gap-2 mt-1">
                {device.is_primary && (
                  <Badge variant="default" className="text-xs">جهاز رئيسي</Badge>
                )}
                {device.is_active ? (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                    نشط
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">
                    معطل
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <div>
              <div className="font-medium text-foreground">آخر استخدام</div>
              <div className="text-xs">
                {format(new Date(device.last_seen_at), 'PPp', { locale: ar })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <LogIn className="h-4 w-4" />
            <div>
              <div className="font-medium text-foreground">مرات الدخول</div>
              <div className="text-xs">{device.login_count} مرة</div>
            </div>
          </div>
        </div>

        {device.notes && (
          <div className="text-sm p-2 bg-muted rounded-md">
            <div className="font-medium mb-1">ملاحظات:</div>
            <div className="text-muted-foreground">{device.notes}</div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            عرض التفاصيل
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
