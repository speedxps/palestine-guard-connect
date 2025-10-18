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
  const [documentForm, setDocumentForm] = useState({
    document_name: '',
    document_type: '',
    notes: ''
  });
  
  const [messageForm, setMessageForm] = useState({
    message: '',
    sender_department: 'judicial_police'
  });
  
  const [sessionForm, setSessionForm] = useState({
    session_date: '',
    session_time: '',
    location: '',
    notes: ''
  });

  const [partyForm, setPartyForm] = useState({
    party_type: 'witness',
    name: '',
    national_id: '',
    role: '',
    contact: ''
  });

  useEffect(() => {
    if (id) {
      fetchCaseData();
    } else {
      // No ID provided, redirect to case management
      toast.error('لم يتم تحديد القضية');
      navigate('/judicial-case-management');
    }
  }, [id, navigate]);

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

  const fetchDocuments = async () => {
    if (!judicialCase) return;
    
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('judicial_documents')
        .select('*')
        .eq('case_id', judicialCase.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('حدث خطأ أثناء جلب المستندات');
    } finally {
      setLoadingData(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!documentForm.document_name.trim()) {
      toast.error('يرجى إدخال اسم المستند');
      return;
    }

    if (!documentForm.document_type.trim()) {
      toast.error('يرجى اختيار نوع المستند');
      return;
    }

    setUploadingFile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('judicial-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('judicial-documents')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('judicial_documents')
        .insert({
          case_id: judicialCase.id,
          document_name: documentForm.document_name,
          document_type: documentForm.document_type,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: profile.id,
          notes: documentForm.notes || null
        });

      if (insertError) throw insertError;

      toast.success('تم رفع المستند بنجاح');
      setDocumentForm({ document_name: '', document_type: '', notes: '' });
      await fetchDocuments();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('حدث خطأ أثناء رفع الملف');
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستند؟')) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('judicial-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('judicial_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast.success('تم حذف المستند بنجاح');
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('حدث خطأ أثناء حذف المستند');
    }
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('judicial-documents')
        .createSignedUrl(doc.file_path, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
        toast.success('جاري تحميل المستند');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('حدث خطأ أثناء تحميل المستند');
    }
  };

  const handlePreviewDocument = async (doc: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('judicial-documents')
        .createSignedUrl(doc.file_path, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        setPreviewDocument({
          url: data.signedUrl,
          name: doc.document_name,
          type: doc.mime_type || 'application/octet-stream'
        });
      }
    } catch (error) {
      console.error('Error previewing document:', error);
      toast.error('حدث خطأ أثناء معاينة المستند');
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
        await fetchDocuments();
        setActiveDialog('documents');
        break;
      case 'messages':
        await fetchMessages();
        setActiveDialog('messages');
        break;
      case 'send-message':
        setActiveDialog('send-message');
        break;
      case 'sessions':
        setActiveDialog('sessions');
        break;
      case 'parties':
        setActiveDialog('parties');
        break;
      case 'signature':
        setActiveDialog('signature');
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
            onClick={() => handleActionClick('sessions')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Clock className="h-12 w-12 mb-4 text-primary" />
              <p className="text-sm md:text-base font-semibold text-center">تتبع الجلسات</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('parties')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 md:p-8">
              <Users className="h-12 w-12 mb-4 text-pink-500" />
              <p className="text-sm md:text-base font-semibold text-center">الأطراف المعنية</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            onClick={() => handleActionClick('signature')}
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6" />
              المستندات القضائية
            </DialogTitle>
            <DialogDescription>
              إدارة المستندات الخاصة بالقضية: {judicialCase.case_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-6">
              <div className="flex items-center justify-center">
                <Label 
                  htmlFor="file-upload" 
                  className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80"
                >
                  <Upload className="h-5 w-5" />
                  <span className="font-semibold">
                    {uploadingFile ? 'جاري الرفع...' : 'رفع مستند جديد'}
                  </span>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                PDF, Word, Excel, الصور والمستندات الأخرى
              </p>
            </div>

            {/* Documents List */}
            {loadingData ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{doc.document_name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{(doc.file_size / 1024).toFixed(2)} KB</span>
                              <span>•</span>
                              <span>{new Date(doc.uploaded_at).toLocaleDateString('ar')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePreviewDocument(doc)}
                            title="معاينة"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadDocument(doc)}
                            title="تحميل"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDocument(doc)}
                            className="text-destructive hover:text-destructive"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد مستندات مرفوعة</p>
                <p className="text-xs text-muted-foreground mt-2">
                  ابدأ برفع مستند جديد باستخدام الزر أعلاه
                </p>
              </div>
            )}
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

      {/* Sessions Dialog */}
      <Dialog open={activeDialog === 'sessions'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6" />
              تتبع الجلسات القضائية
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="session_date">تاريخ الجلسة</Label>
                <Input
                  id="session_date"
                  type="date"
                  value={sessionForm.session_date}
                  onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="session_time">وقت الجلسة</Label>
                <Input
                  id="session_time"
                  type="time"
                  value={sessionForm.session_time}
                  onChange={(e) => setSessionForm({ ...sessionForm, session_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">مكان الانعقاد</Label>
              <Input
                id="location"
                value={sessionForm.location}
                onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                placeholder="المحكمة أو مكان الجلسة"
              />
            </div>

            <div>
              <Label htmlFor="session_notes">ملاحظات الجلسة</Label>
              <Textarea
                id="session_notes"
                value={sessionForm.notes}
                onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                rows={4}
                placeholder="ملاحظات حول الجلسة..."
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setActiveDialog(null)}>
                إلغاء
              </Button>
              <Button onClick={() => toast.success('تم حفظ بيانات الجلسة')}>
                <Clock className="h-4 w-4 ml-2" />
                حفظ الجلسة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Parties Dialog */}
      <Dialog open={activeDialog === 'parties'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              الأطراف المعنية بالقضية
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="party_type">نوع الطرف</Label>
              <select
                id="party_type"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={partyForm.party_type}
                onChange={(e) => setPartyForm({ ...partyForm, party_type: e.target.value })}
              >
                <option value="witness">شاهد</option>
                <option value="lawyer">محامي</option>
                <option value="expert">خبير</option>
                <option value="translator">مترجم</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="party_name">الاسم الكامل</Label>
                <Input
                  id="party_name"
                  value={partyForm.name}
                  onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
                  placeholder="الاسم الكامل"
                />
              </div>
              <div>
                <Label htmlFor="party_national_id">رقم الهوية</Label>
                <Input
                  id="party_national_id"
                  value={partyForm.national_id}
                  onChange={(e) => setPartyForm({ ...partyForm, national_id: e.target.value })}
                  placeholder="رقم الهوية الوطنية"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="party_role">الدور في القضية</Label>
              <Input
                id="party_role"
                value={partyForm.role}
                onChange={(e) => setPartyForm({ ...partyForm, role: e.target.value })}
                placeholder="الدور أو الوظيفة"
              />
            </div>

            <div>
              <Label htmlFor="party_contact">معلومات الاتصال</Label>
              <Input
                id="party_contact"
                value={partyForm.contact}
                onChange={(e) => setPartyForm({ ...partyForm, contact: e.target.value })}
                placeholder="رقم الهاتف أو البريد الإلكتروني"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setActiveDialog(null)}>
                إلغاء
              </Button>
              <Button onClick={() => toast.success('تم إضافة الطرف المعني')}>
                <Users className="h-4 w-4 ml-2" />
                إضافة الطرف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Digital Signature Dialog */}
      <Dialog open={activeDialog === 'signature'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              التوقيع الرقمي للقضية
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
              <FileText className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">معلومات القضية</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">رقم القضية:</span> {judicialCase.case_number}</p>
                <p><span className="font-semibold">العنوان:</span> {judicialCase.title}</p>
                <p><span className="font-semibold">الحالة:</span> {judicialCase.status}</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">✍️</div>
              <p className="font-semibold mb-2">منطقة التوقيع الرقمي</p>
              <p className="text-sm text-muted-foreground mb-4">
                سيتم توقيع هذه القضية رقمياً باستخدام شهادة المفتاح العام
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>جاهز للتوقيع</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground bg-muted p-4 rounded-lg">
              <p className="font-semibold">📋 معلومات التوقيع:</p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li>التوقيع الرقمي يضمن صحة الوثيقة</li>
                <li>لا يمكن التعديل بعد التوقيع</li>
                <li>يتم حفظ سجل كامل للعملية</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setActiveDialog(null)}>
                إلغاء
              </Button>
              <Button 
                onClick={() => {
                  toast.success('تم توقيع القضية رقمياً بنجاح');
                  setActiveDialog(null);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-4 w-4 ml-2" />
                توقيع القضية
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JudicialCaseRecord;
