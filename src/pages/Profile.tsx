import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  User, 
  Shield, 
  LogOut,
  Settings,
  Bell,
  Lock,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

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

  const menuItems = [
    {
      icon: Settings,
      title: 'إعدادات الحساب',
      subtitle: 'تعديل البيانات الشخصية',
      action: () => {}
    },
    {
      icon: Bell,
      title: 'الإشعارات',
      subtitle: 'إدارة إعدادات الإشعارات',
      action: () => {}
    },
    {
      icon: Lock,
      title: 'الأمان والخصوصية',
      subtitle: 'كلمة المرور والأمان',
      action: () => {}
    },
    {
      icon: Globe,
      title: 'اللغة',
      subtitle: 'العربية / English',
      action: () => {}
    }
  ];

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-arabic">الملف الشخصي</h1>
            <p className="text-sm text-muted-foreground">Profile</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-6">
        {/* User Info Card */}
        <Card className="glass-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold font-arabic text-foreground">
                {user?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
              <Badge className={getRoleColor(user?.role || 'user')}>
                {getRoleText(user?.role || 'user')}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">12</div>
              <div className="text-xs text-muted-foreground font-arabic">البلاغات</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">8</div>
              <div className="text-xs text-muted-foreground font-arabic">المهام</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">45</div>
              <div className="text-xs text-muted-foreground font-arabic">النقاط</div>
            </div>
          </div>
        </Card>

        {/* Security Badge */}
        <Card className="glass-card p-4 border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-green-400" />
            <div>
              <h4 className="font-semibold text-green-400">حساب محقق</h4>
              <p className="text-xs text-green-400/80">
                تم التحقق من هويتك بنجاح
              </p>
            </div>
          </div>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={index}
                className="glass-card p-4 cursor-pointer hover:bg-card/90 transition-all duration-300"
                onClick={item.action}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold font-arabic text-foreground">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Logout Button */}
        <Card className="glass-card p-4">
          <Button
            variant="destructive"
            size="lg"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            تسجيل الخروج
          </Button>
        </Card>

        {/* App Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>تطبيق الشرطة الفلسطينية</p>
          <p>الإصدار 1.0.0</p>
          <p>© 2024 جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;