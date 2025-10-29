import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Monitor, Smartphone, Globe, Cpu, HardDrive, Palette, Clock } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface DeviceDetailsModalProps {
  device: {
    id: string;
    device_name?: string;
    device_fingerprint: string;
    device_info: any;
    is_active: boolean;
    is_primary: boolean;
    first_seen_at: string;
    last_seen_at: string;
    login_count: number;
    notes?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeviceDetailsModal = ({ device, open, onOpenChange }: DeviceDetailsModalProps) => {
  if (!device) return null;

  const deviceInfo = device.device_info;
  const isMobile = deviceInfo?.hardware?.touchSupport || deviceInfo?.hardware?.maxTouchPoints > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {isMobile ? (
              <Smartphone className="h-8 w-8 text-primary" />
            ) : (
              <Monitor className="h-8 w-8 text-primary" />
            )}
            <div>
              <DialogTitle className="text-xl">
                {device.device_name || 'تفاصيل الجهاز'}
              </DialogTitle>
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
          <DialogDescription>
            معلومات مفصلة عن الجهاز والمواصفات التقنية
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* معلومات أساسية */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              معلومات الاستخدام
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">أول استخدام</div>
                <div className="font-medium">
                  {format(new Date(device.first_seen_at), 'PPp', { locale: ar })}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">آخر استخدام</div>
                <div className="font-medium">
                  {format(new Date(device.last_seen_at), 'PPp', { locale: ar })}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">عدد مرات الدخول</div>
                <div className="font-medium">{device.login_count} مرة</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">البصمة الرقمية</div>
                <div className="font-mono text-xs break-all">{device.device_fingerprint.substring(0, 20)}...</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* معلومات المتصفح */}
          {deviceInfo?.browser && (
            <>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  معلومات المتصفح
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">المتصفح</div>
                    <div className="font-medium">{deviceInfo.browser.name} {deviceInfo.browser.version}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">اللغة</div>
                    <div className="font-medium">{deviceInfo.browser.language}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">المنصة</div>
                    <div className="font-medium">{deviceInfo.browser.platform}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">الكوكيز</div>
                    <div className="font-medium">{deviceInfo.browser.cookieEnabled ? 'مفعل' : 'معطل'}</div>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* معلومات نظام التشغيل */}
          {deviceInfo?.os && (
            <>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  نظام التشغيل
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">النظام</div>
                    <div className="font-medium">{deviceInfo.os.name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">الإصدار</div>
                    <div className="font-medium">{deviceInfo.os.version}</div>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* مواصفات الجهاز */}
          {deviceInfo?.hardware && (
            <>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  مواصفات الجهاز
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">عدد الأنوية</div>
                    <div className="font-medium">{deviceInfo.hardware.cores || 'غير معروف'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">الذاكرة</div>
                    <div className="font-medium">
                      {deviceInfo.hardware.memory ? `${deviceInfo.hardware.memory} GB` : 'غير معروف'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">دعم اللمس</div>
                    <div className="font-medium">{deviceInfo.hardware.touchSupport ? 'نعم' : 'لا'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">نقاط اللمس</div>
                    <div className="font-medium">{deviceInfo.hardware.maxTouchPoints || 0}</div>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* معلومات الشاشة */}
          {deviceInfo?.screen && (
            <>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  معلومات الشاشة
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">الدقة</div>
                    <div className="font-medium">{deviceInfo.screen.width} × {deviceInfo.screen.height}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">عمق الألوان</div>
                    <div className="font-medium">{deviceInfo.screen.colorDepth} bit</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">نسبة البكسل</div>
                    <div className="font-medium">{deviceInfo.screen.pixelRatio}x</div>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* المنطقة الزمنية */}
          {deviceInfo?.timezone && (
            <>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  المنطقة الزمنية
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">المنطقة</div>
                    <div className="font-medium">{deviceInfo.timezone.timezone}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">الإزاحة</div>
                    <div className="font-medium">{deviceInfo.timezone.offset} دقيقة</div>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* الخطوط المثبتة */}
          {deviceInfo?.fonts && deviceInfo.fonts.length > 0 && (
            <>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  الخطوط المثبتة
                </h3>
                <div className="flex flex-wrap gap-2">
                  {deviceInfo.fonts.slice(0, 10).map((font: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {font}
                    </Badge>
                  ))}
                  {deviceInfo.fonts.length > 10 && (
                    <Badge variant="secondary" className="text-xs">
                      +{deviceInfo.fonts.length - 10} أخرى
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ملاحظات */}
          {device.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">ملاحظات الإدارة</h3>
                <div className="text-sm p-3 bg-muted rounded-md">
                  {device.notes}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
