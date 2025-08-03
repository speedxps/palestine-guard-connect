import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, XCircle, User, Mail, MessageSquare } from 'lucide-react';

interface PasswordResetRequest {
  id: string;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export const PasswordResetManagement = () => {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('password_resets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as PasswordResetRequest[]);
    } catch (error) {
      console.error('Error fetching password reset requests:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل طلبات إعادة تعيين كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('password_resets')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: `تم ${status === 'approved' ? 'موافقة' : 'رفض'} الطلب بنجاح`,
      });

      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (error: any) {
      console.error('Error updating password reset request:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث الطلب",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-warning"><Clock className="h-3 w-3 mr-1" />في الانتظار</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-success"><CheckCircle className="h-3 w-3 mr-1" />موافق عليه</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-arabic">طلبات إعادة تعيين كلمة المرور</h2>
        <Badge variant="outline">
          {requests.filter(r => r.status === 'pending').length} طلب في الانتظار
        </Badge>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{request.requested_by}</span>
                  {getStatusBadge(request.status)}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{request.email}</span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <strong>السبب:</strong> {request.reason}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  تم الطلب في: {formatDate(request.created_at)}
                </div>
                
                {request.admin_notes && (
                  <div className="text-sm p-2 bg-muted rounded border-l-4 border-primary">
                    <strong>ملاحظات الإدارة:</strong> {request.admin_notes}
                  </div>
                )}
              </div>
              
              {request.status === 'pending' && (
                <Dialog open={selectedRequest?.id === request.id} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      معالجة
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>معالجة طلب إعادة تعيين كلمة المرور</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p><strong>مقدم الطلب:</strong> {request.requested_by}</p>
                        <p><strong>البريد الإلكتروني:</strong> {request.email}</p>
                        <p><strong>السبب:</strong> {request.reason}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ملاحظات الإدارة (اختياري)</label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="أضف ملاحظات أو تعليمات للمستخدم..."
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="destructive"
                          onClick={() => handleUpdateRequest(request.id, 'rejected')}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          رفض الطلب
                        </Button>
                        <Button
                          variant="default"
                          onClick={() => handleUpdateRequest(request.id, 'approved')}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          موافقة
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </Card>
        ))}
        
        {requests.length === 0 && (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد طلبات إعادة تعيين كلمة المرور</p>
          </Card>
        )}
      </div>
    </div>
  );
};