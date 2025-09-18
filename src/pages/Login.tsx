import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { Eye, EyeOff, Mail, Lock, Save, Camera, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import genericPoliceLogo from '@/assets/generic-police-logo.png';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string>("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load saved credentials and settings on component mount
  React.useEffect(() => {
    const loadSavedData = () => {
      // Load saved credentials if remember me was enabled
      const savedCredentials = localStorage.getItem('savedCredentials');
      if (savedCredentials) {
        try {
          const { email: savedEmail, rememberMe: savedRememberMe } = JSON.parse(savedCredentials);
          if (savedRememberMe) {
            setEmail(savedEmail);
            setRememberMe(true);
          }
        } catch (error) {
          console.error('Error loading saved credentials:', error);
        }
      }

    };

    loadSavedData();
  }, []);

  const saveCredentials = (email: string, password: string, rememberMe: boolean) => {
    if (rememberMe) {
      const credentialsData = {
        email,
        rememberMe: true,
        timestamp: Date.now()
      };
      localStorage.setItem('savedCredentials', JSON.stringify(credentialsData));
    } else {
      localStorage.removeItem('savedCredentials');
    }
  };

  const handleFaceRecognitionLogin = async () => {
    try {
      setIsLoading(true);
      toast({
        title: "🔍 بدء التعرف على الوجه",
        description: "يرجى توجيه وجهك نحو الكاميرا...",
      });

      // محاكاة التعرف على الوجه - في التطبيق الحقيقي سيتم استخدام AI
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // بعد 3 ثوان، محاكاة نجح التعرف
      setTimeout(async () => {
        stream.getTracks().forEach(track => track.stop());
        
        // محاكاة تسجيل دخول ناجح بحساب تجريبي
        await performLogin('noor-khallaf@hotmail.com', '123123');
        
        toast({
          title: "✅ تم التعرف بنجاح!",
          description: "مرحباً نور، جاري تسجيل الدخول...",
        });
      }, 3000);
      
    } catch (error) {
      toast({
        title: "❌ فشل التعرف على الوجه",
        description: "تأكد من السماح بالوصول للكاميرا",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login with:', email);
      await performLogin(email, password);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "❌ خطأ في تسجيل الدخول",
        description: "حدث خطأ، حاول مرة أخرى",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    const success = await login(loginEmail, loginPassword);
    console.log('Login result:', success);
    
    if (success) {
      // Save credentials if remember me is checked
      saveCredentials(loginEmail, loginPassword, rememberMe);

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

  // حسابات تجريبية مع أقسامهم ومدرائهم
  const demoAccounts = [
    // مدراء النظام
    { name: 'نور خلاف', email: 'noor-khallaf@hotmail.com', password: '123123', role: 'admin', department: 'الإدارة العامة' },
    { name: 'عمر علي', email: 'omar@police.com', password: '123123', role: 'admin', department: 'الإدارة العامة' },
    
    // مديرو الأقسام
    { name: 'ياسر المرور', email: 'traffic-manager@police.com', password: '123123', role: 'traffic_manager', department: 'مدير شرطة المرور' },
    { name: 'خالد المباحث', email: 'cid-manager@police.com', password: '123123', role: 'cid_manager', department: 'مدير المباحث الجنائية' },
    { name: 'سمير الخاصة', email: 'special-manager@police.com', password: '123123', role: 'special_manager', department: 'مدير الشرطة الخاصة' },
    { name: 'علي السيبراني', email: 'cyber-manager@police.com', password: '123123', role: 'cybercrime_manager', department: 'مدير الجرائم الإلكترونية' },
    
    // موظفو الأقسام
    { name: 'أحمد محمد', email: 'ahmad@police.com', password: '123123', role: 'traffic_police', department: 'شرطة المرور' },
    { name: 'سارة أحمد', email: 'sara@police.com', password: '123123', role: 'cid', department: 'المباحث الجنائية' },
    { name: 'محمد علي', email: '192059@ppu.edu.ps', password: '123123', role: 'special_police', department: 'الشرطة الخاصة' },
    { name: 'فاطمة خالد', email: 'user@police.ps', password: '123123', role: 'cybercrime', department: 'الجرائم الإلكترونية' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Bright Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
        {/* Professional Geometric Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-1/4 right-16 w-24 h-24 bg-indigo-200/15 rounded-lg rotate-45 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
          <div className="absolute bottom-1/4 left-8 w-40 h-40 bg-blue-100/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-12 w-20 h-20 bg-indigo-300/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-6 gap-4 h-full p-4">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="border border-blue-300/30 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-200/30 rounded-full blur-2xl transform scale-150"></div>
            <div className="relative mx-auto w-32 h-32 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-2xl border border-blue-200/30">
              <img 
                src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
                alt="Palestinian Police Department Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-arabic text-gray-800 mb-2 drop-shadow-sm">
            الشرطة الفلسطينية
          </h1>
          <p className="text-gray-600 font-inter text-sm">Palestinian Police Department</p>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm mx-auto">
          <div className="bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-200/30 p-8 animate-scale-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">تسجيل الدخول</h2>
              <p className="text-muted-foreground text-sm">أدخل بياناتك للوصول إلى النظام</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-white border-2 border-blue-500 focus:border-blue-600 text-base rounded-2xl transition-all duration-300 focus:shadow-lg text-gray-900"
                  placeholder="البريد الإلكتروني"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-14 h-14 bg-white border-2 border-blue-500 focus:border-blue-600 text-base rounded-2xl transition-all duration-300 focus:shadow-lg text-gray-900"
                  placeholder="كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Login Options */}
              <div className="space-y-4">
                {/* Remember Me */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label 
                    htmlFor="rememberMe" 
                    className="text-sm text-muted-foreground cursor-pointer font-arabic flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    حفظ تسجيل الدخول
                  </Label>
                </div>

                {/* Demo Accounts Dropdown */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground font-arabic">
                    الحسابات التجريبية
                  </Label>
                  <Select value={selectedDemo} onValueChange={(value) => {
                    setSelectedDemo(value);
                    const account = demoAccounts.find(acc => acc.email === value);
                    if (account) {
                      setEmail(account.email);
                      setPassword(account.password);
                    }
                  }}>
                    <SelectTrigger className="w-full h-12 bg-white border-2 border-blue-500 rounded-2xl text-gray-900">
                      <SelectValue placeholder="اختر حساب تجريبي" />
                    </SelectTrigger>
                    <SelectContent>
                      {demoAccounts.map((account) => (
                        <SelectItem key={account.email} value={account.email}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{account.name}</span>
                            <span className="text-xs text-muted-foreground">({account.department})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Face Recognition Login */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFaceRecognitionLogin}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-purple-50/50 to-purple-100/50 border-purple-200/50 hover:from-purple-100/70 hover:to-purple-200/70 text-purple-700 font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  تسجيل الدخول بالتعرف على الوجه
                </Button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 mt-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : 'تسجيل الدخول'}
              </Button>

              {/* Forgot Password */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium text-sm"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
};

export default Login;