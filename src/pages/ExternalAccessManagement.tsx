import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Upload, Download, Trash2, FileDown, CheckCircle, AlertCircle } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { Switch } from '@/components/ui/switch';

interface ExternalAccessFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  version: string;
  description: string;
  is_active: boolean;
  uploaded_at: string;
}

const ExternalAccessManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [files, setFiles] = useState<ExternalAccessFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('external_access_files')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل قائمة الملفات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !version) {
      toast({
        title: 'تنبيه',
        description: 'يرجى اختيار ملف وإدخال رقم الإصدار',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      // رفع الملف إلى storage
      const fileName = `v${version}-${Date.now()}-${selectedFile.name}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('external-access-apps')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // الحصول على profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // إضافة المعلومات إلى قاعدة البيانات
      const { error: dbError } = await supabase
        .from('external_access_files')
        .insert({
          file_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          version: version,
          description: description,
          uploaded_by: profile.id,
        });

      if (dbError) throw dbError;

      toast({
        title: '✅ تم الرفع بنجاح',
        description: 'تم رفع الملف وإضافته إلى النظام',
      });

      // إعادة تعيين النموذج
      setSelectedFile(null);
      setVersion('');
      setDescription('');
      
      // تحديث القائمة
      fetchFiles();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل رفع الملف',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (fileId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('external_access_files')
        .update({ is_active: !currentStatus })
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: 'تم التحديث',
        description: `تم ${!currentStatus ? 'تفعيل' : 'إيقاف'} الملف`,
      });

      fetchFiles();
    } catch (error) {
      console.error('Error toggling file status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحديث حالة الملف',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (fileId: string, filePath: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;

    try {
      // حذف من storage
      const { error: storageError } = await supabase.storage
        .from('external-access-apps')
        .remove([filePath]);

      if (storageError) throw storageError;

      // حذف من قاعدة البيانات
      const { error: dbError } = await supabase
        .from('external_access_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الملف بنجاح',
      });

      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حذف الملف',
        variant: 'destructive',
      });
    }
  };

  const getDownloadUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('external-access-apps')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة تطبيق الوصول الخارجي</h1>
            <p className="text-gray-600 mt-2">رفع وإدارة ملف تطبيق الإداريين خارج فلسطين</p>
          </div>
          <BackButton />
        </div>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              رفع ملف جديد
            </CardTitle>
            <CardDescription>
              قم برفع ملف التطبيق الخاص بتسجيل الدخول من خارج فلسطين
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="file">اختيار الملف</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".apk,.exe,.dmg,.zip"
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600">
                    الملف المختار: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">رقم الإصدار *</Label>
                <Input
                  id="version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="مثال: 1.0.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف التطبيق والتحديثات..."
                rows={3}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !version || uploading}
              className="w-full"
            >
              {uploading ? (
                <>جاري الرفع...</>
              ) : (
                <>
                  <Upload className="ml-2 h-4 w-4" />
                  رفع الملف
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Files List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              الملفات المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                لا توجد ملفات مرفوعة حتى الآن
              </div>
            ) : (
              <div className="space-y-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`border rounded-lg p-4 ${
                      file.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {file.is_active ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-gray-400" />
                          )}
                          <h3 className="font-semibold text-lg">{file.file_name}</h3>
                          <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            v{file.version}
                          </span>
                        </div>
                        
                        {file.description && (
                          <p className="text-gray-600 text-sm mb-2">{file.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>الحجم: {formatFileSize(file.file_size)}</span>
                          <span>•</span>
                          <span>
                            تم الرفع: {new Date(file.uploaded_at).toLocaleDateString('ar-PS')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${file.id}`} className="text-sm">
                            {file.is_active ? 'مفعل' : 'معطل'}
                          </Label>
                          <Switch
                            id={`active-${file.id}`}
                            checked={file.is_active}
                            onCheckedChange={() => toggleActive(file.id, file.is_active)}
                          />
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(getDownloadUrl(file.file_path), '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(file.id, file.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExternalAccessManagement;
