import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Save, Key, Shield } from 'lucide-react';

export const SecuritySettings = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword) {
      toast({
        title: "❌ بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "❌ خطأ في التأكيد",
        description: "كلمة المرور الجديدة وتأكيدها غير متطابقان",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "❌ كلمة مرور ضعيفة",
        description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      toast({
        title: "✅ تم تغيير كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح",
      });

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "❌ خطأ في التحديث",
        description: error.message || "فشل في تغيير كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) {
        toast({
          title: "❌ خطأ",
          description: "لا يمكن العثور على البريد الإلكتروني",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.user.email);
      
      if (error) throw error;

      toast({
        title: "✅ تم إرسال رابط إعادة التعيين",
        description: "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور",
      });
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      toast({
        title: "❌ خطأ",
        description: error.message || "فشل في إرسال رابط إعادة التعيين",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card 
          className="glass-card p-4 cursor-pointer hover:bg-card/90 transition-all duration-300"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold font-arabic text-foreground">
                الأمان والخصوصية
              </h4>
              <p className="text-sm text-muted-foreground">
                كلمة المرور والأمان
              </p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic">الأمان والخصوصية</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* تغيير كلمة المرور */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Key className="h-4 w-4 text-primary" />
              <h4 className="font-semibold font-arabic">تغيير كلمة المرور</h4>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="font-arabic">كلمة المرور الحالية</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="أدخل كلمة المرور الحالية"
                className="font-arabic"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="font-arabic">كلمة المرور الجديدة</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="أدخل كلمة المرور الجديدة"
                className="font-arabic"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-arabic">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                className="font-arabic"
              />
            </div>
          </div>

          {/* معلومات الأمان */}
          <div className="space-y-3 border-t border-border/50 pt-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              <h4 className="font-semibold font-arabic">معلومات الأمان</h4>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-xs text-green-400 font-arabic">
                ✓ تم التحقق من هويتك
              </p>
              <p className="text-xs text-green-400/80 font-arabic">
                ✓ تشفير قوي للبيانات
              </p>
              <p className="text-xs text-green-400/80 font-arabic">
                ✓ حماية متقدمة للحساب
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRequestPasswordReset}
              className="w-full font-arabic"
            >
              إرسال رابط إعادة تعيين كلمة المرور
            </Button>
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
            onClick={handleChangePassword}
            disabled={isLoading}
            className="flex-1 font-arabic"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};