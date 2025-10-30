import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Smartphone, 
  Clock, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  Ban
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface BlockedAttempt {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  device_fingerprint: string;
  device_info: any;
  geolocation: {
    latitude: number;
    longitude: number;
  } | null;
  ip_address: string | null;
  user_agent: string | null;
  reason: string;
  created_at: string;
}

interface BlockedAttemptCardProps {
  attempt: BlockedAttempt;
  onApprove: (attempt: BlockedAttempt) => void;
  onBlacklist: (attempt: BlockedAttempt) => void;
}

export const BlockedAttemptCard = ({ attempt, onApprove, onBlacklist }: BlockedAttemptCardProps) => {
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const deviceInfo = attempt.device_info || {};
  const deviceName = deviceInfo.deviceName || 
    `${deviceInfo.browser || 'متصفح غير معروف'} على ${deviceInfo.os || 'نظام غير معروف'}`;

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <h3 className="font-semibold text-base truncate">{attempt.user_name}</h3>
              </div>
              <p className="text-sm text-muted-foreground truncate">{attempt.user_email}</p>
            </div>
            <Badge variant="destructive" className="flex-shrink-0">محظور</Badge>
          </div>

          {/* Device Info */}
          <div className="flex items-center gap-2 text-sm">
            <Smartphone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{deviceName}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              {formatDistanceToNow(new Date(attempt.created_at), {
                addSuffix: true,
                locale: ar,
              })}
            </span>
          </div>

          {/* Reason */}
          <div className="p-3 bg-background rounded-md">
            <p className="text-sm">
              <span className="font-medium">السبب: </span>
              <span className="text-muted-foreground">{attempt.reason}</span>
            </p>
          </div>

          {/* IP Address */}
          {attempt.ip_address && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">IP: </span>
              <span className="font-mono">{attempt.ip_address}</span>
            </div>
          )}

          {/* Location */}
          {attempt.geolocation ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedLocation({
                  lat: attempt.geolocation!.latitude,
                  lng: attempt.geolocation!.longitude
                });
                setMapDialogOpen(true);
              }}
              className="w-full"
            >
              <MapPin className="h-4 w-4 ml-2" />
              عرض موقعي
            </Button>
          ) : (
            <div className="p-3 bg-muted rounded-md text-center">
              <p className="text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 inline ml-1" />
                لا يوجد موقع GPS لهذه المحاولة
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <Button
              variant="default"
              onClick={() => onApprove(attempt)}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 ml-2" />
              السماح بالدخول
            </Button>
            <Button
              variant="destructive"
              onClick={() => onBlacklist(attempt)}
              className="w-full"
            >
              <Ban className="h-4 w-4 ml-2" />
              حظر نهائي
            </Button>
          </div>
        </div>
        </CardContent>

        {/* Map Dialog */}
        <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
          <DialogContent className="max-w-4xl h-[600px]">
            <DialogHeader>
              <DialogTitle>موقع تسجيل الدخول</DialogTitle>
            </DialogHeader>
            {selectedLocation && (
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=15&output=embed`}
                allowFullScreen
              />
            )}
          </DialogContent>
        </Dialog>
      </Card>
    );
  };
