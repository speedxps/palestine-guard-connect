import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Globe, Save, CheckCircle } from 'lucide-react';
import { useTranslation, type Language } from '@/hooks/useLanguage';

export const LanguageSettings = () => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      setLanguage(selectedLanguage);
      
      toast({
        title: `✅ ${t('language.changed')}`,
        description: t('language.changed_success'),
      });

      setIsOpen(false);
      
      // إعادة تحميل الصفحة لتطبيق التغييرات
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving language:', error);
      toast({
        title: `❌ ${t('general.error')}`,
        description: "فشل في تغيير اللغة",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold font-arabic text-foreground">
                {t('language.title')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('language.arabic')} / {t('language.english')}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {language === 'ar' ? t('language.arabic') : t('language.english')}
            </div>
          </div>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-arabic">{t('language.title')} - إعدادات</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold font-arabic">اختر لغة التطبيق</h4>
            
            <RadioGroup
              value={selectedLanguage}
              onValueChange={(value: Language) => setSelectedLanguage(value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 space-x-reverse p-3 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="ar" id="ar" />
                <Label htmlFor="ar" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold font-arabic">{t('language.arabic')}</div>
                      <div className="text-sm text-muted-foreground">اللغة الافتراضية للتطبيق</div>
                    </div>
                    {language === 'ar' && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse p-3 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="en" id="en" />
                <Label htmlFor="en" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{t('language.english')}</div>
                      <div className="text-sm text-muted-foreground">Switch to English interface</div>
                    </div>
                    {language === 'en' && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-arabic mb-1">
                  {t('language.note')}
                </p>
                {language === 'ar' && (
                  <p>
                    Note: The app will reload to apply the new language.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="flex-1 font-arabic"
          >
            {t('general.cancel')}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || selectedLanguage === language}
            className="flex-1 font-arabic"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? t('language.applying') : t('language.apply')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};