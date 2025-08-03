import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import genericPoliceLogo from '@/assets/generic-police-logo.png';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في تطبيق الشرطة الفلسطينية",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (role: 'admin' | 'officer' | 'user') => {
    // These are just placeholder demo accounts for UI demonstration
    // Real authentication is now handled by Supabase
    switch (role) {
      case 'admin':
        setEmail('admin@example.com');
        setPassword('password123');
        break;
      case 'officer':
        setEmail('officer@example.com');
        setPassword('password123');
        break;
      case 'user':
        setEmail('user@example.com');
        setPassword('password123');
        break;
    }
  };

  return (
    <div className="mobile-container">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col justify-center px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 mb-6 relative">
            <img 
              src={genericPoliceLogo} 
              alt="Police Department Logo" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
            <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          <h1 className="text-2xl font-bold font-arabic text-foreground mb-2">
            الشرطة الفلسطينية
          </h1>
          <p className="text-muted-foreground font-inter">
            Palestinian Police Portal
          </p>
        </div>

        {/* Login Form */}
        <Card className="glass-card p-6 shadow-2xl border-border/20">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                البريد الإلكتروني / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                  placeholder="example@police.ps"
                  required
                />
              </div>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Login Button */}
            <Button
              type="submit"
              variant="police"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            {/* Auth Links */}
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                نسيت كلمة المرور؟
              </button>
              <p className="text-sm text-muted-foreground">
                لا تملك حساب؟{' '}
                <Link 
                  to="/signup" 
                  className="text-primary hover:underline font-medium"
                >
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </form>
        </Card>

        {/* Demo Accounts */}
        <div className="mt-8 space-y-3">
          <p className="text-xs text-center text-muted-foreground">
            حسابات تجريبية / Demo Accounts:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fillDemoAccount('admin')}
              className="text-xs"
            >
              مدير
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fillDemoAccount('officer')}
              className="text-xs"
            >
              ضابط
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fillDemoAccount('user')}
              className="text-xs"
            >
              مستخدم
            </Button>
          </div>
        </div>
        
        {/* Forgot Password Modal */}
        <ForgotPasswordModal 
          isOpen={showForgotPassword} 
          onClose={() => setShowForgotPassword(false)} 
        />
      </div>
    </div>
  );
};

export default Login;