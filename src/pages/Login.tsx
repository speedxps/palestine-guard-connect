import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Users, Eye, EyeOff } from "lucide-react";
import policeLogo from "@/assets/police-logo.png";
import { supabase } from "@/integrations/supabase/client";
import LoginBlocked from "./LoginBlocked";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testUsersOpen, setTestUsersOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockInfo, setBlockInfo] = useState<{
    location?: { country: string; city: string };
    ip?: string;
    timestamp?: string;
  }>({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [animateHeader, setAnimateHeader] = useState(false);

  const testUsers = [
    { email: "admin@test.com", password: "admin123", role: "مدير النظام" },
    { email: "traffic@test.com", password: "traffic123", role: "شرطة المرور" },
    { email: "cid@test.com", password: "cid123", role: "المباحث الجنائية" },
    { email: "special@test.com", password: "special123", role: "الشرطة الخاصة" },
    { email: "cyber@test.com", password: "cyber123", role: "الجرائم الإلكترونية" },
    { email: "judicial@test.com", password: "judicial123", role: "الشرطة القضائية" },
  ];

  const handleTestUserLogin = async (email: string, password: string) => {
    setUsername(email);
    setPassword(password);
    setTestUsersOpen(false);

    setTimeout(async () => {
      const success = await login(email, password);
      if (success) {
        toast({ title: "تم تسجيل الدخول بنجاح", description: "مرحباً بك في النظام" });
        setTimeout(() => window.location.replace("/dashboard"), 600);
      }
    }, 100);
  };

  useEffect(() => {
    const savedCred = localStorage.getItem("savedCredentials");
    if (savedCred) {
      try {
        const { email, rememberMe: saved } = JSON.parse(savedCred);
        if (saved) {
          setUsername(email);
          setRememberMe(true);
        }
      } catch (error) {
        console.error("Error loading credentials:", error);
      }
    }
    setTimeout(() => setAnimateHeader(true), 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // التحقق من الموقع الجغرافي قبل تسجيل الدخول
      const userAgent = navigator.userAgent;
      
      console.log('🔍 Checking login location...');
      const { data: locationCheck, error: locationError } = await supabase.functions.invoke('verify-login-location', {
        body: { email: username, userAgent }
      });

      console.log('📍 Location check result:', locationCheck);
      console.log('❌ Location check error:', locationError);

      // إذا كان هناك خطأ، تحقق من البيانات أولاً
      // لأن edge function يرجع status 403 عندما يكون محظور وهذا يعتبر error في invoke
      if (locationError && !locationCheck) {
        console.error('Location verification failed with no data:', locationError);
        toast({
          title: "⛔ فشل التحقق من الموقع",
          description: "حدث خطأ في التحقق من موقعك. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // التحقق من الحظر - سواء كان في data أو error
      const checkData = locationCheck || (locationError as any)?.context;
      
      // إذا كان الموقع محظور أو غير مسموح - عرض صفحة الحظر
      if (checkData?.blocked === true || checkData?.allowed === false) {
        console.warn('🚫 Login BLOCKED - outside Palestine', checkData);
        
        // حفظ معلومات الحظر لعرضها في صفحة الحظر
        setBlockInfo({
          location: checkData.location,
          ip: checkData.ip,
          timestamp: new Date().toISOString()
        });
        
        setIsBlocked(true);
        setIsLoading(false);
        return;
      }

      // تأكيد أن الموقع مسموح صراحةً
      if (checkData?.allowed !== true) {
        console.warn('⚠️ Location check returned unexpected result:', checkData);
        // إذا لم يكن هناك بيانات واضحة، نرفض الدخول للأمان
        setBlockInfo({
          location: checkData?.location,
          ip: checkData?.ip,
          timestamp: new Date().toISOString()
        });
        setIsBlocked(true);
        setIsLoading(false);
        return;
      }

      console.log('✅ Location verified - proceeding with login');

      const success = await login(username, password);
      if (success) {
        if (rememberMe) {
          localStorage.setItem(
            "savedCredentials",
            JSON.stringify({ email: username, rememberMe: true, timestamp: Date.now() }),
          );
        } else {
          localStorage.removeItem("savedCredentials");
        }

        toast({ title: "تم تسجيل الدخول بنجاح", description: "مرحباً بك في النظام" });
        setTimeout(() => window.location.replace("/dashboard"), 600);
      } else {
        toast({
          title: "فشل تسجيل الدخول",
          description: "تحقق من اسم المستخدم وكلمة المرور",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // إذا كان محظوراً، عرض صفحة الحظر
  if (isBlocked) {
    return <LoginBlocked location={blockInfo.location} ip={blockInfo.ip} timestamp={blockInfo.timestamp} />;
  }

  return (
    <div className="w-screen h-screen bg-white flex flex-col justify-start items-center overflow-hidden relative">
      {/* Blue Header */}
      <div className="w-full flex justify-end">
        <div
          className={`bg-[#2B9BF4] flex items-center gap-4 px-4 py-3 mt-4 shadow-sm transform transition-all duration-500 ease-in-out
            ${animateHeader ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}`}
          style={{
            width: "60%",
            maxWidth: "350px",
            borderTopRightRadius: "120px",
            borderBottomRightRadius: "120px",
            boxShadow: "2px 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <img src={policeLogo} alt="Police Logo" className="w-14 h-14 object-contain" />
          <p className="italic text-white text-lg font-light">Police Ops</p>
        </div>
      </div>

      {/* الشعار الكبير */}
      <div className="absolute top-[100px] flex justify-center w-full">
        <img src={policeLogo} alt="Police Logo Floating" className="w-52 h-52 object-contain" />
      </div>

      {/* المحتوى */}
      <div className="flex flex-col items-center justify-center w-full px-6 mt-[100px] flex-grow">
        <h2 className="text-[#2B9BF4] text-2xl mb-1 font-semibold" style={{ direction: "rtl" }}>
          الشرطة الفلسطينية
        </h2>
        <h1 className="text-[#2B9BF4] text-5xl font-extrabold italic mb-1 leading-tight">PoliceOps</h1>
        <p className="text-[#2B9BF4] text-base italic font-semibold mb-3">Palestinian Police Operations Center</p>

        <form onSubmit={handleSubmit} className="w-full max-w-xs sm:max-w-sm space-y-4">
          {/* اسم المستخدم */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 bg-gray-100 border-0 rounded-xl text-gray-700 placeholder:text-gray-500 px-4 pr-12"
              required
            />
            <Sheet open={testUsersOpen} onOpenChange={setTestUsersOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Users className="w-5 h-5 text-[#2B9BF4]" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80" style={{ direction: "rtl" }}>
                <SheetHeader>
                  <SheetTitle className="text-[#2B9BF4] text-xl">المستخدمون التجريبيون</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-3">
                  {testUsers.map((user, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTestUserLogin(user.email, user.password)}
                      className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-right transition-colors border border-gray-200"
                    >
                      <div className="font-semibold text-gray-800">{user.role}</div>
                      <div className="text-sm text-gray-600 mt-1">{user.email}</div>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* كلمة المرور مع زر الإظهار */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-gray-100 border-0 rounded-xl text-gray-700 placeholder:text-gray-500 px-4 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2B9BF4] transition"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* تذكرني */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="w-5 h-5 border-gray-400"
            />
            <label htmlFor="remember" className="text-gray-700 text-sm cursor-pointer">
              Remember me
            </label>
          </div>

          {/* زر تسجيل الدخول */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#2B9BF4] text-white italic text-lg rounded-none mt-3 transition-all duration-150 active:scale-[0.98]"
          >
            {isLoading ? "Loading..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
