import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface BorderCrossing {
  id: string;
  name: string;
  status: string;
  crossings_today: number;
  alerts: number;
  cameras_active: number;
  cameras_total: number;
}

export default function BordersMonitoring() {
  const [crossings] = useState<BorderCrossing[]>([
    { id: '1', name: 'معبر رفح', status: 'open', crossings_today: 487, alerts: 2, cameras_active: 12, cameras_total: 12 },
    { id: '2', name: 'معبر الكرامة', status: 'open', crossings_today: 623, alerts: 0, cameras_active: 18, cameras_total: 18 },
    { id: '3', name: 'معبر بيت حانون', status: 'closed', crossings_today: 0, alerts: 1, cameras_active: 8, cameras_total: 8 },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              مراقبة المعابر
            </h1>
            <p className="text-muted-foreground">المراقبة الأمنية لحركة المعابر</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crossings.map((crossing) => (
            <Card key={crossing.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">{crossing.name}</h3>
                  <Badge variant={crossing.status === 'open' ? 'default' : 'secondary'}>
                    {crossing.status === 'open' ? 'مفتوح' : 'مغلق'}
                  </Badge>
                </div>
                <div className={`p-2 rounded-full ${crossing.status === 'open' ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                  <Activity className={`h-6 w-6 ${crossing.status === 'open' ? 'text-green-500' : 'text-gray-500'}`} />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">عمليات العبور اليوم</span>
                  <span className="text-2xl font-bold text-primary">{crossing.crossings_today}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الكاميرات النشطة</span>
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{crossing.cameras_active}/{crossing.cameras_total}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">التنبيهات</span>
                  <div className="flex items-center gap-2">
                    {crossing.alerts > 0 ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-semibold text-red-500">{crossing.alerts}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-green-500">لا توجد</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                عرض المراقبة المباشرة
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
