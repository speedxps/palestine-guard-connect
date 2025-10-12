import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import policeLogo from '@/assets/police-logo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedCred = localStorage.getItem('savedCredentials');
    if (savedCred) {
      try {
        const { email, rememberMe: saved } = JSON.parse(savedCred);
        if (saved) {
          setUsername(email);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error loading credentials:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      
      if (success) {
        if (rememberMe) {
          localStorage.setItem('savedCredentials', JSON.stringify({
            email: username,
            rememberMe: true,
            timestamp: Date.now()
          }));
        } else {
          localStorage.removeItem('savedCredentials');
        }

        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في النظام",
        });
        
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 500);
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-start px-6 overflow-hidden">
      {/* Blue curved header */}
      <div className="relative w-full mb-12">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#2B9BF4] rounded-br-full" style={{ borderBottomRightRadius: '100%' }} />
        <div className="relative pt-12 pl-6">
          <div className="flex items-center gap-4">
            <p className="text-white text-xl italic font-light">Police Ops</p>
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-xl">
              <img 
                src={policeLogo} 
                alt="Palestinian Police" 
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Titles */}
      <div className="text-center mb-12 w-full px-6">
        <h2 className="text-[#2B9BF4] text-3xl mb-4 font-medium" style={{ direction: 'rtl' }}>
          الشرطة الفلسطينية
        </h2>
        <h1 className="text-[#2B9BF4] text-5xl font-extrabold mb-3" style={{ fontStyle: 'italic' }}>
          PoliceOps
        </h1>
        <p className="text-[#2B9BF4] text-lg font-semibold" style={{ fontStyle: 'italic' }}>
          Palestinian Police Operations Center
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 px-8">
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="h-14 text-lg bg-gray-100 border-0 rounded-xl placeholder:text-gray-500 px-4"
          required
        />
        
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-14 text-lg bg-gray-100 border-0 rounded-xl placeholder:text-gray-500 px-4"
          required
        />

        <div className="flex items-center gap-3 py-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="w-5 h-5 border-2 border-gray-400"
          />
          <label htmlFor="remember" className="text-base font-normal text-gray-700 cursor-pointer">
            Remember me
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 text-2xl font-light bg-[#2B9BF4] hover:bg-[#2B9BF4]/90 rounded-xl text-white mt-8"
          style={{ fontStyle: 'italic' }}
        >
          {isLoading ? 'Loading...' : 'Login'}
        </Button>
      </form>

      {/* Demo accounts hint */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Demo: noor-khallaf@hotmail.com / 123123</p>
      </div>
    </div>
  );
};

export default Login;
