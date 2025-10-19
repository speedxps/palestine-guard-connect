import { BackButton } from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Radio, Phone, Activity, AlertCircle, Users, MapPin } from 'lucide-react';

export default function JointOpsCommandCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <BackButton />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">غرفة العمليات</h1>
          <p className="text-muted-foreground">مركز القيادة والتحكم للعمليات المشتركة</p>
        </div>

        {/* Live Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">حالات طارئة</p>
                <p className="text-3xl font-bold text-red-600">2</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500 opacity-70 animate-pulse" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">عمليات جارية</p>
                <p className="text-3xl font-bold text-blue-600">5</p>
              </div>
              <Activity className="h-10 w-10 text-blue-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">وحدات نشطة</p>
                <p className="text-3xl font-bold text-green-600">12</p>
              </div>
              <Users className="h-10 w-10 text-green-500 opacity-70" />
            </div>
          </Card>
        </div>

        {/* Command Center Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Radio className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">الاتصالات اللاسلكية</h3>
                <p className="text-sm text-muted-foreground">شبكة اتصالات مشفرة</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">القناة 1 - الأمن الوقائي</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">القناة 2 - المخابرات</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">القناة 3 - الأمن الوطني</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">الخطوط الساخنة</h3>
                <p className="text-sm text-muted-foreground">اتصال مباشر بالقيادات</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">الخط 1 - القيادة العامة</span>
                <Badge className="bg-green-500">متاح</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">الخط 2 - الطوارئ</span>
                <Badge className="bg-green-500">متاح</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">الخط 3 - التنسيق</span>
                <Badge className="bg-yellow-500">مشغول</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">التتبع الجغرافي</h3>
                <p className="text-sm text-muted-foreground">مواقع الوحدات الميدانية</p>
              </div>
            </div>
            <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">خريطة تفاعلية - قريباً</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">سجل الأحداث</h3>
                <p className="text-sm text-muted-foreground">آخر الأنشطة والتحديثات</p>
              </div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <div className="p-2 bg-muted/50 rounded text-sm">
                <p className="font-semibold">19:45 - بدء عملية الدرع الواقي</p>
              </div>
              <div className="p-2 bg-muted/50 rounded text-sm">
                <p className="font-semibold">19:30 - اتصال طارئ من الأمن الوقائي</p>
              </div>
              <div className="p-2 bg-muted/50 rounded text-sm">
                <p className="font-semibold">19:15 - تحديث حالة الوحدة 5</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${className}`}>
      {children}
    </span>
  );
}
