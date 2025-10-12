import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import policeLogo from "@/assets/police-logo.png"; // نفس الصورة

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [animateHeader, setAnimateHeader] = useState(false);

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
      const success = await login(username, password);

      if (success) {
        if (rememberMe) {
          localStorage.setItem(
            "savedCredentials",
            JSON.stringify({
              email: username,
              rememberMe: true,
              timestamp: Date.now(),
            }),
          );
        } else {
          localStorage.removeItem("savedCredentials");
        }

        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في النظام",
        });

        setTimeout(() => {
          window.location.replace("/dashboard");
        }, 600);
      } else {
        toast({
          title: "فشل تسجيل الدخول",
          description: "تحقق من اسم المستخدم وكلمة المرور",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

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
            borderTopLeftRadius: "0",
            borderBottomLeftRadius: "0",
            boxShadow: "2px 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <img src={policeLogo} alt="Police Logo" className="w-14 h-14 object-contain" />
          <p className="italic text-white text-lg font-light">Police Ops</p>
        </div>
      </div>

      {/* الشعار الجديد في منتصف الصفحة */}
      <div className="absolute top-[130px] flex justify-center w-full">
        <img
          src={policeLogo}
          alt="Police Logo Floating"
          className="w-32 h-32 object-contain" // حجم متوسط
        />
      </div>

      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center w-full px-6 mt-[260px] flex-grow">
        <h2 className="text-[#2B9BF4] text-2xl mb-2 font-semibold" style={{ direction: "rtl" }}>
          الشرطة الفلسطينية
        </h2>
        <h1 className="text-[#2B9BF4] text-5xl font-extrabold italic mb-2 leading-tight">PoliceOps</h1>
        <p className="text-[#2B9BF4] text-base italic font-semibold mb-6">Palestinian Police Operations Center</p>

        <form onSubmit={handleSubmit} className="w-full max-w-xs sm:max-w-sm space-y-4">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 bg-gray-100 border-0 rounded-xl text-gray-700 placeholder:text-gray-500 px-4"
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 bg-gray-100 border-0 rounded-xl text-gray-700 placeholder:text-gray-500 px-4"
            required
          />

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
