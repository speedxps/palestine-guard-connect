import React from 'react';
import { AlertTriangle, MapPin, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import policeLogo from '@/assets/police-logo.png';

interface LoginBlockedProps {
  location?: {
    country: string;
    city: string;
  };
  ip?: string;
  timestamp?: string;
}

const LoginBlocked: React.FC<LoginBlockedProps> = ({ location, ip, timestamp }) => {
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

          {/* إجراءات تم اتخاذها */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">
              🔒 الإجراءات الأمنية المتخذة
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>تم تسجيل محاولة الدخول في نظام المراقبة الأمنية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>تم إرسال تنبيه عاجل لإدارة النظام وقسم الجرائم الإلكترونية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>تم حفظ جميع تفاصيل المحاولة للمراجعة والتحقيق</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>سيتم اتخاذ الإجراءات اللازمة في حال كانت هذه محاولة اختراق</span>
              </li>
            </ul>
          </div>

          {/* رسالة للمستخدمين الشرعيين */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">
              💡 إذا كنت موظفاً شرعياً
            </h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              إذا كنت موظفاً في الشرطة الفلسطينية وتحاول الدخول من خارج فلسطين لأسباب رسمية،
              يرجى التواصل مع إدارة النظام أو قسم تكنولوجيا المعلومات للحصول على تصريح خاص
              للوصول عن بُعد.
            </p>
          </div>

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
