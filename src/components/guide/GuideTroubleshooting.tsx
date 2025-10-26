import React from 'react';
import { AlertTriangle, Wifi, MapPin, Image, Zap, Lock, RefreshCw, HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const GuideTroubleshooting: React.FC = () => {
  const problems = [
    {
      icon: Zap,
      problem: "التطبيق لا يعمل؟",
      solutions: [
        "أعد تشغيل المتصفح بالكامل",
        "امسح ذاكرة التخزين المؤقت (Cache) من إعدادات المتصفح",
        "تحقق من تحديث المتصفح لآخر إصدار",
        "جرب متصفح آخر (Chrome، Firefox، Edge)",
        "تأكد من اتصالك بالإنترنت",
        "أعد تشغيل جهاز الكمبيوتر/الجوال",
      ]
    },
    {
      icon: MapPin,
      problem: "الموقع لا يظهر؟",
      solutions: [
        "تحقق من تفعيل GPS على جهازك",
        "امنح التطبيق صلاحيات الوصول للموقع في إعدادات المتصفح",
        "تأكد من وجودك في منطقة مفتوحة (ليس داخل مبنى)",
        "أعد تحميل الصفحة (F5)",
        "جرب تعطيل وإعادة تفعيل GPS",
        "على الجوال: تأكد من تفعيل 'الدقة العالية' في إعدادات الموقع",
      ]
    },
    {
      icon: Lock,
      problem: "لا أستطيع تسجيل الدخول؟",
      solutions: [
        "تحقق من كتابة اسم المستخدم وكلمة المرور بشكل صحيح",
        "تأكد من إيقاف Caps Lock",
        "استخدم خاصية 'نسيت كلمة المرور' لإعادة تعيينها",
        "تحقق من صلاحياتك مع مسؤول النظام",
        "امسح ملفات تعريف الارتباط (Cookies) من المتصفح",
        "تواصل مع الدعم الفني إذا كان الحساب معلق",
      ]
    },
    {
      icon: Image,
      problem: "الصور لا تظهر؟",
      solutions: [
        "تحقق من اتصالك بالإنترنت",
        "أعد تحميل الصفحة (F5 أو Ctrl+Shift+R)",
        "امسح ذاكرة التخزين المؤقت",
        "تحقق من حجم الصورة (يجب أن يكون أقل من 10 ميجابايت)",
        "تأكد من صيغة الصورة (JPG, PNG, GIF)",
        "جرب رفع الصورة مرة أخرى",
      ]
    },
    {
      icon: Wifi,
      problem: "رسالة 'خطأ في الاتصال بالخادم'؟",
      solutions: [
        "تحقق من اتصالك بالإنترنت",
        "تأكد من استقرار الاتصال (جرب تحميل موقع آخر)",
        "انتظر قليلاً (قد يكون الخادم مشغول)",
        "أعد تسجيل الدخول",
        "امسح ذاكرة التخزين المؤقت وملفات تعريف الارتباط",
        "تواصل مع الدعم الفني إذا استمرت المشكلة",
      ]
    },
    {
      icon: HardDrive,
      problem: "رسالة 'الذاكرة ممتلئة'؟",
      solutions: [
        "احذف الملفات والصور القديمة غير الضرورية",
        "امسح ذاكرة التخزين المؤقت للمتصفح",
        "أغلق التطبيقات الأخرى غير المستخدمة",
        "أعد تشغيل الجهاز لتحرير الذاكرة",
        "على الجوال: انقل الملفات إلى بطاقة SD أو السحابة",
        "احذف التطبيقات غير المستخدمة من جهازك",
      ]
    },
    {
      icon: RefreshCw,
      problem: "البيانات لا تتحدث تلقائياً؟",
      solutions: [
        "اسحب الصفحة للأسفل (Pull to Refresh)",
        "اضغط F5 لتحديث الصفحة",
        "تحقق من اتصالك بالإنترنت",
        "أعد تسجيل الدخول",
        "تأكد من تفعيل 'المزامنة التلقائية' في الإعدادات",
        "امسح ذاكرة التخزين المؤقت",
      ]
    },
    {
      icon: AlertTriangle,
      problem: "رسالة 'صلاحيات غير كافية'؟",
      solutions: [
        "هذا يعني أنك لا تمتلك صلاحية الوصول لهذه الصفحة/الميزة",
        "تواصل مع مسؤول النظام لطلب الصلاحيات",
        "تحقق من دورك الوظيفي في النظام",
        "تأكد من تسجيل الدخول بالحساب الصحيح",
        "قد تكون الصلاحية محددة لقسم معين فقط",
      ]
    }
  ];

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <AlertTriangle className="h-8 w-8" />
          حل المشاكل الشائعة
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Accordion type="single" collapsible className="w-full">
          {problems.map((item, index) => {
            const ProblemIcon = item.icon;
            return (
              <AccordionItem key={index} value={`problem-${index}`} className="border-b last:border-0">
                <AccordionTrigger className="text-right hover:no-underline py-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <ProblemIcon className="h-5 w-5 text-red-700" />
                    </div>
                    <span className="font-semibold text-gray-900">{item.problem}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6">
                  <div className="space-y-3">
                    <p className="font-semibold text-gray-900">الحلول المقترحة:</p>
                    <ol className="list-decimal list-inside space-y-2 pr-4 text-gray-700">
                      {item.solutions.map((solution, i) => (
                        <li key={i} className="leading-relaxed">{solution}</li>
                      ))}
                    </ol>
                    <div className="bg-yellow-50 border-r-4 border-yellow-400 p-3 rounded mt-4">
                      <p className="text-sm text-yellow-800">
                        💡 <strong>نصيحة:</strong> إذا لم تحل المشكلة بعد تجربة جميع الحلول، تواصل مع الدعم الفني.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};
