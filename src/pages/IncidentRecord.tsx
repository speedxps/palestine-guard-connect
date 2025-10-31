import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, User, MapPin, Clock, Megaphone, History, FileText, Loader2, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/BackButton';
import { UnifiedNotificationSystem } from '@/components/notifications/UnifiedNotificationSystem';
import { useNotifications } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const IncidentRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<any>(null);
  const [reporter, setReporter] = useState<any>(null);
  const [assignedPatrol, setAssignedPatrol] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  const { notificationHistory, loading: historyLoading } = useNotifications({ 
    contextType: 'incident', 
    contextId: id! 
  });

  useEffect(() => {
    fetchIncidentData();
  }, [id]);

  const fetchIncidentData = async () => {
    try {
      setLoading(true);

      // Fetch incident data
      const { data: incidentData, error: incidentError } = await supabase
        .from('incidents')
        .select(`
          *,
          reporter:profiles!incidents_reporter_id_fkey(full_name, phone_number),
          assigned_patrol:patrols!incidents_assigned_patrol_id_fkey(name, current_location)
        `)
        .eq('id', id)
        .single();

      if (incidentError) throw incidentError;
      setIncident(incidentData);
      setReporter(incidentData.reporter);
      setAssignedPatrol(incidentData.assigned_patrol);

      // Fetch updates/notes (if you have an updates table)
      // For now, we'll just use an empty array
      setUpdates([]);

    } catch (error) {
      console.error('Error fetching incident data:', error);
      toast.error('فشل في تحميل بيانات البلاغ');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
      case 'pending':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'pending': return 'قيد الانتظار';
      case 'in_progress': return 'قيد المعالجة';
      case 'resolved': return 'محلول';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'emergency': return 'طوارئ';
      case 'theft': return 'سرقة';
      case 'accident': return 'حادث';
      case 'riot': return 'اضطرابات';
      case 'violence': return 'عنف';
      case 'fire': return 'حريق';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">البلاغ غير موجود</p>
          <Button onClick={() => navigate('/universal-search')} className="mt-4">
            العودة للبحث
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{incident.title}</h1>
            <p className="text-muted-foreground">بلاغ رقم: {incident.id.slice(0, 8)}</p>
          </div>
          <Badge className={getStatusColor(incident.status)}>
            {getStatusText(incident.status)}
          </Badge>
        </div>

        {/* Main Info Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              تفاصيل البلاغ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">الوصف</p>
                <p className="text-base">{incident.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">نوع البلاغ</p>
                  <Badge variant="outline">{getTypeLabel(incident.incident_type)}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الأولوية</p>
                  <Badge variant="outline">{incident.priority || 'متوسطة'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    الموقع
                  </p>
                  <p className="font-semibold">{incident.location_address || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    التاريخ والوقت
                  </p>
                  <p className="font-semibold">
                    {format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporter Info */}
        {reporter && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                معلومات المبلغ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-semibold">{reporter.full_name}</p>
                </div>
                {reporter.phone_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">الهاتف</p>
                    <p className="font-semibold">{reporter.phone_number}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Patrol */}
        {assignedPatrol && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-6 w-6" />
                الدورية المكلفة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">اسم الدورية</p>
                  <p className="font-semibold">{assignedPatrol.name}</p>
                </div>
                {assignedPatrol.current_location && (
                  <div>
                    <p className="text-sm text-muted-foreground">الموقع الحالي</p>
                    <p className="font-semibold">{assignedPatrol.current_location}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {reporter && (
            <Card
              className="cursor-pointer hover:shadow-xl transition-all hover:scale-105"
              onClick={() => setActiveDialog('notification')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Megaphone className="h-12 w-12 mb-3 text-primary" />
                <p className="font-semibold">إرسال تبليغ</p>
              </CardContent>
            </Card>
          )}

          <Card
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => setActiveDialog('history')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <History className="h-12 w-12 mb-3 text-indigo-500" />
              <p className="font-semibold">سجل التبليغات</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-xl transition-all hover:scale-105">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <FileText className="h-12 w-12 mb-3 text-green-500" />
              <p className="font-semibold">تحديث الحالة</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notification System Dialog */}
      {reporter && (
        <UnifiedNotificationSystem
          open={activeDialog === 'notification'}
          onOpenChange={(open) => !open && setActiveDialog(null)}
          recipientType="incident_party"
          recipientId={incident.reporter_id}
          recipientName={reporter.full_name}
          recipientPhone={reporter.phone_number}
          contextType="incident"
          contextId={id!}
        />
      )}

      {/* Notification History Dialog */}
      <Dialog open={activeDialog === 'history'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>سجل التبليغات المرسلة</DialogTitle>
          </DialogHeader>
          
          {historyLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : notificationHistory.length > 0 ? (
            <div className="space-y-4">
              {notificationHistory.map((notification) => (
                <Card key={notification.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <Badge>{notification.template_used}</Badge>
                      <p className="text-sm text-muted-foreground">
                        المرسل: {notification.sender?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.created_at && format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded">
                    {notification.notification_text}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              لا توجد تبليغات مرسلة سابقاً
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentRecord;
