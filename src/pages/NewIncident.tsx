import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  AlertTriangle,
  Upload,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const NewIncident = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    location: '',
    coordinates: null as { lat: number; lng: number } | null
  });

  const incidentTypes = [
    { value: 'theft', label: 'سرقة', icon: '🚨' },
    { value: 'accident', label: 'حادث مروري', icon: '🚗' },
    { value: 'emergency', label: 'حالة طوارئ', icon: '🚨' },
    { value: 'riot', label: 'اضطرابات', icon: '👥' },
    { value: 'violence', label: 'عنف', icon: '⚠️' },
    { value: 'fire', label: 'حريق', icon: '🔥' },
    { value: 'medical', label: 'طوارئ طبية', icon: '🏥' },
    { value: 'other', label: 'أخرى', icon: '📝' }
  ];

  const uploadFiles = async (incidentId: string, profileId: string) => {
    for (const file of attachedFiles) {
      try {
        // Upload to storage
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('incident-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get file URL
        const { data: urlData } = supabase.storage
          .from('incident-files')
          .getPublicUrl(fileName);

        // Save file record to database
        await supabase
          .from('incident_files')
          .insert({
            incident_id: incidentId,
            file_name: file.name,
            file_type: file.type,
            file_url: urlData.publicUrl,
            uploaded_by: profileId
          });

      } catch (error) {
        console.error('Error uploading file:', file.name, error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Get user profile to use correct ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Create the incident
      const { data: incident, error: incidentError } = await supabase
        .from('incidents')
        .insert({
          title: formData.title,
          description: formData.description,
          incident_type: formData.type,
          location_address: formData.location,
          location_lat: formData.coordinates?.lat,
          location_lng: formData.coordinates?.lng,
          reporter_id: profile.id,
          status: 'new'
        })
        .select()
        .single();

      if (incidentError) throw incidentError;

      // Upload files if any
      if (attachedFiles.length > 0 && incident) {
        await uploadFiles(incident.id, profile.id);
      }

      toast({
        title: "تم إرسال البلاغ بنجاح",
        description: "سيتم مراجعة بلاغك والرد عليك قريباً",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: '',
        location: '',
        coordinates: null
      });
      setAttachedFiles([]);
      
      // Navigate back
      navigate(-1);
    } catch (error) {
      console.error('Error submitting incident:', error);
      toast({
        title: "خطأ في إرسال البلاغ",
        description: "حدث خطأ أثناء إرسال البلاغ، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "غير مدعوم",
        description: "متصفحك لا يدعم خدمة تحديد الموقع",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          coordinates: { lat: latitude, lng: longitude }
        }));
        
        toast({
          title: "تم تحديد الموقع",
          description: "تم تحديد موقعك الحالي بنجاح",
        });
        
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = "لم نتمكن من تحديد موقعك";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "تم رفض الإذن للوصول إلى الموقع";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "معلومات الموقع غير متوفرة";
            break;
          case error.TIMEOUT:
            errorMessage = "انتهت مهلة طلب الموقع";
            break;
        }
        
        toast({
          title: "خطأ في تحديد الموقع",
          description: errorMessage,
          variant: "destructive",
        });
        
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      // Validate file size (10MB max)
      const validFiles = newFiles.filter(file => file.size <= 10 * 1024 * 1024);
      
      if (validFiles.length !== newFiles.length) {
        toast({
          title: "تحذير",
          description: "بعض الملفات تم تجاهلها لأن حجمها أكبر من 10MB",
          variant: "destructive",
        });
      }
      
      setAttachedFiles(prev => [...prev, ...validFiles]);
      
      if (validFiles.length > 0) {
        toast({
          title: "تم إرفاق الملفات",
          description: `تم إرفاق ${validFiles.length} ملف بنجاح`,
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-arabic">بلاغ جديد</h1>
            <p className="text-sm text-muted-foreground">New Incident Report</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        <Card className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Incident Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground font-arabic">
                نوع البلاغ *
              </label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                required
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="اختر نوع البلاغ" />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground font-arabic">
                عنوان البلاغ *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="مثال: سرقة مركبة في شارع الملك فيصل"
                className="h-12"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground font-arabic">
                وصف تفصيلي *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="اكتب وصفاً مفصلاً للحادثة..."
                className="min-h-[100px] resize-none"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground font-arabic">
                الموقع *
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="أدخل الموقع أو اضغط على تحديد الموقع"
                  className="h-12 flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="h-12 px-3 flex items-center gap-2"
                >
                  {isGettingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm">جاري التحديد...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">تحديد موقعي</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground font-arabic">
                إرفاق صورة أو فيديو (اختياري)
              </label>
              <div 
                className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="space-y-2">
                  <div className="flex justify-center gap-2">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    اضغط لإرفاق صورة أو فيديو
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, MP4 حتى 10MB
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              
              {/* Display attached files */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">الملفات المرفقة:</p>
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        {file.type.startsWith('image/') ? (
                          <Camera className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Upload className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        إزالة
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="emergency"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري الإرسال...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>إرسال البلاغ</span>
                </div>
              )}
            </Button>
          </form>
        </Card>

        {/* Emergency Notice */}
        <Card className="emergency-alert p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-emergency mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-emergency-foreground">تنبيه هام</h4>
              <p className="text-sm text-emergency-foreground/80">
                في حالة الطوارئ الطبية أو الأمنية، اتصل فوراً على رقم الطوارئ: 100
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NewIncident;