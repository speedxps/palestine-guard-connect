import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, Save, Trash2 } from 'lucide-react';

interface PrivacySettings {
  profileVisibility: boolean;
  dataCollection: boolean;
  locationTracking: boolean;
  analyticsOptIn: boolean;
  autoLogout: boolean;
  sessionTimeout: number;
  clearDataOnLogout: boolean;
}

export const PrivacySettings = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: true,
    dataCollection: false,
    locationTracking: true,
    analyticsOptIn: false,
    autoLogout: true,
    sessionTimeout: 30,
    clearDataOnLogout: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('privacySettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('privacySettings', JSON.stringify(settings));
      
      toast({
        title: "✅ تم حفظ إعدادات الخصوصية",
        description: "تم تطبيق إعدادات الخصوصية بنجاح",
      });

      setIsOpen(false);
    } catch (error: any) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "❌ خطأ في الحفظ",
        description: "فشل في حفظ إعدادات الخصوصية",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = async () => {
    try {
      // Clear sensitive data
      localStorage.removeItem('savedCredentials');
      localStorage.removeItem('biometricEnabled');
      localStorage.removeItem('notificationSettings');
      sessionStorage.clear();
      
      toast({
        title: "✅ تم مسح البيانات",
        description: "تم مسح جميع البيانات المحفوظة بنجاح",
      });
    } catch (error: any) {
      console.error('Error clearing data:', error);
      toast({
        title: "❌ خطأ",
        description: "فشل في مسح البيانات",
        variant: "destructive",
      });
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card 
          className="glass-card p-4 cursor-pointer hover:bg-card/90 transition-all duration-300"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold font-arabic text-foreground">
                الخصوصية
              </h4>
              <p className="text-sm text-muted-foreground">
                إدارة خصوصية البيانات
              </p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic">إعدادات الخصوصية</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* الرؤية والمشاركة */}
          <div className="space-y-4">
            <h4 className="font-semibold font-arabic flex items-center gap-2">
              <Eye className="h-4 w-4" />
              الرؤية والمشاركة
            </h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="profileVisibility" className="font-arabic">إظهار الملف الشخصي</Label>
              <Switch
                id="profileVisibility"
                checked={settings.profileVisibility}
                onCheckedChange={(checked) => updateSetting('profileVisibility', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="dataCollection" className="font-arabic">السماح بجمع البيانات</Label>
              <Switch
                id="dataCollection"
                checked={settings.dataCollection}
                onCheckedChange={(checked) => updateSetting('dataCollection', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="locationTracking" className="font-arabic">تتبع الموقع الجغرافي</Label>
              <Switch
                id="locationTracking"
                checked={settings.locationTracking}
                onCheckedChange={(checked) => updateSetting('locationTracking', checked)}
              />
            </div>
          </div>

          {/* الأمان والجلسات */}
          <div className="space-y-4 border-t border-border/50 pt-4">
            <h4 className="font-semibold font-arabic">الأمان والجلسات</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="autoLogout" className="font-arabic">تسجيل خروج تلقائي</Label>
              <Switch
                id="autoLogout"
                checked={settings.autoLogout}
                onCheckedChange={(checked) => updateSetting('autoLogout', checked)}
              />
            </div>

            {settings.autoLogout && (
              <div className="flex items-center justify-between">
                <Label htmlFor="sessionTimeout" className="font-arabic">مهلة الجلسة (دقيقة)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateSetting('sessionTimeout', Math.max(5, settings.sessionTimeout - 5))}
                    className="h-8 w-8 p-0"
                  >
                    -
                  </Button>
                  <span className="text-sm font-medium min-w-[3rem] text-center">
                    {settings.sessionTimeout}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateSetting('sessionTimeout', Math.min(120, settings.sessionTimeout + 5))}
                    className="h-8 w-8 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Label htmlFor="clearDataOnLogout" className="font-arabic">مسح البيانات عند الخروج</Label>
              <Switch
                id="clearDataOnLogout"
                checked={settings.clearDataOnLogout}
                onCheckedChange={(checked) => updateSetting('clearDataOnLogout', checked)}
              />
            </div>
          </div>

          {/* إدارة البيانات */}
          <div className="space-y-4 border-t border-border/50 pt-4">
            <h4 className="font-semibold font-arabic flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              إدارة البيانات
            </h4>
            
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-xs text-destructive font-arabic mb-2">
                سيتم حذف جميع البيانات المحفوظة محلياً
              </p>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={clearAllData}
                className="w-full font-arabic"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                مسح جميع البيانات
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="flex-1 font-arabic"
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 font-arabic"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};