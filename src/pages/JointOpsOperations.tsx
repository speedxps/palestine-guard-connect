import { BackButton } from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Users, Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function JointOpsOperations() {
  const operations = [
    {
      id: 'OP-001',
      name: 'عملية الدرع الواقي',
      agencies: ['الأمن الوقائي', 'قوات الأمن الوطني'],
      status: 'active',
      priority: 'high',
      startDate: '2025-10-15',
      progress: 65
    },
    {
      id: 'OP-002',
      name: 'عملية الحماية المشتركة',
      agencies: ['المخابرات العامة', 'الدفاع المدني'],
      status: 'active',
      priority: 'medium',
      startDate: '2025-10-18',
      progress: 40
    },
    {
      id: 'OP-003',
      name: 'عملية الأمن السيبراني',
      agencies: ['الشرطة الخاصة', 'الأمن الوقائي'],
      status: 'completed',
      priority: 'high',
      startDate: '2025-10-10',
      progress: 100
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">نشطة</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">مكتملة</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">معلقة</Badge>;
      default:
        return <Badge>غير معروف</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <BackButton />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">العمليات المشتركة</h1>
          <p className="text-muted-foreground">إدارة ومتابعة العمليات الأمنية المشتركة</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">عمليات نشطة</p>
                <p className="text-3xl font-bold text-blue-600">2</p>
              </div>
              <Activity className="h-10 w-10 text-blue-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">عمليات مكتملة</p>
                <p className="text-3xl font-bold text-green-600">1</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">أجهزة مشاركة</p>
                <p className="text-3xl font-bold text-purple-600">6</p>
              </div>
              <Users className="h-10 w-10 text-purple-500 opacity-70" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">عمليات معلقة</p>
                <p className="text-3xl font-bold text-amber-600">0</p>
              </div>
              <Clock className="h-10 w-10 text-amber-500 opacity-70" />
            </div>
          </Card>
        </div>

        {/* Operations List */}
        <div className="space-y-4">
          {operations.map((operation) => (
            <Card key={operation.id} className="p-6 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{operation.name}</h3>
                    {getStatusBadge(operation.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">معرف العملية: {operation.id}</p>
                </div>
                <div className={`flex items-center gap-1 ${getPriorityColor(operation.priority)}`}>
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">
                    {operation.priority === 'high' ? 'أولوية عالية' : 'أولوية متوسطة'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الأجهزة المشاركة</p>
                  <div className="flex flex-wrap gap-2">
                    {operation.agencies.map((agency, index) => (
                      <Badge key={index} variant="outline">{agency}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">تاريخ البدء</p>
                  <p className="font-semibold">{new Date(operation.startDate).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">التقدم</p>
                  <p className="text-sm font-bold">{operation.progress}%</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${operation.progress}%` }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
