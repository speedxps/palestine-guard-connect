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
      console.log('Attempting login with:', email);
      const success = await login(email, password);
      console.log('Login result:', success);
      
      if (success) {
        toast({
          title: "✅ تم تسجيل الدخول بنجاح!",
          description: "جاري التوجه إلى الصفحة الرئيسية...",
        });
        
        // Immediate redirect - don't wait
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 1000);
      } else {
        toast({
          title: "❌ فشل تسجيل الدخول", 
          description: "تحقق من البريد الإلكتروني وكلمة المرور",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "❌ خطأ في تسجيل الدخول",
        description: "حدث خطأ، حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (role: 'admin' | 'officer' | 'user') => {
    // حسابات تجريبية حقيقية موجودة في قاعدة البيانات
    switch (role) {
      case 'admin':
        setEmail('noor-khallaf@hotmail.com');
        setPassword('123123');
        break;
      case 'officer':
        setEmail('ahmad@police.com');
        setPassword('123123');
        break;
      case 'user':
        setEmail('user@police.ps');
        setPassword('123123');
        break;
    }
  };

  // إضافة حسابات تجريبية للمستخدمين الموجودين
  const demoAccounts = [
    { name: 'نور خلاف (مدير)', email: 'noor-khallaf@hotmail.com', password: '123123', role: 'admin' },
    { name: 'عمر علي (مدير)', email: 'omar@police.com', password: '123123', role: 'admin' },
    { name: 'أحمد محمد (ضابط)', email: 'ahmad@police.com', password: '123123', role: 'officer' },
    { name: 'سارة أحمد (ضابط)', email: 'sara@police.com', password: '123123', role: 'officer' },
    { name: 'Noor kh (ضابط)', email: '192059@ppu.edu.ps', password: '123123', role: 'officer' },
    { name: 'user test (مستخدم)', email: 'user@police.ps', password: '123123', role: 'user' }
  ];

  return (
    <div className="mobile-container">
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--login-bg-start))] to-[hsl(var(--login-bg-end))] flex flex-col">
        {/* Header */}
        <div className="text-center pt-16 pb-8">
          <h1 className="text-2xl font-bold font-arabic text-white mb-4">
            الشرطة الفلسطينية
          </h1>
          <div className="mx-auto w-32 h-32 mb-4 relative">
            <img 
              src={genericPoliceLogo} 
              alt="Police Department Logo" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Login Form Container */}
        <div className="flex-1 bg-white rounded-t-3xl pt-8 px-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-muted/30 border-muted text-lg font-medium rounded-xl"
                  placeholder="Email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-muted/30 border-muted text-lg font-medium rounded-xl"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-xl mt-8"
              disabled={isLoading}
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'LOGIN'}
            </Button>

            {/* Demo Account Buttons */}
            <div className="space-y-3 pt-6 border-t border-muted">
              <p className="text-sm text-muted-foreground text-center">الحسابات التجريبية المتوفرة:</p>
              
              {/* Quick Login Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('admin')}
                  className="flex-1 text-xs"
                >
                  👑 مدير
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('officer')}
                  className="flex-1 text-xs"
                >
                  🛡️ ضابط
                </Button>
              </div>
              
              {/* Detailed Account List */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="font-semibold mb-2">تفاصيل الحسابات:</div>
                {demoAccounts.map((account, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{account.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEmail(account.email);
                        setPassword(account.password);
                      }}
                      className="h-6 px-2 text-xs hover:bg-muted"
                    >
                      استخدام
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Forgot password?
              </button>
            </div>
          </form>
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