import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BackButton } from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';

interface ClosureRequest {
  id: string;
  citizen_id: string;
  reason: string;
  requested_at: string;
  requested_by: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  requester: { full_name: string } | null;
  reviewer: { full_name: string } | null;
  citizen: { full_name: string; national_id: string } | null;
}

const InvestigationClosureManagement = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ClosureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ClosureRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchClosureRequests();
  }, []);

  const fetchClosureRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('investigation_closure_requests')
        .select(`
          *,
          requester:profiles!investigation_closure_requests_requested_by_fkey(full_name),
          reviewer:profiles!investigation_closure_requests_reviewed_by_fkey(full_name),
          citizen:citizens(full_name, national_id)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching closure requests:', error);
      toast.error('حدث خطأ أثناء جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (approve: boolean) => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // تحديث حالة الطلب
      const { error: updateError } = await supabase
        .from('investigation_closure_requests')
        .update({
          status: approve ? 'approved' : 'rejected',
          reviewed_by: profile.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', selectedRequest.id);

      if (updateError) {
        console.error('Error updating closure request:', updateError);
        throw updateError;
      }

      // إذا تمت الموافقة، نضيف ملاحظة في سجل التحقيق
      if (approve) {
        const closureNote = `✅ تم إغلاق التحقيق بناءً على طلب ${selectedRequest.requester?.full_name || 'المحقق'}\n\nالسبب: ${selectedRequest.reason}\n\nتمت الموافقة من قبل: ${profile.full_name}\nالتاريخ: ${new Date().toLocaleDateString('ar')}\n${adminNotes ? `\nملاحظات الإدارة: ${adminNotes}` : ''}`;
        
        const { error: noteError } = await supabase
          .from('investigation_notes')
          .insert({
            citizen_id: selectedRequest.citizen_id,
            created_by: profile.id,
            note_text: closureNote
          });

        if (noteError) {
          console.error('Error adding closure note:', noteError);
        }
      }

      // إرسال إشعار للمحقق الذي طلب الإغلاق
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          sender_id: profile.id,
          title: approve ? 'تمت الموافقة على إغلاق التحقيق' : 'تم رفض طلب إغلاق التحقيق',
          message: `تم ${approve ? 'الموافقة على' : 'رفض'} طلب إغلاق التحقيق للمشتبه: ${selectedRequest.citizen?.full_name}${adminNotes ? `\n\nملاحظات الإدارة: ${adminNotes}` : ''}`,
          priority: 'high',
          is_system_wide: false,
          target_departments: ['cid'],
          action_url: `/department/cid/suspect-record/${selectedRequest.citizen_id}`
        });

      if (notificationError) {
        console.error('Error sending notification:', notificationError);
      }

      toast.success(`تم ${approve ? 'الموافقة على' : 'رفض'} الطلب بنجاح`);
      setSelectedRequest(null);
      setAdminNotes('');
      await fetchClosureRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error('حدث خطأ أثناء معالجة الطلب');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">تمت الموافقة</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      case 'pending':
        return <Badge variant="secondary">قيد المراجعة</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold text-primary">إدارة طلبات إغلاق التحقيقات</h1>
              <p className="text-sm text-muted-foreground">مراجعة والموافقة على طلبات إغلاق التحقيقات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">قيد المراجعة</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">تمت الموافقة</p>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">مرفوض</p>
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد طلبات إغلاق تحقيقات</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">
                        طلب إغلاق تحقيق: {request.citizen?.full_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        رقم الهوية: {request.citizen?.national_id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        مقدم الطلب: {request.requester?.full_name || 'غير معروف'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        تاريخ الطلب: {new Date(request.requested_at).toLocaleDateString('ar', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">سبب الإغلاق:</p>
                    <p className="text-sm text-muted-foreground">{request.reason}</p>
                  </div>

                  {request.reviewed_by && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold mb-1">المراجعة:</p>
                      <p className="text-sm text-muted-foreground">
                        تمت المراجعة من: {request.reviewer?.full_name || 'المدير'}
                      </p>
                      {request.admin_notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          ملاحظات: {request.admin_notes}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        بتاريخ: {new Date(request.reviewed_at!).toLocaleDateString('ar')}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/department/cid/suspect-record/${request.citizen_id}`)}
                    >
                      <FileText className="h-4 w-4 ml-2" />
                      عرض ملف المشتبه
                    </Button>
                    {request.status === 'pending' && (
                      <Button
                        className="flex-1"
                        onClick={() => setSelectedRequest(request)}
                      >
                        مراجعة الطلب
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>مراجعة طلب إغلاق التحقيق</DialogTitle>
            <DialogDescription>
              يرجى مراجعة الطلب واتخاذ القرار المناسب
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-semibold">المشتبه: {selectedRequest.citizen?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  رقم الهوية: {selectedRequest.citizen?.national_id}
                </p>
                <p className="text-sm text-muted-foreground">
                  مقدم الطلب: {selectedRequest.requester?.full_name}
                </p>
              </div>

              <div>
                <p className="font-semibold mb-2">سبب الإغلاق:</p>
                <p className="text-sm">{selectedRequest.reason}</p>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">ملاحظات الإدارة (اختياري):</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="أضف ملاحظاتك هنا..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedRequest(null)}
                  disabled={processing}
                >
                  إلغاء
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleApproveReject(false)}
                  disabled={processing}
                >
                  <XCircle className="h-4 w-4 ml-2" />
                  رفض الطلب
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApproveReject(true)}
                  disabled={processing}
                >
                  <CheckCircle className="h-4 w-4 ml-2" />
                  الموافقة على الإغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestigationClosureManagement;
