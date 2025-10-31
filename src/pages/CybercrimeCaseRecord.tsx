import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, Shield, AlertTriangle, MessageSquare, 
  FileUp, History, XCircle, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';
import { UnifiedNotificationSystem } from '@/components/notifications/UnifiedNotificationSystem';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const CybercrimeCaseRecord = () => {
  const { id } = useParams();
  const [cyberCase, setCyberCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCaseData();
    }
  }, [id]);

  const fetchCaseData = async () => {
    try {
      const { data: caseData, error } = await supabase
        .from('cybercrime_cases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!caseData) {
        toast.error('لم يتم العثور على القضية');
        return;
      }

      setCyberCase(caseData);
      setNewStatus(caseData.status);
    } catch (error) {
      console.error('Error fetching case:', error);
      toast.error('حدث خطأ أثناء جلب بيانات القضية');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    if (!cyberCase) return;
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('cybercrime_evidence')
        .select('*')
        .eq('case_id', cyberCase.id)
        .order('collected_at', { ascending: false });

      if (error) throw error;
      setEvidence(data || []);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      toast.error('حدث خطأ أثناء جلب الأدلة');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchComments = async () => {
    if (!cyberCase) return;
    setLoadingData(true);
    supabase
      .from('cybercrime_comments')
      .select('*')
      .eq('report_id', cyberCase.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setComments(data || []);
        setLoadingData(false);
      });
  };

  const fetchNotifications = async () => {
    if (!cyberCase) return;
    setLoadingData(true);
    supabase
      .from('official_notifications')
      .select('*')
      .eq('context_type', 'cybercrime_case')
      .eq('context_id', cyberCase.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setNotifications(data || []);
        setLoadingData(false);
      });
  };

  const fetchInvestigations = async () => {
    if (!cyberCase) return;
    setLoadingData(true);
    try {
      const result: any = await supabase
        .from('activity_logs')
        .select('*')
        .eq('source', 'cybercrime')
        .order('created_at', { ascending: false });

      if (result.error) throw result.error;
      setInvestigations(result.data || []);
    } catch (error) {
      console.error('Error fetching investigations:', error);
      toast.error('حدث خطأ أثناء جلب سجل التحقيقات');
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('الرجاء اختيار حالة');
      return;
    }

    try {
      const { error } = await supabase
        .from('cybercrime_cases')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', cyberCase.id);

      if (error) throw error;

      toast.success('تم تحديث حالة القضية بنجاح');
      setActiveDialog(null);
      await fetchCaseData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('حدث خطأ أثناء تحديث الحالة');
    }
  };

  const handleCloseCase = async () => {
    if (!closureReason.trim()) {
      toast.error('الرجاء إدخال سبب الإغلاق');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error: updateError } = await supabase
        .from('cybercrime_cases')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', cyberCase.id);

      if (updateError) throw updateError;

      // Log closure as activity
      const { error: activityError } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'case_closure',
          activity_description: `تم إغلاق القضية: ${closureReason}`,
          source: 'cybercrime',
          metadata: { case_id: cyberCase.id, case_number: cyberCase.case_number }
        });

      if (activityError) throw activityError;

      toast.success('تم إغلاق القضية بنجاح');
      setClosureReason('');
      setActiveDialog(null);
      await fetchCaseData();
    } catch (error) {
      console.error('Error closing case:', error);
      toast.error('حدث خطأ أثناء إغلاق القضية');
    }
  };

  const handleActionClick = (action: string) => {
    setActiveDialog(action);
    
    switch (action) {
      case 'evidence':
        fetchEvidence();
        break;
      case 'comments':
        fetchComments();
        break;
      case 'notifications':
        fetchNotifications();
        break;
      case 'investigations':
        fetchInvestigations();
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      open: { label: 'مفتوحة', variant: 'default' },
      under_investigation: { label: 'قيد التحقيق', variant: 'secondary' },
      pending: { label: 'معلقة', variant: 'outline' },
      closed: { label: 'مغلقة', variant: 'destructive' },
      resolved: { label: 'محلولة', variant: 'default' }
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; className: string }> = {
      high: { label: 'عالية', className: 'bg-red-100 text-red-800' },
      medium: { label: 'متوسطة', className: 'bg-yellow-100 text-yellow-800' },
      low: { label: 'منخفضة', className: 'bg-green-100 text-green-800' }
    };

    const config = priorityConfig[priority] || { label: priority, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <ProfessionalLayout title="سجل القضية الإلكترونية" showBackButton>
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

  if (!cyberCase) {
    return (
      <ProfessionalLayout title="سجل القضية الإلكترونية" showBackButton>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">لم يتم العثور على القضية</p>
        </div>
      </ProfessionalLayout>
    );
  }

  return (
    <ProfessionalLayout 
      title={`قضية: ${cyberCase.title}`}
      description={`رقم القضية: ${cyberCase.case_number}`}
      showBackButton
    >
      <div className="space-y-6">
        {/* Main Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span>المعلومات الأساسية</span>
              <div className="flex gap-2">
                {getStatusBadge(cyberCase.status)}
                {getPriorityBadge(cyberCase.priority)}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">رقم القضية</p>
              <p className="font-semibold">{cyberCase.case_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">نوع الجريمة</p>
              <p className="font-semibold">{cyberCase.case_type || 'غير محدد'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المُبلغ</p>
              <p className="font-semibold">{cyberCase.contact_name || 'غير محدد'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رقم الهوية</p>
              <p className="font-semibold">{cyberCase.national_id || 'غير متوفر'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رقم الهاتف</p>
              <p className="font-semibold">{cyberCase.contact_phone || 'غير متوفر'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الضابط المكلف</p>
              <p className="font-semibold">{cyberCase.assigned_officer_id || 'غير مكلف'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">الوصف</p>
              <p className="text-sm">{cyberCase.description}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
              <p className="font-semibold">
                {format(new Date(cyberCase.created_at), 'PPp', { locale: ar })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">آخر تحديث</p>
              <p className="font-semibold">
                {format(new Date(cyberCase.updated_at), 'PPp', { locale: ar })}
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
                إرسال تبليغ
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
                سجل التبليغات
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => handleActionClick('evidence')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-green-600" />
                الأدلة الرقمية
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => handleActionClick('status')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileUp className="h-5 w-5 text-orange-600" />
                تحديث الحالة
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => handleActionClick('investigations')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-5 w-5 text-purple-600" />
                سجل التحقيقات
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            onClick={() => handleActionClick('close')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <XCircle className="h-5 w-5 text-red-600" />
                إغلاق القضية
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Evidence Dialog */}
      <Dialog open={activeDialog === 'evidence'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>الأدلة الرقمية</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {loadingData ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : evidence.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">لا توجد أدلة مسجلة</p>
            ) : (
              evidence.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{item.evidence_type}</h4>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.collected_at), 'PPp', { locale: ar })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={activeDialog === 'comments'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>التعليقات والملاحظات</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {loadingData ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">لا توجد تعليقات</p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">مستخدم</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'PPp', { locale: ar })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
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
            <DialogTitle>سجل التبليغات</DialogTitle>
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

      {/* Investigations Log Dialog */}
      <Dialog open={activeDialog === 'investigations'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>سجل التحقيقات</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {loadingData ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : investigations.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">لا يوجد سجل تحقيقات</p>
            ) : (
              investigations.map((inv) => (
                <Card key={inv.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">{inv.activity_type}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(inv.created_at), 'PPp', { locale: ar })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{inv.activity_description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={activeDialog === 'status'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحديث حالة القضية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">مفتوحة</SelectItem>
                <SelectItem value="under_investigation">قيد التحقيق</SelectItem>
                <SelectItem value="pending">معلقة</SelectItem>
                <SelectItem value="resolved">محلولة</SelectItem>
                <SelectItem value="closed">مغلقة</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleUpdateStatus} className="w-full">
              <CheckCircle className="ml-2 h-4 w-4" />
              تحديث الحالة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Case Dialog */}
      <Dialog open={activeDialog === 'close'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إغلاق القضية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="اكتب سبب إغلاق القضية..."
              value={closureReason}
              onChange={(e) => setClosureReason(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <Button onClick={handleCloseCase} variant="destructive" className="w-full">
              <XCircle className="ml-2 h-4 w-4" />
              إغلاق القضية نهائياً
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unified Notification System */}
      <UnifiedNotificationSystem
        open={showNotificationDialog}
        onOpenChange={setShowNotificationDialog}
        recipientType="citizen"
        recipientId={cyberCase?.national_id}
        recipientName={cyberCase?.contact_name}
        contextType="cybercrime"
        contextId={cyberCase?.id}
      />
    </ProfessionalLayout>
  );
};

export default CybercrimeCaseRecord;
