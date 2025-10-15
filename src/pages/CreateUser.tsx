import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Mail, Lock, User, Phone, Hash, Shield } from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';
import { BackButton } from '@/components/BackButton';

const CreateUser = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    full_name: '',
    phone: '',
    badge_number: '',
    role: 'officer' as UserRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password || !formData.username || !formData.full_name) {
      toast({
        title: "❌ بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "❌ خطأ في كلمة المرور",
        description: "كلمة المرور وتأكيد كلمة المرور غير متطابقين",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "❌ كلمة مرور ضعيفة",
        description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: formData.username,
            full_name: formData.full_name,
            role: formData.role,
          }
        }
      });

      if (authError) throw authError;

      toast({
        title: "✅ تم إنشاء المستخدم بنجاح",
        description: `تم إنشاء حساب ${formData.full_name}`,
      });

      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        full_name: '',
        phone: '',
        badge_number: '',
        role: 'officer',
      });

      // Navigate to admin panel after 2 seconds
      setTimeout(() => {
        navigate('/admin-panel');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "❌ فشل في إنشاء المستخدم",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-primary" />
              إنشاء مستخدم جديد
            </h1>
            <p className="text-muted-foreground mt-1">
              أضف مستخدم جديد إلى النظام مع تحديد الصلاحيات والقسم
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات المستخدم</CardTitle>
            <CardDescription>
              قم بملء البيانات التالية لإنشاء حساب مستخدم جديد في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  المعلومات الأساسية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      البريد الإلكتروني *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@police.gov"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">اسم المستخدم *</Label>
                    <Input
                      id="username"
                      placeholder="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">الاسم الكامل *</Label>
                    <Input
                      id="full_name"
                      placeholder="الاسم الكامل"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      رقم الهاتف
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+966 50 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge_number" className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      رقم الشارة
                    </Label>
                    <Input
                      id="badge_number"
                      placeholder="Badge-12345"
                      value={formData.badge_number}
                      onChange={(e) => setFormData(prev => ({...prev, badge_number: e.target.value}))}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      القسم / الصلاحية *
                    </Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value: UserRole) => setFormData(prev => ({...prev, role: value}))}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="اختر القسم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">الإدارة العامة</SelectItem>
                        <SelectItem value="traffic_police">شرطة المرور</SelectItem>
                        <SelectItem value="cid">المباحث الجنائية</SelectItem>
                        <SelectItem value="special_police">الشرطة الخاصة</SelectItem>
                        <SelectItem value="cybercrime">الجرائم الإلكترونية</SelectItem>
                        <SelectItem value="judicial_police">الشرطة القضائية</SelectItem>
                        <SelectItem value="officer">ضابط عام</SelectItem>
                        <SelectItem value="user">مستخدم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Security Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  معلومات الأمان
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      يجب أن تكون 6 أحرف على الأقل
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      إنشاء المستخدم
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/admin-panel')}
                  disabled={isLoading}
                  size="lg"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-2">ملاحظات هامة:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• سيتم إرسال رسالة تأكيد إلى البريد الإلكتروني المُدخل</li>
              <li>• يمكن تعديل معلومات المستخدم لاحقاً من لوحة إدارة المستخدمين</li>
              <li>• الحقول المُعلّمة بـ (*) إلزامية</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateUser;
