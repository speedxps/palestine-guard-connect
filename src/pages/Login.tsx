import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import FaceLoginButton from '@/components/FaceLoginButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load saved credentials
  useEffect(() => {
    const saved = localStorage.getItem('savedCredentials');
    if (saved) {
      try {
        const { email: savedEmail, rememberMe: savedRemember } = JSON.parse(saved);
        if (savedRemember) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch { }
    }
  }, []);

  const saveCredentials = (email: string, remember: boolean) => {
    if (remember) {
      localStorage.setItem('savedCredentials', JSON.stringify({ email, rememberMe: true, timestamp: Date.now() }));
    } else {
      localStorage.removeItem('savedCredentials');
    }
  };

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    const success = await login(loginEmail, loginPassword);
    if (success) {
      saveCredentials(loginEmail, rememberMe);
      toast({ title: '✅ تم تسجيل الدخول بنجاح!', description: 'جاري التوجه للصفحة الرئيسية...' });
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      toast({ title: '❌ فشل تسجيل الدخول', description: 'تحقق من البريد الإلكتروني وكلمة المرور', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await performLogin(email, password);
  };

  const demoAccounts = [
    { name: 'نور خلاف', email: 'noor-khallaf@hotmail.com', password: '123123', role: 'admin', department: 'الإدارة العامة' },
    { name: 'أحمد محمد', email: 'ahmad@police.com', password: '123123', role: 'traffic_police', department: 'شرطة المرور' },
    { name: 'سارة أحمد', email: 'sara@police.com', password: '123123', role: 'cid', department: 'المباحث الجنائية' },
    { name: 'فاطمة خالد', email: 'user@police.ps', password: '123123', role: 'cybercrime', department: 'الجرائم الإلكترونية' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex justify-center items-center px-4">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/4 right-16 w-24 h-24 bg-indigo-200/15 rounded-lg rotate-45 animate-bounce"></div>
        <div className="absolute bottom-1/4 left-8 w-40 h-40 bg-blue-100/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-12 w-20 h-20 bg-indigo-300/25 rounded-full animate-pulse"></div>
      </div>

      {/* Login Card */}
      <Card className="relative z-10 max-w-md w-full p-8 rounded-3xl shadow-2xl bg-white/95 backdrop-blur-xl border border-blue-200/30">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1">الشرطة الفلسطينية</h1>
          <p className="text-gray-500 text-sm">Palestinian Police Department</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="pl-12 h-12 rounded-xl border-2 border-blue-500 focus:border-blue-600 focus:shadow-lg transition"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="pl-12 pr-12 h-12 rounded-xl border-2 border-blue-500 focus:border-blue-600 focus:shadow-lg transition"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition">
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={checked => setRememberMe(checked === true)} />
            <Label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer flex items-center gap-2">
              <Save className="h-4 w-4" /> حفظ تسجيل الدخول
            </Label>
          </div>

          {/* Demo Accounts */}
          <Select value={selectedDemo} onValueChange={value => {
            setSelectedDemo(value);
            const acc = demoAccounts.find(a => a.email === value);
            if (acc) { setEmail(acc.email); setPassword(acc.password); }
          }}>
            <SelectTrigger className="w-full h-12 border-2 border-blue-500 rounded-xl text-gray-700">
              <SelectValue placeholder="اختر حساب تجريبي" />
            </SelectTrigger>
            <SelectContent>
              {demoAccounts.map(acc => (
                <SelectItem key={acc.email} value={acc.email}>
                  <div className="flex justify-between">
                    <span>{acc.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 rounded-full">{acc.role === 'admin' ? 'مدير' : 'موظف'}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Face Recognition */}
          <FaceLoginButton 
            onSuccess={() => {
              toast({ title: '✅ تسجيل دخول ناجح', description: 'تم تسجيل الدخول باستخدام التعرف على الوجه' });
              navigate('/dashboard');
            }}
            className="w-full h-12 bg-purple-100 text-purple-700 font-semibold rounded-xl hover:scale-105 transition"
          />

          {/* Login Button */}
          <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition" disabled={isLoading}>
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>

          {/* Forgot Password */}
          <div className="text-center">
            <button type="button" onClick={() => setShowForgotPassword(true)} className="text-gray-600 hover:text-blue-600 text-sm">نسيت كلمة المرور؟</button>
          </div>
        </form>
      </Card>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
    </div>
  );
};

export default Login;
