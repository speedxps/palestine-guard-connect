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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Set a timeout to detect if Facebook plugin fails to load
    timeoutId = setTimeout(() => {
      console.log('Facebook plugin timeout - switching to fallback');
      setFbError(true);
      setLoading(false);
    }, 10000); // 10 seconds timeout

    // Load Facebook SDK
    if (!document.getElementById('facebook-jssdk')) {
      console.log('Loading Facebook SDK...');
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/ar_AR/sdk.js#xfbml=1&version=v19.0&appId=1234567890123456';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('Facebook SDK loaded successfully');
        clearTimeout(timeoutId);
        setFbLoaded(true);
        setLoading(false);
      };
      
      script.onerror = () => {
        console.error('Failed to load Facebook SDK');
        clearTimeout(timeoutId);
        setFbError(true);
        setLoading(false);
      };
      
      document.body.appendChild(script);

      // Initialize Facebook SDK
      window.fbAsyncInit = function() {
        console.log('Initializing Facebook SDK...');
        try {
          (window as any).FB.init({
            appId: '1234567890123456', // Generic App ID for public pages
            cookie: true,
            xfbml: true,
            version: 'v19.0'
          });
          
          (window as any).FB.XFBML.parse();
          console.log('Facebook SDK initialized successfully');
          setFbLoaded(true);
          setLoading(false);
          clearTimeout(timeoutId);
        } catch (error) {
          console.error('Error initializing Facebook SDK:', error);
          setFbError(true);
          setLoading(false);
          clearTimeout(timeoutId);
        }
      };
    } else {
      // SDK already loaded
      console.log('Facebook SDK already exists');
      if (window.FB) {
        try {
          (window as any).FB.XFBML.parse();
          setFbLoaded(true);
          setLoading(false);
          clearTimeout(timeoutId);
        } catch (error) {
          console.error('Error parsing Facebook content:', error);
          setFbError(true);
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleRetry = () => {
    setFbError(false);
    setLoading(true);
    setFbLoaded(false);
    
    // Remove existing script and reload
    const existingScript = document.getElementById('facebook-jssdk');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Trigger useEffect again
    window.location.reload();
  };

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
            <div className="w-full bg-white rounded-lg overflow-hidden shadow-lg min-h-[400px]">
              {loading && (
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    <p className="text-gray-600 font-arabic">
                      جاري تحميل منشورات الشرطة الفلسطينية...
                    </p>
                  </div>
                </div>
              )}

              {fbError && (
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-red-100 rounded-full">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-800 font-arabic font-semibold">
                        تعذر تحميل منشورات الفيسبوك
                      </p>
                      <p className="text-gray-600 font-arabic text-sm">
                        يمكنك زيارة الصفحة مباشرة على فيسبوك لمشاهدة آخر الأخبار
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => window.open('https://www.facebook.com/Palestinianpolice1', '_blank')}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-arabic"
                      >
                        <Facebook className="h-4 w-4 mr-2" />
                        زيارة الصفحة
                      </Button>
                      <Button
                        onClick={handleRetry}
                        variant="outline"
                        className="font-arabic"
                      >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        إعادة المحاولة
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {fbLoaded && !fbError && (
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
                    <a 
                      href="https://www.facebook.com/Palestinianpolice1" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline font-arabic"
                    >
                      شرطة فلسطين
                    </a>
                  </blockquote>
                </div>
              )}

              {/* Alternative content when Facebook plugin is not available */}
              {!loading && !fbLoaded && !fbError && (
                <div className="p-8 space-y-6">
                  <div className="text-center">
                    <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
                      <Facebook className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold font-arabic text-gray-800 mb-2">
                      صفحة الشرطة الفلسطينية الرسمية
                    </h3>
                    <p className="text-gray-600 font-arabic">
                      تابع آخر الأخبار والإعلانات الرسمية من الشرطة الفلسطينية
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-semibold font-arabic text-gray-800">الأخبار والإعلانات</p>
                        <p className="text-sm text-gray-600 font-arabic">تابع آخر الأخبار والبيانات الرسمية</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-semibold font-arabic text-gray-800">الخدمات المتاحة</p>
                        <p className="text-sm text-gray-600 font-arabic">معلومات حول الخدمات والإجراءات</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-semibold font-arabic text-gray-800">التواصل المباشر</p>
                        <p className="text-sm text-gray-600 font-arabic">إمكانية التواصل والاستفسار</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      onClick={() => window.open('https://www.facebook.com/Palestinianpolice1', '_blank')}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-arabic"
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      زيارة الصفحة على فيسبوك
                    </Button>
                  </div>
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