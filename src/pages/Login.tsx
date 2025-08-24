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
import { useTwoFactorAuth } from '@/hooks/useTwoFactorAuth';
import { TwoFactorVerificationModal } from '@/components/TwoFactorVerificationModal';
import { Eye, EyeOff, Mail, Lock, Fingerprint, Save } from 'lucide-react';
import genericPoliceLogo from '@/assets/generic-police-logo.png';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showTwoFactorVerification, setShowTwoFactorVerification] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<{ email: string; password: string } | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSupported: biometricSupported, authenticate: biometricAuth } = useBiometricAuth();
  const { isEnabled: twoFactorEnabled } = useTwoFactorAuth();

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

      // Load biometric settings
      const biometricSetting = localStorage.getItem('biometricEnabled');
      if (biometricSetting === 'true') {
        setBiometricEnabled(true);
      }
    };

    loadSavedData();
  }, []);

  const saveCredentials = (email: string, rememberMe: boolean) => {
    if (rememberMe) {
      localStorage.setItem('savedCredentials', JSON.stringify({
        email,
        rememberMe: true,
        timestamp: Date.now()
      }));
    } else {
      localStorage.removeItem('savedCredentials');
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricSupported) {
      toast({
        title: "❌ غير مدعوم",
        description: "المصادقة البيومترية غير متوفرة على هذا الجهاز",
        variant: "destructive",
      });
      return;
    }

    const savedCredentials = localStorage.getItem('savedCredentials');
    if (!savedCredentials) {
      toast({
        title: "❌ لا توجد بيانات محفوظة",
        description: "يجب تسجيل الدخول أولاً وتفعيل حفظ البيانات",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await biometricAuth();
      
      if (result.success) {
        const { email: savedEmail } = JSON.parse(savedCredentials);
        setEmail(savedEmail);
        
        toast({
          title: "✅ تم التحقق بنجاح",
          description: "تم التحقق من هويتك باستخدام البصمة",
        });

        // Auto login with saved credentials
        // Note: In real implementation, you'd need to store and retrieve the password securely
        toast({
          title: "ℹ️ يرجى إدخال كلمة المرور",
          description: "أدخل كلمة المرور لإتمام عملية تسجيل الدخول",
        });
      } else {
        toast({
          title: "❌ فشل التحقق",
          description: result.error || "فشل في التحقق البيومتري",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      toast({
        title: "❌ خطأ",
        description: "حدث خطأ في المصادقة البيومترية",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login with:', email);
      
      // First, check if user has two-factor authentication enabled
      const userTwoFactorEnabled = localStorage.getItem('twoFactorEnabled') === 'true';
      
      if (userTwoFactorEnabled) {
        // Store login data for later use after 2FA verification
        setPendingLoginData({ email, password });
        setShowTwoFactorVerification(true);
        setIsLoading(false);
        return;
      }
      
      // Regular login without 2FA
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
      saveCredentials(loginEmail, rememberMe);

      // Save biometric setting
      localStorage.setItem('biometricEnabled', biometricEnabled.toString());

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

  const handleTwoFactorSuccess = async () => {
    if (pendingLoginData) {
      setIsLoading(true);
      await performLogin(pendingLoginData.email, pendingLoginData.password);
      setPendingLoginData(null);
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary-glow">
        {/* Geometric Shapes */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-1/4 right-16 w-24 h-24 bg-white/5 rounded-lg rotate-45 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
          <div className="absolute bottom-1/4 left-8 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-12 w-20 h-20 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-6 gap-4 h-full p-4">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="border border-white/20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl transform scale-150"></div>
            <div className="relative mx-auto w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full p-4 shadow-2xl border border-white/20">
              <img 
                src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
                alt="Palestinian Police Department Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-arabic text-white mb-2 drop-shadow-lg">
            الشرطة الفلسطينية
          </h1>
          <p className="text-white/80 font-inter text-sm">Palestinian Police Department</p>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm mx-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-scale-in">
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
                  className="pl-12 h-14 bg-muted/30 border-2 border-muted/50 focus:border-primary/50 text-base rounded-2xl transition-all duration-300 focus:shadow-lg"
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
                  className="pl-12 pr-14 h-14 bg-muted/30 border-2 border-muted/50 focus:border-primary/50 text-base rounded-2xl transition-all duration-300 focus:shadow-lg"
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

                {/* Biometric Authentication */}
                {biometricSupported && (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch 
                      id="biometricAuth"
                      checked={biometricEnabled}
                      onCheckedChange={setBiometricEnabled}
                    />
                    <Label 
                      htmlFor="biometricAuth" 
                      className="text-sm text-muted-foreground cursor-pointer font-arabic flex items-center gap-2"
                    >
                      <Fingerprint className="h-4 w-4" />
                      تفعيل المصادقة البيومترية
                    </Label>
                  </div>
                )}

                {/* Biometric Login Button */}
                {biometricSupported && biometricEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBiometricLogin}
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-green-50/50 to-green-100/50 border-green-200/50 hover:from-green-100/70 hover:to-green-200/70 text-green-700 font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Fingerprint className="h-5 w-5 mr-2" />
                    تسجيل الدخول بالبصمة
                  </Button>
                )}
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

          {/* Demo Accounts Section */}
          <div className="mt-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-center font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <span className="text-lg">🧪</span>
              الحسابات التجريبية
            </h3>
            
            {/* Quick Access Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fillDemoAccount('admin')}
                className="h-12 bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200 text-green-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                <span className="mr-2">👑</span>
                مدير النظام
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fillDemoAccount('officer')}
                className="h-12 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200 text-blue-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                <span className="mr-2">🛡️</span>
                ضابط
              </Button>
            </div>
            
            {/* Detailed Accounts */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground text-center mb-3">اختر حساب للدخول السريع:</p>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {demoAccounts.map((account, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        account.role === 'admin' ? 'bg-green-100 text-green-600' :
                        account.role === 'officer' ? 'bg-blue-100 text-blue-600' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {account.role === 'admin' ? '👑' : account.role === 'officer' ? '🛡️' : '👤'}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{account.email}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setEmail(account.email);
                        setPassword(account.password);
                      }}
                      className="h-8 px-3 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                      variant="outline"
                    >
                      استخدام
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
      
      {/* Two-Factor Verification Modal */}
      <TwoFactorVerificationModal
        isOpen={showTwoFactorVerification}
        onClose={() => {
          setShowTwoFactorVerification(false);
          setPendingLoginData(null);
          setIsLoading(false);
        }}
        onSuccess={handleTwoFactorSuccess}
        userEmail={email}
      />
    </div>
  );
};

export default Login;