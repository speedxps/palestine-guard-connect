import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Bell, Save } from 'lucide-react';

interface NotificationSettings {
  incidents: boolean;
  tasks: boolean;
  cybercrime: boolean;
  system: boolean;
  email: boolean;
  push: boolean;
}

export const NotificationSettings = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    incidents: true,
    tasks: true,
    cybercrime: true,
    system: true,
    email: true,
    push: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // محاولة تحميل الإعدادات من localStorage
    try {
      const saved = localStorage.getItem('notificationSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // حفظ الإعدادات في localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      
      toast({
        title: "✅ تم حفظ الإعدادات",
        description: "تم تحديث إعدادات الإشعارات بنجاح",
      });

      setIsOpen(false);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "❌ خطأ في الحفظ",
        description: "فشل في حفظ إعدادات الإشعارات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
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
            <div className="p-2 bg-primary/20 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold font-arabic text-foreground">
                الإشعارات
              </h4>
              <p className="text-sm text-muted-foreground">
                إدارة إعدادات الإشعارات
              </p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic">إعدادات الإشعارات</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* أنواع الإشعارات */}
          <div className="space-y-4">
            <h4 className="font-semibold font-arabic">أنواع الإشعارات</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="incidents" className="font-arabic">البلاغات الجديدة</Label>
              <Switch
                id="incidents"
                checked={settings.incidents}
                onCheckedChange={(checked) => updateSetting('incidents', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="tasks" className="font-arabic">المهام المسندة</Label>
              <Switch
                id="tasks"
                checked={settings.tasks}
                onCheckedChange={(checked) => updateSetting('tasks', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="cybercrime" className="font-arabic">الجرائم الإلكترونية</Label>
              <Switch
                id="cybercrime"
                checked={settings.cybercrime}
                onCheckedChange={(checked) => updateSetting('cybercrime', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="system" className="font-arabic">إشعارات النظام</Label>
              <Switch
                id="system"
                checked={settings.system}
                onCheckedChange={(checked) => updateSetting('system', checked)}
              />
            </div>
          </div>

          {/* طرق التسليم */}
          <div className="space-y-4 border-t border-border/50 pt-4">
            <h4 className="font-semibold font-arabic">طرق التسليم</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="font-arabic">البريد الإلكتروني</Label>
              <Switch
                id="email"
                checked={settings.email}
                onCheckedChange={(checked) => updateSetting('email', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push" className="font-arabic">الإشعارات المنبثقة</Label>
              <Switch
                id="push"
                checked={settings.push}
                onCheckedChange={(checked) => updateSetting('push', checked)}
              />
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