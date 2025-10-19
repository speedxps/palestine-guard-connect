import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, File, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cases: Array<{ id: string; case_number: string; title: string }>;
  onUploadComplete: () => void;
}

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onOpenChange,
  cases,
  onUploadComplete,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedCase || selectedFiles.length === 0) {
      toast({
        title: 'خطأ',
        description: 'الرجاء اختيار القضية والملفات',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'خطأ',
        description: 'يجب تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      for (const file of selectedFiles) {
        // Upload to storage
        const filePath = `${selectedCase}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('cybercrime-case-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Record in database
        const { error: dbError } = await supabase
          .from('cybercrime_case_files')
          .insert({
            case_id: selectedCase,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: profile.id,
          });

        if (dbError) throw dbError;
      }

      toast({
        title: 'نجح',
        description: `تم رفع ${selectedFiles.length} ملف بنجاح`,
      });

      setSelectedFiles([]);
      setSelectedCase('');
      onUploadComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في رفع الملفات',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-arabic">رفع ملفات للقضية</DialogTitle>
          <DialogDescription>
            اختر القضية وارفع الملفات المتعلقة بها
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="case">اختر القضية *</Label>
            <Select value={selectedCase} onValueChange={setSelectedCase}>
              <SelectTrigger>
                <SelectValue placeholder="اختر القضية..." />
              </SelectTrigger>
              <SelectContent>
                {cases.map((case_) => (
                  <SelectItem key={case_.id} value={case_.id}>
                    {case_.case_number} - {case_.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>الملفات</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  انقر لاختيار الملفات أو اسحبها هنا
                </span>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 mt-4">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <File className="h-5 w-5 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            إلغاء
          </Button>
          <Button onClick={handleUpload} disabled={uploading || !selectedCase || selectedFiles.length === 0}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                رفع {selectedFiles.length > 0 && `(${selectedFiles.length})`}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;
