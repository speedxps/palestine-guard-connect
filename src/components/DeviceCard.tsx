import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Smartphone, Clock, Hash, MapPin, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DeviceToggleButton } from './DeviceToggleButton';

interface Device {
  id: string;
  device_fingerprint: string;
  device_info: any;
  device_name?: string;
  is_active: boolean;
  is_primary: boolean;
  first_seen_at: string;
  last_seen_at: string;
  login_count: number;
  notes?: string;
  user_id: string;
}

interface DeviceCardProps {
  device: Device;
  userId: string;
  onViewDetails: (device: Device) => void;
  onDelete: (device: Device) => void;
  onToggle: () => void;
  isDeleting?: boolean;
}

export const DeviceCard = ({ device, userId, onViewDetails, onDelete, onToggle, isDeleting }: DeviceCardProps) => {
  const isMobile = device.device_info?.platform?.toLowerCase().includes('mobile') || 
                   device.device_info?.platform?.toLowerCase().includes('android') ||
                   device.device_info?.platform?.toLowerCase().includes('ios');

  // Check if device is online (last seen within 5 minutes)
  const isOnline = device.is_active && 
    new Date().getTime() - new Date(device.last_seen_at).getTime() < 5 * 60 * 1000;

  const getDeviceName = () => {
    if (device.device_name) return device.device_name;
    const info = device.device_info;
    if (info?.userAgent) {
      if (info.userAgent.includes('iPhone')) return 'iPhone';
      if (info.userAgent.includes('iPad')) return 'iPad';
      if (info.userAgent.includes('Android')) return 'Android';
      if (info.userAgent.includes('Windows')) return 'Windows PC';
      if (info.userAgent.includes('Macintosh')) return 'Mac';
      if (info.userAgent.includes('Linux')) return 'Linux';
    }
    return 'جهاز غير معروف';
  };

  const hasGPS = device.device_info?.geolocation?.latitude && device.device_info?.geolocation?.longitude;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-4">
        {/* Device Name & Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              {isOnline && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm sm:text-base truncate">{getDeviceName()}</h4>
                {isOnline && (
                  <Badge variant="default" className="text-xs bg-green-500">Online</Badge>
                )}
              </div>
              {device.is_primary && (
                <Badge variant="secondary" className="text-xs mt-1">أساسي</Badge>
              )}
            </div>
          </div>
          <Badge variant={device.is_active ? 'default' : 'secondary'} className="flex-shrink-0">
            {device.is_active ? 'نشط' : 'معطل'}
          </Badge>
        </div>

        <div className="h-px bg-border" />

        {/* Device Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">آخر استخدام</p>
              <p className="font-medium truncate">
                {formatDistanceToNow(new Date(device.last_seen_at), {
                  addSuffix: true,
                  locale: ar,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">مرات الدخول</p>
              <p className="font-medium">{device.login_count}</p>
            </div>
          </div>
        </div>

        {device.notes && (
          <>
            <div className="h-px bg-border" />
            <div className="text-sm">
              <p className="text-xs text-muted-foreground mb-1">ملاحظات:</p>
              <p className="text-muted-foreground">{device.notes}</p>
            </div>
          </>
        )}

        <div className="h-px bg-border" />

        {/* Toggle & Actions */}
        <div className="space-y-3">
          <DeviceToggleButton
            deviceId={device.id}
            userId={userId}
            isActive={device.is_active}
            onToggle={onToggle}
          />

          {hasGPS && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const lat = device.device_info.geolocation.latitude;
                const lng = device.device_info.geolocation.longitude;
                window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
              }}
              className="w-full"
            >
              <MapPin className="h-4 w-4 ml-2" />
              عرض الموقع على الخريطة
              <ExternalLink className="h-3 w-3 mr-2" />
            </Button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(device)}
              className="w-full"
            >
              <Eye className="h-4 w-4 ml-2" />
              عرض التفاصيل
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(device)}
              disabled={isDeleting}
              className="w-full"
            >
              {isDeleting ? (
                <span className="animate-spin ml-2">⏳</span>
              ) : (
                <Trash2 className="h-4 w-4 ml-2" />
              )}
              حذف الجهاز
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
