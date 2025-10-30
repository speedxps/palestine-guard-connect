import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useTwoFactorAuth } from '@/hooks/useTwoFactorAuth';
import { TwoFactorSetupModal } from '@/components/TwoFactorSetupModal';
import { SimpleFaceLoginSetup } from '@/components/SimpleFaceLoginSetup';
import { BiometricSetupButton } from '@/components/BiometricSetupButton';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Save, Key, Shield, Fingerprint, Smartphone, QrCode, Camera, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SecuritySettings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const { isEnabled: twoFactorEnabled, disable: disableTwoFactor } = useTwoFactorAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [faceLoginEnabled, setFaceLoginEnabled] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = () => {
    try {
      const biometricSetting = localStorage.getItem('biometricEnabled');
      const faceSetting = localStorage.getItem('faceLoginEnabled');
      setBiometricEnabled(biometricSetting === 'true');
      setFaceLoginEnabled(faceSetting === 'true');
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };


  const handleTwoFactorToggle = (enabled: boolean) => {
    if (enabled && !twoFactorEnabled) {
      // Show setup modal
      setShowTwoFactorSetup(true);
    } else if (!enabled && twoFactorEnabled) {
      // Disable two-factor
      disableTwoFactor();
      toast({
        title: "ℹ️ تم إلغاء المصادقة الثنائية",
        description: "لن يتم طلب رمز إضافي عند تسجيل الدخول",
      });
    }
  };

  const handleDisableFaceLogin = async () => {
    const confirmed = window.confirm('هل أنت متأكد من تعطيل تسجيل الدخول بالوجه؟');
    if (!confirmed) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // تعطيل في قاعدة البيانات
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          face_login_enabled: false,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('خطأ في تحديث قاعدة البيانات:', updateError);
        toast({
          title: "❌ خطأ",
          description: "فشل تعطيل تسجيل الدخول بالوجه",
          variant: "destructive",
        });
        return;
      }

      // تعطيل face_data
      const { error: faceDataError } = await supabase
        .from('face_data')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (faceDataError) {
        console.error('خطأ في تحديث face_data:', faceDataError);
      }
    }

    setFaceLoginEnabled(false);
    localStorage.setItem('faceLoginEnabled', 'false');
    toast({
      title: "ℹ️ تم تعطيل تسجيل الدخول بالوجه",
      description: "لن تتمكن من استخدام الوجه لتسجيل الدخول",
    });
  };

  const handleTwoFactorSuccess = () => {
    loadSecuritySettings();
    setShowTwoFactorSetup(false);
    toast({
      title: "✅ تم تفعيل المصادقة الثنائية",
      description: "يمكنك الآن استخدام رموز TOTP لتسجيل الدخول",
    });
  };

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

          {/* المصادقة المتقدمة */}
          <div className="space-y-4 border-t border-border/50 pt-4">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-blue-400" />
              <h4 className="font-semibold font-arabic">المصادقة المتقدمة</h4>
            </div>

            {/* المصادقة البيومترية */}
            <BiometricSetupButton 
              isEnabled={biometricEnabled}
              onToggle={(enabled) => {
                setBiometricEnabled(enabled);
                localStorage.setItem('biometricEnabled', enabled ? 'true' : 'false');
              }}
            />

            {/* تسجيل الدخول بالوجه */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-purple-400" />
                  <Label className="font-arabic text-sm">تسجيل الدخول بالوجه</Label>
                </div>
                <div className="flex items-center gap-2">
                  {faceLoginEnabled ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/face-login-setup')}
                        className="text-xs gap-1"
                      >
                        <Camera className="h-3 w-3" />
                        إدارة
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDisableFaceLogin}
                        className="text-xs"
                      >
                        تعطيل
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => navigate('/face-login-setup')}
                      className="text-xs bg-purple-500 hover:bg-purple-600 gap-1"
                    >
                      <Camera className="h-3 w-3" />
                      إعداد الآن
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-purple-400/80 font-arabic mb-2">
                استخدم التعرف على الوجه لتسجيل الدخول السريع والآمن
              </p>
              {faceLoginEnabled && (
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <span>✓</span>
                  <span className="font-arabic">مفعل - تم حفظ بيانات الوجه</span>
                </div>
              )}
            </div>

            {/* المصادقة الثنائية */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-orange-400" />
                  <Label className="font-arabic text-sm">المصادقة الثنائية (TOTP)</Label>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                />
              </div>
              <p className="text-xs text-orange-400/80 font-arabic mb-2">
                استخدم تطبيق المصادقة لرموز إضافية آمنة
              </p>
              {twoFactorEnabled && (
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <span>✓</span>
                  <span className="font-arabic">مفعل - محمي بـ TOTP</span>
                </div>
              )}
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
      
      {/* Two-Factor Setup Modal */}
        <TwoFactorSetupModal
          isOpen={showTwoFactorSetup}
          onClose={() => setShowTwoFactorSetup(false)}
          onSuccess={handleTwoFactorSuccess}
        />
    </Dialog>
  );
};