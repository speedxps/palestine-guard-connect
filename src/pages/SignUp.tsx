import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Mail, Lock, User, Phone, Badge } from 'lucide-react';
import genericPoliceLogo from '@/assets/generic-police-logo.png';
import type { UserRole } from '@/contexts/AuthContext';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
    phone: '',
    badgeNumber: '',
    role: 'officer' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور وتأكيدها غير متطابقتان",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
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
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            username: formData.username,
            full_name: formData.fullName,
            role: formData.role,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile manually
        const profileData: any = {
          user_id: authData.user.id,
          username: formData.username,
          full_name: formData.fullName,
          phone: formData.phone || null,
          badge_number: formData.badgeNumber || null,
        };

        // Only add role if it's valid for the database enum
        if (formData.role === 'admin' || formData.role === 'officer') {
          profileData.role = formData.role;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (profileError) {
          console.warn('Profile creation error:', profileError);
        }
      }

      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "يرجى تسجيل الدخول باستخدام بياناتك الجديدة",
      });

      navigate('/login');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mobile-container">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col justify-center px-6 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 mb-4 relative">
            <img 
              src={genericPoliceLogo} 
              alt="Police Department Logo" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
            <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          <h1 className="text-xl font-bold font-arabic text-foreground mb-2">
            إنشاء حساب جديد
          </h1>
          <p className="text-muted-foreground font-inter text-sm">
            Create New Account
          </p>
        </div>

        {/* Sign Up Form */}
        <Card className="glass-card p-6 shadow-2xl border-border/20">
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                البريد الإلكتروني / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                  placeholder="example@police.ps"
                  required
                />
              </div>
            </div>

            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                اسم المستخدم / Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => updateFormData('username', e.target.value)}
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                  placeholder="username"
                  required
                />
              </div>
            </div>

            {/* Full Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                الاسم الكامل / Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateFormData('fullName', e.target.value)}
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                  placeholder="الاسم الكامل"
                  required
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                رقم الهاتف / Phone (اختياري)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                  placeholder="+970 59 123 4567"
                />
              </div>
            </div>

            {/* Badge Number Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                رقم الشارة / Badge Number (اختياري)
              </label>
              <div className="relative">
                <Badge className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={formData.badgeNumber}
                  onChange={(e) => updateFormData('badgeNumber', e.target.value)}
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                  placeholder="P12345"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                الدور / Role
              </label>
              <Select value={formData.role} onValueChange={(value: UserRole) => updateFormData('role', value)}>
                <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:border-primary">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="officer">ضابط / Officer</SelectItem>
                  <SelectItem value="admin">مدير / Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                كلمة المرور / Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className="pl-10 pr-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                تأكيد كلمة المرور / Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className="pl-10 pr-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              variant="police"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </Button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                هل لديك حساب؟{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:underline font-medium"
                >
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;