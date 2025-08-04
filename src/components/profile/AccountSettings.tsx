import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, Edit } from 'lucide-react';

export const AccountSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    phone: '',
    badge_number: '',
  });

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, badge_number')
        .eq('user_id', user.id)
        .single();
        
      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          badge_number: profile.badge_number || '',
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
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          badge_number: formData.badge_number || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "✅ تم حفظ التغييرات",
        description: "تم تحديث معلوماتك الشخصية بنجاح",
      });

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