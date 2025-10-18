import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Scale, FileText, Mail, Clock, Users, 
  FolderOpen, Send, MessageSquare, Phone, Plus,
  Upload, Download, Trash2, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { useUserRoles } from '@/hooks/useUserRoles';

const JudicialCaseRecord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [judicialCase, setJudicialCase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const { hasRole } = useUserRoles();
  
  const [transfers, setTransfers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{url: string; name: string; type: string} | null>(null);
  
  const [messageForm, setMessageForm] = useState({
    message: '',
    sender_department: 'judicial_police'
  });

  useEffect(() => {
    if (id) {
      fetchCaseData();
    }
  }, [id]);

  const fetchCaseData = async () => {
    try {
      const { data, error } = await supabase
        .from('judicial_cases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('لم يتم العثور على القضية');
        navigate('/judicial-case-management');
        return;
      }

      setJudicialCase(data);
    } catch (error) {
      console.error('Error fetching case:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransfers = async () => {
    if (!judicialCase) return;
    
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('judicial_transfers')
        .select('*')
        .eq('case_id', judicialCase.id)
        .order('transferred_at', { ascending: false });

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('حدث خطأ أثناء جلب سجل النقل');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchMessages = async () => {
    if (!judicialCase) return;
    
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('judicial_messages')
        .select('*')
        .eq('case_id', judicialCase.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('حدث خطأ أثناء جلب الرسائل');
    } finally {
      setLoadingData(false);
    }
  };

  const handleActionClick = async (action: string) => {
    switch (action) {
      case 'details':
        setActiveDialog('details');
        break;
      case 'transfers':
        await fetchTransfers();
        setActiveDialog('transfers');
        break;
      case 'documents':
        setActiveDialog('documents');
        break;
      case 'messages':
        await fetchMessages();
        setActiveDialog('messages');
        break;
      case 'send-message':
        setActiveDialog('send-message');
        break;
      default:
        toast.info(`قريباً: ${action}`);
    }
  };

  const handleSendMessage = async () => {
    try {
      if (!messageForm.message.trim()) {
        toast.error('يرجى إدخال نص الرسالة');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { error } = await supabase
        .from('judicial_messages')
        .insert({
          case_id: judicialCase.id,
          sender_id: profile?.id,
          sender_department: messageForm.sender_department,
          message: messageForm.message
        });

      if (error) throw error;

      toast.success('تم إرسال الرسالة بنجاح');
      setActiveDialog(null);
      setMessageForm({ message: '', sender_department: 'judicial_police' });
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('حدث خطأ أثناء إرسال الرسالة');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: any = {
      open: 'bg-blue-500',
      under_investigation: 'bg-yellow-500',
      sent_to_court: 'bg-purple-500',
      sent_to_prosecution: 'bg-orange-500',
      closed: 'bg-gray-500'
    };

    const statusLabels: any = {
      open: 'مفتوحة',
      under_investigation: 'قيد التحقيق',
      sent_to_court: 'محالة للمحكمة',
      sent_to_prosecution: 'محالة للنيابة',
      closed: 'مغلقة'
    };

    return (
      <Badge className={statusColors[status]}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!judicialCase) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <BackButton to="/judicial-case-management" />
            
            <h1 className="text-xl md:text-2xl font-bold text-primary flex-1 text-center">
              القضية: {judicialCase.case_number}
            </h1>

            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="pb-3">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">رقم القضية</span>
                <span className="font-semibold text-primary text-lg">{judicialCase.case_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">عنوان القضية</span>
                <span className="font-semibold">{judicialCase.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">نوع القضية</span>
                <span className="font-semibold">{judicialCase.case_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الحالة</span>
                {getStatusBadge(judicialCase.status)}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Subtitle */}
        <div className="text-center mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-primary">
            ⚖️ تفاصيل القضية القضائية
          </h2>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('details')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Scale className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm md:text-base font-semibold text-center">تفاصيل القضية</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('transfers')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Send className="h-12 w-12 mb-4 text-purple-500" />
              <p className="text-sm md:text-base font-semibold text-center">سجل النقل</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('documents')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <FolderOpen className="h-12 w-12 mb-4 text-orange-500" />
              <p className="text-sm md:text-base font-semibold text-center">المستندات</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('messages')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <MessageSquare className="h-12 w-12 mb-4 text-blue-500" />
              <p className="text-sm md:text-base font-semibold text-center">الرسائل</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('send-message')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Mail className="h-12 w-12 mb-4 text-green-500" />
              <p className="text-sm md:text-base font-semibold text-center">إرسال رسالة</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => toast.info('قريباً: تتبع الجلسات')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Clock className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm md:text-base font-semibold text-center">تتبع الجلسات</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => toast.info('قريباً: الأطراف المعنية')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Users className="h-12 w-12 mb-4 text-pink-500" />
              <p className="text-sm md:text-base font-semibold text-center">الأطراف المعنية</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => toast.info('قريباً: التوقيع الرقمي')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <FileText className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm md:text-base font-semibold text-center">التوقيع الرقمي</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={activeDialog === 'details'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-6 w-6" />
              تفاصيل القضية
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">رقم القضية</p>
                <p className="font-semibold">{judicialCase.case_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نوع القضية</p>
                <p className="font-semibold">{judicialCase.case_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المدعي</p>
                <p className="font-semibold">{judicialCase.parties?.plaintiff || 'غير محدد'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المدعى عليه</p>
                <p className="font-semibold">{judicialCase.parties?.defendant || 'غير محدد'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">الوصف</p>
                <p className="font-semibold">{judicialCase.description}</p>
              </div>
              {judicialCase.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">ملاحظات</p>
                  <p className="font-semibold">{judicialCase.notes}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfers Dialog */}
      <Dialog open={activeDialog === 'transfers'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-6 w-6" />
              سجل النقل
            </DialogTitle>
            <DialogDescription>
              سجل عمليات نقل القضية: {judicialCase.case_number}
            </DialogDescription>
          </DialogHeader>
          
          {loadingData ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : transfers.length > 0 ? (
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <Card key={transfer.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{transfer.transfer_type}</span>
                        <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'}>
                          {transfer.status === 'completed' ? 'مكتمل' : transfer.status === 'pending' ? 'قيد الانتظار' : 'مرفوض'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">من: </span>
                          <span>{transfer.from_department}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">إلى: </span>
                          <span>{transfer.to_department}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">التاريخ: </span>
                          <span>{new Date(transfer.transferred_at).toLocaleDateString('ar')}</span>
                        </div>
                      </div>
                      {transfer.message && (
                        <p className="text-sm text-muted-foreground mt-2">
                          📝 {transfer.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد عمليات نقل مسجلة
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={activeDialog === 'documents'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6" />
              المستندات القضائية
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-8">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              قريباً: إدارة المستندات القضائية
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Messages Dialog */}
      <Dialog open={activeDialog === 'messages'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              الرسائل
            </DialogTitle>
            <DialogDescription>
              الرسائل المتعلقة بالقضية: {judicialCase.case_number}
            </DialogDescription>
          </DialogHeader>
          
          {loadingData ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card key={message.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{message.sender_department}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(message.created_at).toLocaleDateString('ar')}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد رسائل
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={activeDialog === 'send-message'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6" />
              إرسال رسالة
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">نص الرسالة</Label>
              <Textarea
                id="message"
                placeholder="اكتب رسالتك هنا..."
                value={messageForm.message}
                onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                rows={5}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setActiveDialog(null)}>
                إلغاء
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4 ml-2" />
                إرسال
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Document Dialog */}
      {previewDocument && (
        <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>معاينة: {previewDocument.name}</DialogTitle>
            </DialogHeader>
            <div className="w-full h-[70vh] overflow-auto">
              {previewDocument.type.startsWith('image/') ? (
                <img src={previewDocument.url} alt={previewDocument.name} className="w-full h-auto" />
              ) : previewDocument.type === 'application/pdf' ? (
                <iframe src={previewDocument.url} className="w-full h-full" title={previewDocument.name} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا يمكن معاينة هذا النوع من الملفات
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default JudicialCaseRecord;
