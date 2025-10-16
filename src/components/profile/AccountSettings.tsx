import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, Edit, Camera, Upload } from 'lucide-react';

export const AccountSettings = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    phone: '',
    badge_number: '',
    avatar_url: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, phone, badge_number, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error loading profile:', error);
        return;
      }
        
      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          badge_number: profile.badge_number || '',
          avatar_url: profile.avatar_url || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleOpen = () => {
    loadUserProfile();
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First get the user's profile to ensure we can update it
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!currentProfile) {
        throw new Error('Profile not found');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          badge_number: formData.badge_number || null,
          avatar_url: formData.avatar_url || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "✅ تم حفظ التغييرات",
        description: "تم تحديث معلوماتك الشخصية بنجاح",
      });

      // Refresh user data in context
      await refreshUser();

      setIsOpen(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "❌ خطأ في التحديث",
        description: error.message || "فشل في تحديث المعلومات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "❌ نوع ملف غير صحيح",
        description: "يرجى اختيار صورة صالحة",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "❌ الملف كبير جداً",
        description: "يجب أن يكون حجم الصورة أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update form data with new avatar URL
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));

      toast({
        title: "✅ تم رفع الصورة",
        description: "تم رفع صورتك الشخصية بنجاح",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "❌ خطأ في رفع الصورة",
        description: error.message || "فشل في رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card 
          className="glass-card p-4 cursor-pointer hover:bg-card/90 transition-all duration-300"
          onClick={handleOpen}
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold font-arabic text-foreground">
                إعدادات الحساب
              </h4>
              <p className="text-sm text-muted-foreground">
                تعديل البيانات الشخصية
              </p>
            </div>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic">إعدادات الحساب</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Profile Picture Section */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={formData.avatar_url} 
                    alt="صورة شخصية"
                  />
                  <AvatarFallback className="text-2xl">
                    {formData.full_name.charAt(0) || user?.email?.charAt(0) || '👤'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <p className="text-xs text-muted-foreground font-arabic">
              انقر على أيقونة الكاميرا لتغيير صورتك الشخصية
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name" className="font-arabic">الاسم الكامل</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="أدخل اسمك الكامل"
              className="font-arabic"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-arabic">رقم الهاتف</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="05xxxxxxxx"
              className="font-arabic"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="badge_number" className="font-arabic">رقم الشارة</Label>
            <Input
              id="badge_number"
              value={formData.badge_number}
              onChange={(e) => setFormData(prev => ({ ...prev, badge_number: e.target.value }))}
              placeholder="رقم الشارة"
              className="font-arabic"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-arabic">البريد الإلكتروني</Label>
            <Input
              value={user?.email}
              disabled
              className="bg-muted font-arabic"
            />
            <p className="text-xs text-muted-foreground font-arabic">
              لا يمكن تغيير البريد الإلكتروني
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="flex-1 font-arabic"
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 font-arabic"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};