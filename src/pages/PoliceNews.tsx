import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useLanguage';
import { ArrowLeft, ExternalLink, Newspaper, Facebook } from 'lucide-react';

// Facebook SDK types
declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

const PoliceNews = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Load Facebook SDK
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/ar_AR/sdk.js#xfbml=1&version=v18.0';
      script.async = true;
      document.body.appendChild(script);

      // Initialize Facebook SDK
      window.fbAsyncInit = function() {
        (window as any).FB.init({
          appId: 'your-app-id', // يمكن تركه فارغ للاستخدام العام
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-card/30 border-b border-border/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="rounded-full hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                  <Newspaper className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold font-arabic text-foreground">
                    أخبار الشرطة الفلسطينية
                  </h1>
                  <p className="text-sm text-muted-foreground font-arabic">
                    آخر الأخبار والتحديثات
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 pb-32 space-y-6">
        {/* Facebook Page Plugin Section */}
        <Card className="overflow-hidden bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-sm border border-border/30 shadow-xl">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Facebook className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-arabic text-foreground">
                  صفحة الشرطة الفلسطينية
                </h2>
                <p className="text-sm text-muted-foreground font-arabic">
                  تابع آخر المنشورات والأخبار الرسمية
                </p>
              </div>
            </div>

            {/* Facebook Page Plugin */}
            <div className="w-full bg-white rounded-lg overflow-hidden shadow-lg">
            <div 
                className="fb-page" 
                data-href="https://www.facebook.com/Palestinianpolice1" 
                data-tabs="timeline"
                data-width="500" 
                data-height="600" 
                data-small-header="false" 
                data-adapt-container-width="true" 
                data-hide-cover="false" 
                data-show-facepile="true"
              >
                <blockquote 
                  cite="https://www.facebook.com/Palestinianpolice1" 
                  className="fb-xfbml-parse-ignore p-6 text-center"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    <p className="text-muted-foreground font-arabic">
                      جاري تحميل منشورات الشرطة الفلسطينية...
                    </p>
                    <a 
                      href="https://www.facebook.com/Palestinianpolice1" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline font-arabic"
                    >
                      زيارة الصفحة على فيسبوك
                    </a>
                  </div>
                </blockquote>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Links Section */}
        <div className="grid gap-4">
          <Card className="p-4 bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-sm border border-border/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Facebook className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium font-arabic text-foreground">
                    زيارة الصفحة الرسمية
                  </p>
                  <p className="text-sm text-muted-foreground font-arabic">
                    تفاعل مع المنشورات والتعليقات
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://www.facebook.com/Palestinianpolice1', '_blank')}
                className="text-blue-500 hover:bg-blue-500/10"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-card/60 to-card/40 backdrop-blur-sm border border-border/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium font-arabic text-foreground">
                    الأخبار الداخلية
                  </p>
                  <p className="text-sm text-muted-foreground font-arabic">
                    تصفح الأخبار من داخل التطبيق
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/feed')}
                className="text-primary hover:bg-primary/10"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Note Section */}
        <Card className="p-4 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Newspaper className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium font-arabic text-foreground mb-1">
                ملاحظة مهمة
              </p>
              <p className="text-muted-foreground font-arabic leading-relaxed">
                يتم تحديث محتوى هذه الصفحة تلقائياً من صفحة الشرطة الفلسطينية الرسمية على فيسبوك.
                للحصول على أفضل تجربة، تأكد من اتصالك بالإنترنت.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PoliceNews;