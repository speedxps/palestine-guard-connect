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
import FaceLoginButton from '@/components/FaceLoginButton';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <img 
                src={genericPoliceLogo} 
                alt="Police Logo" 
                className="h-20 w-20 object-contain"
              />
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">
            Police Operations
          </h1>
          <p className="text-green-100 text-sm">
            Palestinian Police System
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
            تسجيل الدخول
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                اسم المستخدم
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pr-10 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                  placeholder="أدخل البريد الإلكتروني"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10 pl-10 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-400 hover:text-green-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-green-500 data-[state=checked]:bg-green-500"
                />
                <Label 
                  htmlFor="remember" 
                  className="text-gray-700 cursor-pointer text-sm"
                >
                  تذكرني
                </Label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? "جاري تسجيل الدخول..." : "دخول"}
            </Button>
          </form>

          {/* Demo Accounts Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Label className="text-gray-700 text-sm mb-3 block text-center font-medium">
              حسابات تجريبية
            </Label>
            <Select value={selectedDemo} onValueChange={(value) => {
              setSelectedDemo(value);
              const account = demoAccounts.find(acc => acc.email === value);
              if (account) {
                setEmail(account.email);
                setPassword(account.password);
              }
            }}>
              <SelectTrigger className="w-full bg-gray-50 border-2 border-gray-200 focus:border-green-500 rounded-xl h-11">
                <SelectValue placeholder="اختر حساب تجريبي" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] rounded-xl">
                {demoAccounts.map((account, index) => (
                  <SelectItem key={index} value={account.email} className="cursor-pointer">
                    <div className="flex flex-col text-right py-1">
                      <span className="font-semibold text-green-700">{account.name}</span>
                      <span className="text-xs text-gray-500">{account.department}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
};

export default Login;