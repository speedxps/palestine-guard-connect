import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  Download, 
  Eye,
  User,
  Phone,
  IdCard,
  MapPin,
  Calendar,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  MessageSquare,
  File,
  Loader2
} from 'lucide-react';

interface CaseDetail {
  id: string;
  case_number: string;
  title: string;
  description: string;
  case_type: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  contact_phone?: string;
  contact_name?: string;
  national_id?: string;
  reporter_id: string;
  assigned_officer_id?: string;
}

interface CaseFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: string;
}

interface CitizenInfo {
  id: string;
  national_id: string;
  full_name: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
}

const CybercrimeAdvancedCaseDetail = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('caseId');
  
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [searchNationalId, setSearchNationalId] = useState('');
  const [citizenInfo, setCitizenInfo] = useState<CitizenInfo | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (caseId) {
      fetchCaseDetail();
      fetchCaseFiles();
    }
  }, [caseId]);

  const fetchCaseDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('cybercrime_cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error) throw error;
      setCaseDetail(data);
    } catch (error) {
      console.error('Error fetching case:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل تفاصيل القضية',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('cybercrime_case_files')
        .select('*')
        .eq('case_id', caseId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setCaseFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const searchCitizen = async () => {
    if (!searchNationalId) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال رقم الهوية',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSearching(true);
      const { data, error } = await supabase
        .from('citizens')
        .select('id, national_id, full_name, phone, address, date_of_birth')
        .eq('national_id', searchNationalId)
        .single();

      if (error) throw error;

      if (data) {
        setCitizenInfo(data);
        // تحديث القضية بمعلومات المواطن
        await supabase
          .from('cybercrime_cases')
          .update({
            contact_name: data.full_name,
            contact_phone: data.phone,
            national_id: data.national_id,
          })
          .eq('id', caseId);

        await fetchCaseDetail();
        
        toast({
          title: 'نجح',
          description: 'تم استيراد معلومات المواطن بنجاح',
        });
      }
    } catch (error) {
      console.error('Error searching citizen:', error);
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على المواطن',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    
    try {
      setUploadingFile(true);

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Upload to storage
      const filePath = `${caseId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('cybercrime-case-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Record in database
      const { error: dbError } = await supabase
        .from('cybercrime_case_files')
        .insert({
          case_id: caseId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: profile.id,
        });

      if (dbError) throw dbError;

      toast({
        title: 'نجح',
        description: 'تم رفع الملف بنجاح',
      });

      await fetchCaseFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في رفع الملف',
        variant: 'destructive',
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const downloadFile = async (file: CaseFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('cybercrime-case-files')
        .download(file.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الملف',
        variant: 'destructive',
      });
    }
  };

  const viewFile = async (file: CaseFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('cybercrime-case-files')
        .createSignedUrl(file.file_path, 60);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في عرض الملف',
        variant: 'destructive',
      });
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('cybercrime_cases')
        .update({ status: newStatus })
        .eq('id', caseId);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم تحديث حالة القضية',
      });

      await fetchCaseDetail();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الحالة',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'open': 'bg-red-500 text-white',
      'investigating': 'bg-blue-500 text-white',
      'resolved': 'bg-green-500 text-white',
      'closed': 'bg-gray-500 text-white'
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'critical': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold">القضية غير موجودة</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            العودة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-blue-200/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-arabic">
                  تفاصيل القضية: {caseDetail.case_number}
                </h1>
                <p className="text-sm text-gray-600">{caseDetail.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(caseDetail.status)}>
                {caseDetail.status === 'open' ? 'مفتوحة' : 
                 caseDetail.status === 'investigating' ? 'قيد التحقيق' :
                 caseDetail.status === 'resolved' ? 'محلولة' : 'مغلقة'}
              </Badge>
              <Badge className={getPriorityColor(caseDetail.priority)}>
                {caseDetail.priority === 'critical' ? 'عالية جداً' :
                 caseDetail.priority === 'high' ? 'عالية' :
                 caseDetail.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  تفاصيل القضية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>الوصف</Label>
                  <p className="text-sm text-gray-700 mt-1">{caseDetail.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>نوع القضية</Label>
                    <p className="text-sm text-gray-700 mt-1">{caseDetail.case_type}</p>
                  </div>
                  <div>
                    <Label>تاريخ الإنشاء</Label>
                    <p className="text-sm text-gray-700 mt-1">
                      {new Date(caseDetail.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
                <div>
                  <Label>تحديث الحالة</Label>
                  <Select value={caseDetail.status} onValueChange={updateStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">مفتوحة</SelectItem>
                      <SelectItem value="investigating">قيد التحقيق</SelectItem>
                      <SelectItem value="resolved">محلولة</SelectItem>
                      <SelectItem value="closed">مغلقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Files Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <File className="h-5 w-5" />
                    الملفات والأدلة ({caseFiles.length})
                  </CardTitle>
                  <div>
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload-detail"
                      disabled={uploadingFile}
                    />
                    <Button 
                      size="sm" 
                      asChild
                      disabled={uploadingFile}
                    >
                      <label htmlFor="file-upload-detail" className="cursor-pointer">
                        {uploadingFile ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> جاري الرفع...</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" /> رفع ملف</>
                        )}
                      </label>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {caseFiles.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">لا توجد ملفات</p>
                  ) : (
                    caseFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <File className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.file_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  معلومات التواصل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>البحث برقم الهوية</Label>
                  <div className="flex gap-2">
                    <Input
                      value={searchNationalId}
                      onChange={(e) => setSearchNationalId(e.target.value)}
                      placeholder="رقم الهوية"
                    />
                    <Button 
                      onClick={searchCitizen}
                      disabled={searching}
                    >
                      {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {(caseDetail.contact_name || citizenInfo) && (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">الاسم</p>
                        <p className="text-sm font-medium">{caseDetail.contact_name || citizenInfo?.full_name}</p>
                      </div>
                    </div>
                    {(caseDetail.contact_phone || citizenInfo?.phone) && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">الهاتف</p>
                          <p className="text-sm font-medium">{caseDetail.contact_phone || citizenInfo?.phone}</p>
                        </div>
                      </div>
                    )}
                    {(caseDetail.national_id || citizenInfo?.national_id) && (
                      <div className="flex items-center gap-2">
                        <IdCard className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">رقم الهوية</p>
                          <p className="text-sm font-medium">{caseDetail.national_id || citizenInfo?.national_id}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  الجدول الزمني
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">تم الإنشاء</p>
                      <p className="text-xs text-gray-500">
                        {new Date(caseDetail.created_at).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  </div>
                  {caseDetail.updated_at !== caseDetail.created_at && (
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-green-100 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">آخر تحديث</p>
                        <p className="text-xs text-gray-500">
                          {new Date(caseDetail.updated_at).toLocaleString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CybercrimeAdvancedCaseDetail;
