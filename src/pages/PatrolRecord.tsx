import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  MapPin, Users, Activity, MessageSquare, 
  FileText, Clock, Navigation, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';
import { UnifiedNotificationSystem } from '@/components/notifications/UnifiedNotificationSystem';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const PatrolRecord = () => {
  const { id } = useParams();
  const [patrol, setPatrol] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPatrolData();
    }
  }, [id]);

  const fetchPatrolData = async () => {
    try {
      const { data: patrolData, error } = await supabase
        .from('patrols')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!patrolData) {
        toast.error('لم يتم العثور على الدورية');
        return;
      }

      setPatrol(patrolData);
    } catch (error) {
      console.error('Error fetching patrol:', error);
      toast.error('حدث خطأ أثناء جلب بيانات الدورية');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!patrol) return;
    setLoadingData(true);
    try {
      // Fetch members from profiles if patrol has members array
      if (patrol.members && Array.isArray(patrol.members)) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, phone')
          .in('id', patrol.members);

        if (error) throw error;
        setMembers(data?.map(m => ({ id: m.id, profile: m })) || []);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('حدث خطأ أثناء جلب أعضاء الدورية');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchIncidents = async () => {
    if (!patrol) return;
    setLoadingData(true);
    supabase
      .from('incidents')
      .select('*')
      .eq('assigned_patrol_id', patrol.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then((result: any) => {
        if (result.error) {
          console.error('Error fetching incidents:', result.error);
          toast.error('حدث خطأ أثناء جلب البلاغات');
        } else {
          setIncidents(result.data || []);
        }
        setLoadingData(false);
      });
  };

  const fetchNotifications = async () => {
    if (!patrol) return;
    setLoadingData(true);
    supabase
      .from('official_notifications')
      .select('*')
      .eq('context_type', 'patrol')
      .eq('context_id', patrol.id)
      .order('created_at', { ascending: false })
      .then((result: any) => {
        if (result.error) {
          console.error('Error:', result.error);
          toast.error('حدث خطأ أثناء جلب التبليغات');
        } else {
          setNotifications(result.data || []);
        }
        setLoadingData(false);
      });
  };

  const fetchActivities = async () => {
    if (!patrol) return;
    setLoadingData(true);
    try {
      const result: any = await supabase
        .from('activity_logs')
        .select('*')
        .eq('source', 'patrol')
        .order('created_at', { ascending: false })
        .limit(30);

      if (result.error) throw result.error;
      setActivities(result.data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('حدث خطأ أثناء جلب سجل النشاط');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveNote = async () => {
    if (!notes.trim()) {
      toast.error('الرجاء إدخال ملاحظة');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Log as activity instead
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'patrol_note',
          activity_description: notes,
          source: 'patrol',
          metadata: { patrol_id: patrol.id, patrol_name: patrol.patrol_name }
        });

      if (error) throw error;

      toast.success('تم حفظ الملاحظة بنجاح');
      setNotes('');
      setActiveDialog(null);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('حدث خطأ أثناء حفظ الملاحظة');
    }
  };

  const handleActionClick = (action: string) => {
    setActiveDialog(action);
    
    switch (action) {
      case 'members':
        fetchMembers();
        break;
      case 'incidents':
        fetchIncidents();
        break;
      case 'notifications':
        fetchNotifications();
        break;
      case 'activities':
        fetchActivities();
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'نشطة', variant: 'default' },
      on_duty: { label: 'في الخدمة', variant: 'default' },
      off_duty: { label: 'خارج الخدمة', variant: 'secondary' },
      inactive: { label: 'معطلة', variant: 'destructive' }
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <ProfessionalLayout title="سجل الدورية" showBackButton>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </ProfessionalLayout>
    );
  }

  if (!patrol) {
    return (
      <ProfessionalLayout title="سجل الدورية" showBackButton>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">لم يتم العثور على الدورية</p>
        </div>
      </ProfessionalLayout>
    );
  }

  return (
    <ProfessionalLayout 
      title={`دورية: ${patrol.patrol_name || 'غير محدد'}`}
      description={`رقم الدورية: ${patrol.patrol_number || 'N/A'}`}
      showBackButton
    >
      <div className="space-y-6">
        {/* Main Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>المعلومات الأساسية</span>
              {getStatusBadge(patrol.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">اسم الدورية</p>
              <p className="font-semibold">{patrol.patrol_name || 'غير محدد'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رقم الدورية</p>
              <p className="font-semibold">{patrol.patrol_number || 'غير محدد'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المنطقة</p>
              <p className="font-semibold">{patrol.assigned_area || 'غير محددة'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">نوع الدورية</p>
              <p className="font-semibold">{patrol.patrol_type || 'غير محدد'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المركبة</p>
              <p className="font-semibold">{patrol.vehicle_number || 'غير محددة'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">آخر تحديث</p>
              <p className="font-semibold">
                {patrol.updated_at ? format(new Date(patrol.updated_at), 'PPp', { locale: ar }) : 'غير متوفر'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => setShowNotificationDialog(true)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-5 w-5 text-primary" />
                إرسال تبليغ للدورية
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => handleActionClick('notifications')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-blue-600" />
                سجل التبليغات المرسلة
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => handleActionClick('incidents')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                البلاغات المُكلفة
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => handleActionClick('members')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-green-600" />
                أعضاء الدورية
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => handleActionClick('location')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5 text-red-600" />
                الموقع الحالي
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => handleActionClick('activities')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-purple-600" />
                سجل النشاط
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => handleActionClick('notes')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-gray-600" />
                إضافة ملاحظة
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Members Dialog */}
      <Dialog open={activeDialog === 'members'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>أعضاء الدورية</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {loadingData ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : members.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">لا يوجد أعضاء مسجلين</p>
            ) : (
              members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{member.profile?.full_name || 'غير محدد'}</p>
                        <p className="text-sm text-muted-foreground">الهاتف: {member.profile?.phone || 'غير متوفر'}</p>
                      </div>
                      <Badge>عضو</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Incidents Dialog */}
      <Dialog open={activeDialog === 'incidents'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>البلاغات المُكلفة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {loadingData ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : incidents.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">لا توجد بلاغات مكلفة</p>
            ) : (
              incidents.map((incident) => (
                <Card key={incident.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{incident.title}</h4>
                      <Badge>{incident.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>التاريخ: {format(new Date(incident.created_at), 'PPp', { locale: ar })}</span>
                      <span>النوع: {incident.incident_type}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications History Dialog */}
      <Dialog open={activeDialog === 'notifications'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>سجل التبليغات المرسلة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {loadingData ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">لا توجد تبليغات مرسلة</p>
            ) : (
              notifications.map((notif) => (
                <Card key={notif.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge>{notif.template_used || 'تبليغ عام'}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notif.created_at), 'PPp', { locale: ar })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{notif.notification_text}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Activities Log Dialog */}
      <Dialog open={activeDialog === 'activities'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>سجل النشاط</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {loadingData ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : activities.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">لا يوجد سجل نشاط</p>
            ) : (
              activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{activity.activity_type}</p>
                        <p className="text-xs text-muted-foreground">{activity.activity_description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(activity.created_at), 'p', { locale: ar })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={activeDialog === 'location'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>الموقع الحالي للدورية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {patrol.latitude && patrol.longitude ? (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation className="h-5 w-5 text-primary" />
                  <span className="font-semibold">إحداثيات GPS</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p>خط العرض: {patrol.latitude}</p>
                  <p>خط الطول: {patrol.longitude}</p>
                  {patrol.location_updated_at && (
                    <p className="text-muted-foreground">
                      آخر تحديث: {format(new Date(patrol.location_updated_at), 'PPp', { locale: ar })}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">لا يوجد موقع محدد</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={activeDialog === 'notes'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة ملاحظة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="اكتب ملاحظتك هنا..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <Button onClick={handleSaveNote} className="w-full">
              حفظ الملاحظة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unified Notification System */}
      <UnifiedNotificationSystem
        open={showNotificationDialog}
        onOpenChange={setShowNotificationDialog}
        recipientType="citizen"
        recipientId={patrol?.id}
        recipientName={patrol?.patrol_name}
        contextType="incident"
        contextId={patrol?.id}
      />
    </ProfessionalLayout>
  );
};

export default PatrolRecord;
