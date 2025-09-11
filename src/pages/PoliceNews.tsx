import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useLanguage';
import { ArrowLeft, ExternalLink, Newspaper, Facebook, AlertCircle, RefreshCcw } from 'lucide-react';

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
  const [fbLoaded, setFbLoaded] = useState(false);
  const [fbError, setFbError] = useState(false);

  useEffect(() => {
    // تحديد وقت انتظار لتحميل فيسبوك
    const timeout = setTimeout(() => {
      if (!fbLoaded) {
        console.log('Facebook plugin timeout - showing fallback');
        setFbError(true);
      }
    }, 8000);

    // تحميل Facebook SDK
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/ar_AR/sdk.js#xfbml=1&version=v19.0';
      script.async = true;
      
      script.onload = () => {
        console.log('Facebook SDK loaded');
        setFbLoaded(true);
        clearTimeout(timeout);
      };
      
      script.onerror = () => {
        console.error('Facebook SDK failed to load');
        setFbError(true);
        clearTimeout(timeout);
      };
      
      document.body.appendChild(script);

      window.fbAsyncInit = function() {
        try {
          (window as any).FB.init({
            xfbml: true,
            version: 'v19.0'
          });
          (window as any).FB.XFBML.parse();
          setFbLoaded(true);
          clearTimeout(timeout);
        } catch (error) {
          console.error('Facebook init error:', error);
          setFbError(true);
          clearTimeout(timeout);
        }
      };
    } else {
      setFbLoaded(true);
      clearTimeout(timeout);
    }

    return () => clearTimeout(timeout);
  }, [fbLoaded]);

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

            {/* Facebook Page Plugin or Fallback */}
            <div className="w-full bg-white rounded-lg overflow-hidden shadow-lg min-h-[600px]">
              {!fbError && (
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
                    className="fb-xfbml-parse-ignore p-8 text-center"
                  >
                    <div className="flex flex-col items-center gap-6">
                      <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                      <div className="space-y-3">
                        <p className="text-gray-700 font-arabic font-semibold text-lg">
                          جاري تحميل منشورات الشرطة الفلسطينية...
                        </p>
                        <p className="text-gray-500 font-arabic text-sm">
                          الرجاء الانتظار قليلاً
                        </p>
                      </div>
                      <a 
                        href="https://www.facebook.com/Palestinianpolice1" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 font-arabic text-sm underline"
                      >
                        أو قم بزيارة الصفحة مباشرة
                      </a>
                    </div>
                  </blockquote>
                </div>
              )}

              {fbError && (
                <div className="p-8 text-center space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <Facebook className="h-10 w-10 text-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold font-arabic text-gray-800">
                        صفحة الشرطة الفلسطينية الرسمية
                      </h3>
                      <p className="text-gray-600 font-arabic">
                        تابع آخر الأخبار والإعلانات الرسمية
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4 text-right">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                      <div>
                        <p className="font-semibold font-arabic text-gray-800">الأخبار والإعلانات</p>
                        <p className="text-sm text-gray-600 font-arabic">تابع آخر الأخبار والبيانات الرسمية من الشرطة الفلسطينية</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                      <div>
                        <p className="font-semibold font-arabic text-gray-800">الخدمات والإجراءات</p>
                        <p className="text-sm text-gray-600 font-arabic">معلومات حول الخدمات المتاحة والإجراءات المطلوبة</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mt-1 flex-shrink-0"></div>
                      <div>
                        <p className="font-semibold font-arabic text-gray-800">التواصل والاستفسار</p>
                        <p className="text-sm text-gray-600 font-arabic">إمكانية التواصل المباشر مع الشرطة للاستفسارات</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => window.open('https://www.facebook.com/Palestinianpolice1', '_blank')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-arabic text-lg px-8 py-3"
                  >
                    <Facebook className="h-5 w-5 ml-2" />
                    زيارة الصفحة على فيسبوك
                  </Button>
                </div>
              )}
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