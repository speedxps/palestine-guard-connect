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

const NewIncident = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    location: '',
    urgency: 'medium'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "تم إرسال البلاغ بنجاح",
      description: "شكراً لك، سيتم متابعة البلاغ من قبل الفريق المختص",
    });

    // Reset form
    setFormData({
      type: '',
      title: '',
      description: '',
      location: '',
      urgency: 'medium'
    });

    setIsSubmitting(false);
    navigate('/dashboard');
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
          toast({
            title: "تم تحديد الموقع",
            description: "تم تحديد موقعك الحالي بنجاح",
          });
        },
        (error) => {
          toast({
            title: "خطأ في تحديد الموقع",
            description: "لم نتمكن من تحديد موقعك الحالي",
            variant: "destructive",
          });
        }
      );
    }
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
                  size="icon"
                  onClick={getCurrentLocation}
                  className="h-12 w-12"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground font-arabic">
                مستوى الإلحاح
              </label>
              <Select 
                value={formData.urgency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                  <SelectItem value="critical">طارئ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground font-arabic">
                إرفاق صورة أو فيديو (اختياري)
              </label>
              <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
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
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={() => {}}
                />
              </div>
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