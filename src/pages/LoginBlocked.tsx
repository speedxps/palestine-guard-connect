import React, { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Clock, Shield, Download, FileDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import policeLogo from '@/assets/police-logo.png';
import { supabase } from '@/integrations/supabase/client';

interface LoginBlockedProps {
  location?: {
    country: string;
    city: string;
  };
  ip?: string;
  timestamp?: string;
}

interface ExternalAccessFile {
  id: string;
  file_name: string;
  file_path: string;
  version: string;
  description: string;
}

const LoginBlocked: React.FC<LoginBlockedProps> = ({ location, ip, timestamp }) => {
  const [downloadFile, setDownloadFile] = useState<ExternalAccessFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveFile();
    
    // منع أي محاولة للتنقل أو العودة
    const preventNavigation = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };
    
    // إضافة entry جديد للـ history لمنع العودة
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventNavigation);
    
    // منع refresh بدون تأكيد
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('popstate', preventNavigation);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const fetchActiveFile = async () => {
    try {
      const { data, error } = await supabase
        .from('external_access_files')
        .select('*')
        .eq('is_active', true)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching file:', error);
      } else if (data) {
        setDownloadFile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDownloadUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('external-access-apps')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-2xl border-red-200 shadow-2xl">
        <CardHeader className="text-center space-y-3 sm:space-y-4 pb-4 sm:pb-8 px-3 sm:px-6">
          <div className="flex justify-center">
            <img src={policeLogo} alt="Police Logo" className="w-16 h-16 sm:w-24 sm:h-24 object-contain" />
          </div>
          
          <div className="flex justify-center">
            <div className="bg-red-100 p-3 sm:p-4 rounded-full">
              <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-red-600" />
            </div>
          </div>
          
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 px-2" style={{ direction: 'rtl' }}>
            ⛔ تم حظر محاولة الدخول
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6" style={{ direction: 'rtl' }}>
          {/* رسالة ترحيبية */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">
                  مرحباً بك في نظام الوصول الآمن
                </h3>
                <p className="text-blue-800 leading-relaxed text-sm sm:text-base md:text-lg">
                  نحن سعداء بخدمتك! تم اكتشاف أنك تحاول الوصول إلى النظام من خارج فلسطين.
                  لضمان أمان بياناتك وسلامة عملك، قمنا بتطوير تطبيق خاص ومشفر يتيح لك
                  الوصول الآمن والسريع من أي مكان في العالم.
                </p>
                <div className="bg-white/60 rounded-lg p-3 sm:p-4 mt-2 sm:mt-3">
                  <p className="text-blue-900 font-semibold flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-xl sm:text-2xl">✨</span>
                    هذا التطبيق مصمم خصيصاً لراحتك وأمانك
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* مزايا التطبيق */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 sm:p-6">
            <h4 className="font-bold text-green-900 text-base sm:text-lg md:text-xl mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🎯</span>
              لماذا تحتاج هذا التطبيق؟
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2 sm:gap-3 bg-white/70 rounded-lg p-2 sm:p-3">
                <span className="text-green-600 text-lg sm:text-xl mt-0.5 sm:mt-1">✓</span>
                <div>
                  <p className="font-semibold text-green-900 text-sm sm:text-base">اتصال مشفر 256-bit</p>
                  <p className="text-xs sm:text-sm text-green-800">جميع بياناتك محمية بأعلى معايير التشفير العالمية</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 bg-white/70 rounded-lg p-2 sm:p-3">
                <span className="text-green-600 text-lg sm:text-xl mt-0.5 sm:mt-1">✓</span>
                <div>
                  <p className="font-semibold text-green-900 text-sm sm:text-base">وصول سريع ومباشر</p>
                  <p className="text-xs sm:text-sm text-green-800">لا حاجة لإعدادات معقدة - فقط حمّل وابدأ العمل فوراً</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 bg-white/70 rounded-lg p-2 sm:p-3">
                <span className="text-green-600 text-lg sm:text-xl mt-0.5 sm:mt-1">✓</span>
                <div>
                  <p className="font-semibold text-green-900 text-sm sm:text-base">متوافق مع جميع الأنظمة</p>
                  <p className="text-xs sm:text-sm text-green-800">يعمل على Windows, Mac, Linux بكفاءة عالية</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 bg-white/70 rounded-lg p-2 sm:p-3">
                <span className="text-green-600 text-lg sm:text-xl mt-0.5 sm:mt-1">✓</span>
                <div>
                  <p className="font-semibold text-green-900 text-sm sm:text-base">دعم فني 24/7</p>
                  <p className="text-xs sm:text-sm text-green-800">فريقنا جاهز لمساعدتك في أي وقت</p>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات الموقع بشكل إيجابي */}
          {location && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-3 sm:p-5">
              <h4 className="font-bold text-purple-900 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                نحن نعرف موقعك لحمايتك بشكل أفضل
              </h4>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-white/70 rounded-lg p-2 sm:p-3">
                  <span className="text-xs sm:text-sm text-purple-700 font-medium">📍 الدولة:</span>
                  <p className="text-purple-900 font-bold text-sm sm:text-base md:text-lg">{location.country}</p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 sm:p-3">
                  <span className="text-xs sm:text-sm text-purple-700 font-medium">🌆 المدينة:</span>
                  <p className="text-purple-900 font-bold text-sm sm:text-base md:text-lg">{location.city}</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-purple-800 mt-2 sm:mt-3 bg-white/50 rounded p-2">
                💡 نستخدم هذه المعلومات لتوفير أفضل خدمة اتصال لك
              </p>
            </div>
          )}


          {/* قسم التحميل الرئيسي */}
          {!loading && downloadFile && (
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-3 border-amber-400 rounded-xl p-4 sm:p-6 md:p-8 shadow-xl">
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-3 sm:mb-4 animate-pulse">
                  <Download className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h4 className="font-bold text-amber-900 text-lg sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-3 px-2">
                  🎉 حمّل التطبيق الآن وابدأ العمل!
                </h4>
                <p className="text-amber-800 text-sm sm:text-base md:text-lg leading-relaxed mb-1 sm:mb-2 px-2">
                  التطبيق جاهز وينتظرك! صُمم خصيصاً لتسهيل عملك وتوفير وقتك
                </p>
                <p className="text-amber-700 font-semibold text-xs sm:text-sm md:text-base px-2">
                  ✨ آلاف الموظفين يستخدمونه يومياً بنجاح
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 shadow-lg border-2 border-amber-300">
                <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileDown className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-gray-900 text-sm sm:text-base md:text-lg block truncate">{downloadFile.file_name}</span>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">الإصدار الأحدث والأكثر أماناً</p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-bold shadow-md whitespace-nowrap">
                    v{downloadFile.version} ⭐
                  </span>
                </div>
                
                {downloadFile.description && (
                  <div className="bg-blue-50 rounded-lg p-2 sm:p-3 md:p-4 mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-blue-900 font-medium">{downloadFile.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 sm:p-3 text-center border border-green-200">
                    <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">🔒</div>
                    <p className="text-[10px] sm:text-xs font-semibold text-green-900">آمن 100%</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 sm:p-3 text-center border border-blue-200">
                    <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">⚡</div>
                    <p className="text-[10px] sm:text-xs font-semibold text-blue-900">سريع جداً</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 sm:p-3 text-center border border-purple-200">
                    <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">✨</div>
                    <p className="text-[10px] sm:text-xs font-semibold text-purple-900">سهل الاستخدام</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => window.open(getDownloadUrl(downloadFile.file_path), '_blank')}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white text-base sm:text-lg md:text-xl py-5 sm:py-6 md:py-7 shadow-2xl transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                <Download className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 animate-bounce" />
                تحميل مجاني - ابدأ الآن! 🚀
              </Button>

              <div className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl">💪</span>
                  <div>
                    <p className="font-bold text-blue-900 mb-1 text-sm sm:text-base">انضم لآلاف المستخدمين الناجحين!</p>
                    <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                      التطبيق يوفر لك الوقت والجهد، ويمنحك القدرة على العمل من أي مكان بكل سهولة وأمان.
                      لا تفوت هذه الفرصة للاستفادة من تقنياتنا المتطورة!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* معلومات الدعم */}
          <div className="text-center pt-4 sm:pt-6 border-t-2 border-blue-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-blue-700 mb-2 sm:mb-3 font-medium">
                💬 هل تحتاج مساعدة؟ نحن هنا من أجلك!
              </p>
              <p className="text-base sm:text-lg font-bold text-blue-900 mb-1">
                قسم الدعم الفني - الشرطة الفلسطينية
              </p>
              <p className="text-xs sm:text-sm text-blue-600">
                فريقنا جاهز لمساعدتك على مدار الساعة
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginBlocked;
