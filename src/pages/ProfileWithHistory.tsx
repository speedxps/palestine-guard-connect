import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { LanguageSettings } from '@/components/profile/LanguageSettings';
import { PrivacySettings } from '@/components/profile/PrivacySettings';
import LoginHistory from './LoginHistory';
import { 
  ArrowLeft, 
  Shield, 
  LogOut,
  History
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProfileWithHistory = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'account');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    toast({
      title: "تم تسجيل الخروج",
      description: "نشكرك لاستخدام تطبيق الشرطة الفلسطينية",
    });
    navigate('/login');
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير النظام';
      case 'officer':
        return 'ضابط شرطة';
      case 'user':
        return 'مستخدم';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'officer':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'user':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [user]);

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/80 backdrop-blur-md border-b border-border/50 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold font-arabic text-primary-foreground">الملف الشخصي</h1>
              <p className="text-sm text-primary-foreground/80">Profile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-32 space-y-6 pt-6">
        {/* User Info Card */}
        <Card className="glass-card border-2 border-primary/20 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-20 h-20 shadow-lg ring-4 ring-primary/20">
                <AvatarImage src={avatarUrl} alt={user?.name || 'صورة شخصية'} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-2xl">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || '👤'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold font-arabic text-foreground mb-1">
                  {user?.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {user?.email}
                </p>
                <Badge className={`${getRoleColor(user?.role || 'user')} px-3 py-1`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {getRoleText(user?.role || 'user')}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">12</div>
                <div className="text-xs text-muted-foreground font-arabic mt-1">البلاغات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">8</div>
                <div className="text-xs text-muted-foreground font-arabic mt-1">المهام</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">45</div>
                <div className="text-xs text-muted-foreground font-arabic mt-1">النقاط</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <Card className="glass-card border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 font-arabic">حساب محقق</h4>
                <p className="text-xs text-green-600/80 dark:text-green-400/80">
                  تم التحقق من هويتك بنجاح
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="account">الإعدادات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="login-history">
              <History className="h-4 w-4 ml-2" />
              سجل الدخول
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-3">
            <AccountSettings />
            <NotificationSettings />
            <PrivacySettings />
            <LanguageSettings />
          </TabsContent>

          <TabsContent value="security" className="space-y-3">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="login-history" className="space-y-3">
            <LoginHistory />
          </TabsContent>
        </Tabs>

        {/* Logout Button */}
        <Card className="glass-card border-2 border-destructive/20 shadow-lg">
          <CardContent className="p-4">
            <Button
              variant="destructive"
              size="lg"
              className="w-full shadow-lg hover:shadow-xl transition-all"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              تسجيل الخروج
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1 py-4">
          <p className="font-arabic">تطبيق الشرطة الفلسطينية</p>
          <p>الإصدار 1.0.0</p>
          <p>© 2024 جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileWithHistory;