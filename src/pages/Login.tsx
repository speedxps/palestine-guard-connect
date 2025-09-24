import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import { FaceLoginButton } from '@/components/FaceLoginButton';

const demoAccounts = [
  { name: 'نور خلاف', email: 'noor-khallaf@hotmail.com', password: '123123', role: 'admin', department: 'الإدارة العامة' },
  { name: 'أحمد محمد', email: 'ahmad@police.com', password: '123123', role: 'traffic_police', department: 'شرطة المرور' },
  { name: 'سارة أحمد', email: 'sara@police.com', password: '123123', role: 'cid', department: 'المباحث الجنائية' },
  { name: 'فاطمة خالد', email: 'user@police.ps', password: '123123', role: 'cybercrime', department: 'الجرائم الإلكترونية' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
      } catch (err) {
        console.error('Error loading saved credentials:', err);
      }
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
      toast({ title: "✅ تم تسجيل الدخول بنجاح", description: "جاري التوجه إلى الصفحة الرئيسية..." });
      navigate('/dashboard');
    } else {
      toast({ title: "❌ فشل تسجيل الدخول", description: "تحقق من البريد الإلكتروني وكلمة المرور", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await performLogin(email, password);
  };

  const handleFaceLogin = async () => {
    try {
      setIsLoading(true);
      toast({ title: "🔍 بدء التعرف على الوجه", description: "يرجى توجيه وجهك نحو الكاميرا..." });
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setTimeout(async () => {
        stream.getTracks().forEach(track => track.stop());
        await performLogin('noor-khallaf@hotmail.com', '123123'); // Demo face login
        toast({ title: "✅ تم التعرف بنجاح!", description: "مرحباً نور، جاري تسجيل الدخول..." });
      }, 3000);
    } catch (err) {
      toast({ title: "❌ فشل التعرف على الوجه", description: "تأكد من السماح بالوصول للكاميرا", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex items-center justify-center px-4">
      {/* Geometric Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/4 right-16 w-24 h-24 bg-indigo-200/15 rounded-lg rotate-45 animate-bounce"></div>
        <div className="absolute bottom-1/4 left-8 w-40 h-40 bg-blue-100/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-12 w-20 h-20 bg-indigo-300/25 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-1">الشرطة الفلسطينية</h1>
            <p className="text-gray-600 text-sm">Palestinian Police Department</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                required
                className="pl-12 h-12 rounded-xl border border-blue-500 focus:border-blue-600"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                required
                className="pl-12 pr-12 h-12 rounded-xl border border-blue-500 focus:border-blue-600"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <Checkbox checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
              <Label className="text-sm flex items-center gap-1">
                <Save className="w-4 h-4" /> حفظ تسجيل الدخول
              </Label>
            </div>

            {/* Demo Accounts */}
            <Select value={selectedDemo} onValueChange={(value) => {
              setSelectedDemo(value);
              const account = demoAccounts.find(acc => acc.email === value);
              if (account) {
                setEmail(account.email);
                setPassword(account.password);
              }
            }}>
              <SelectTrigger className="w-full h-12 rounded-xl border border-blue-500 focus:border-blue-600">
                <SelectValue placeholder="اختر حساب تجريبي" />
              </SelectTrigger>
              <SelectContent>
                {demoAccounts.map(acc => (
                  <SelectItem key={acc.email} value={acc.email}>
                    {acc.name} - {acc.role === 'admin' ? 'مدير' : 'موظف'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Face Login */}
            <FaceLoginButton onSuccess={handleFaceLogin} className="w-full h-12 rounded-xl bg-purple-100 text-purple-700 font-semibold" />

            {/* Submit */}
            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold">
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            {/* Forgot Password */}
            <div className="text-center pt-2">
              <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-gray-600 hover:text-blue-600">
                نسيت كلمة المرور؟
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
    </div>
  );
};

export default Login;
