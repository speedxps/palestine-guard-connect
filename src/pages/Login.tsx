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
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Header with Logo */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-blue-400 to-blue-500 rounded-br-[80px]">
        <div className="flex items-center gap-3 p-4">
          <img 
            src={genericPoliceLogo} 
            alt="Police Logo" 
            className="h-16 w-16 object-contain bg-white rounded-full p-2"
          />
          <span className="text-white text-lg font-semibold italic">Police Ops</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-6 sm:px-6 lg:px-8 pt-24">
        <Card className="w-full max-w-md bg-white shadow-xl border border-gray-100">
          <div className="p-8 sm:p-12">
            {/* Title */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-blue-600 mb-2" style={{ fontStyle: 'italic' }}>
                الشرطة الفلسطينية
              </h2>
              <h3 className="text-4xl font-bold text-blue-500 mb-3" style={{ fontStyle: 'italic' }}>
                PoliceOps
              </h3>
              <p className="text-lg text-blue-500 font-semibold" style={{ fontStyle: 'italic' }}>
                Palestinian Police Operations Center
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-gray-100 border-0 font-arabic text-base rounded-lg"
                  placeholder="Username"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-gray-100 border-0 font-arabic text-base rounded-lg"
                  placeholder="Password"
                  required
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-gray-400"
                />
                <Label 
                  htmlFor="remember" 
                  className="font-arabic text-gray-700 cursor-pointer text-base"
                >
                  Remember me
                </Label>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md transition-all"
                disabled={isLoading}
                style={{ fontStyle: 'italic' }}
              >
                {isLoading ? "جاري تسجيل الدخول..." : "Login"}
              </Button>
            </form>

            {/* Demo Accounts Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Label className="font-arabic text-gray-700 text-sm mb-2 block">
                حسابات تجريبية سريعة
              </Label>
              <Select value={selectedDemo} onValueChange={(value) => {
                setSelectedDemo(value);
                const account = demoAccounts.find(acc => acc.email === value);
                if (account) {
                  setEmail(account.email);
                  setPassword(account.password);
                }
              }}>
                <SelectTrigger className="w-full font-arabic bg-gray-50 border-gray-200">
                  <SelectValue placeholder="اختر حساب تجريبي" />
                </SelectTrigger>
                <SelectContent className="font-arabic max-h-[300px]">
                  {demoAccounts.map((account, index) => (
                    <SelectItem key={index} value={account.email}>
                      <div className="flex flex-col text-right">
                        <span className="font-semibold">{account.name}</span>
                        <span className="text-xs text-gray-500">{account.department}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
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