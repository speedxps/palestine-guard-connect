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
          {/* رسالة التحذير الرئيسية */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-red-900">
                  تم رفض محاولة تسجيل الدخول
                </h3>
                <p className="text-red-800 leading-relaxed">
                  نظام الشرطة الفلسطينية متاح فقط من داخل فلسطين. تم اكتشاف محاولة دخول من خارج
                  الأراضي الفلسطينية وتم حظرها تلقائياً لأسباب أمنية.
                </p>
              </div>
            </div>
          </div>

          {/* معلومات الموقع */}
          {location && (
            <div className="bg-white border border-red-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                معلومات الموقع المكتشف
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-medium">الدولة:</span>
                  <span className="bg-red-100 px-3 py-1 rounded-full">{location.country}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-medium">المدينة:</span>
                  <span className="bg-red-100 px-3 py-1 rounded-full">{location.city}</span>
                </div>
              </div>
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="bg-white border border-red-200 rounded-lg p-4 space-y-3">
            {ip && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">عنوان IP:</span>
                <code className="bg-gray-100 px-3 py-1 rounded font-mono text-gray-800">{ip}</code>
              </div>
            )}
            {timestamp && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  وقت المحاولة:
                </span>
                <span className="text-gray-800">{new Date(timestamp).toLocaleString('ar-PS')}</span>
              </div>
            )}
          </div>


          {/* تحميل تطبيق الوصول الخارجي */}
          {!loading && downloadFile && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileDown className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 text-lg mb-2">
                    📱 تطبيق خاص للإداريين خارج فلسطين
                  </h4>
                  <p className="text-blue-800 text-sm mb-4 leading-relaxed">
                    إذا كنت مسؤولاً أو إدارياً معتمداً وتحتاج للوصول للنظام من خارج فلسطين،
                    يمكنك تحميل التطبيق الخاص المخصص للوصول الآمن عن بُعد. هذا التطبيق مصرح به
                    للمستخدمين المعتمدين فقط.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{downloadFile.file_name}</span>
                      <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        الإصدار {downloadFile.version}
                      </span>
                    </div>
                    {downloadFile.description && (
                      <p className="text-sm text-gray-600 mb-3">{downloadFile.description}</p>
                    )}
                  </div>

                  <Button
                    onClick={() => window.open(getDownloadUrl(downloadFile.file_path), '_blank')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <Download className="ml-2 h-5 w-5" />
                    تحميل التطبيق الآن
                  </Button>

                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3">
                    <p className="text-xs text-amber-800">
                      ⚠️ تنبيه: هذا التطبيق مخصص فقط للإداريين المعتمدين. استخدامه دون تصريح
                      يعتبر مخالفة أمنية ويعرضك للمساءلة القانونية.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* معلومات الاتصال */}
          <div className="text-center pt-4 border-t border-red-200">
            <p className="text-sm text-gray-600 mb-2">
              للاستفسارات أو الإبلاغ عن مشاكل تقنية
            </p>
            <p className="text-sm font-semibold text-gray-800">
              قسم الدعم الفني - الشرطة الفلسطينية
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginBlocked;
