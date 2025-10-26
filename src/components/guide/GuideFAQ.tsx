import React from 'react';
import { HelpCircle, Lock, Globe, Bell, User, Upload, Printer, Zap, Shield, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const GuideFAQ: React.FC = () => {
  const faqs = [
    {
      icon: Lock,
      question: "ماذا أفعل إذا نسيت كلمة المرور؟",
      answer: (
        <div className="space-y-3 text-gray-700">
          <p className="font-semibold">الخطوات:</p>
          <ol className="list-decimal list-inside space-y-2 pr-4">
            <li>اذهب إلى صفحة تسجيل الدخول</li>
            <li>اضغط على "نسيت كلمة المرور؟"</li>
            <li>أدخل بريدك الإلكتروني المسجل</li>
            <li>ستصلك رسالة لإعادة تعيين كلمة المرور</li>
            <li>اتبع الرابط في الرسالة وأدخل كلمة مرور جديدة</li>
          </ol>
          <div className="bg-yellow-50 border-r-4 border-yellow-400 p-3 rounded mt-3">
            <p className="text-sm text-yellow-800">💡 <strong>نصيحة:</strong> تأكد من إدخال البريد الإلكتروني الصحيح المسجل في النظام.</p>
          </div>
        </div>
      )
    },
    {
      icon: Globe,
      question: "كيف أغير اللغة إلى الإنجليزية؟",
      answer: (
        <div className="space-y-3 text-gray-700">
          <p className="font-semibold">الخطوات:</p>
          <ol className="list-decimal list-inside space-y-2 pr-4">
            <li>اذهب إلى "الملف الشخصي" من القائمة الجانبية</li>
            <li>اضغط على تبويب "إعدادات اللغة"</li>
            <li>اختر "English" من القائمة المنسدلة</li>
            <li>سيتم تحديث اللغة تلقائياً</li>
          </ol>
          <div className="bg-blue-50 border-r-4 border-blue-400 p-3 rounded mt-3">
            <p className="text-sm text-blue-800">ℹ️ <strong>ملاحظة:</strong> التطبيق يدعم اللغتين العربية والإنجليزية بشكل كامل.</p>
          </div>
        </div>
      )
    },
    {
      icon: Bell,
      question: "لماذا لا تصلني الإشعارات؟",
      answer: (
        <div className="space-y-3 text-gray-700">
          <p className="font-semibold">الأسباب المحتملة والحلول:</p>
          <ol className="list-decimal list-inside space-y-2 pr-4">
            <li><strong>الإشعارات معطلة في المتصفح:</strong> تحقق من إعدادات المتصفح وفعّل الإشعارات</li>
            <li><strong>الإشعارات معطلة في النظام:</strong> اذهب إلى الملف الشخصي → إعدادات الإشعارات وفعّلها</li>
            <li><strong>لا تمتلك الصلاحيات:</strong> تواصل مع مسؤول النظام لمنحك صلاحيات الإشعارات</li>
            <li><strong>الإنترنت ضعيف:</strong> تحقق من اتصالك بالإنترنت</li>
          </ol>
          <div className="bg-red-50 border-r-4 border-red-400 p-3 rounded mt-3">
            <p className="text-sm text-red-800">⚠️ <strong>تحذير:</strong> الإشعارات الهامة مثل الطوارئ تتطلب تفعيل الإشعارات.</p>
          </div>
        </div>
      )
    },
    {
      icon: User,
      question: "كيف أقوم بتحديث بياناتي الشخصية؟",
      answer: (
        <div className="space-y-3 text-gray-700">
          <p className="font-semibold">الخطوات:</p>
          <ol className="list-decimal list-inside space-y-2 pr-4">
            <li>اذهب إلى "الملف الشخصي" من القائمة الجانبية</li>
            <li>اضغط على تبويب "إعدادات الحساب"</li>
            <li>قم بتحديث المعلومات التي تريدها (الاسم، البريد، الهاتف، الصورة)</li>
            <li>اضغط على "حفظ التغييرات"</li>
          </ol>
          <div className="bg-green-50 border-r-4 border-green-400 p-3 rounded mt-3">
            <p className="text-sm text-green-800">✅ <strong>مثال:</strong> يمكنك تغيير صورتك الشخصية برفع صورة جديدة.</p>
          </div>
        </div>
      )
    },
    {
      icon: Shield,
      question: "ما هي المصادقة الثنائية (2FA) وكيف أفعلها؟",
      answer: (
        <div className="space-y-3 text-gray-700">
          <p className="font-semibold">المصادقة الثنائية (2FA):</p>
          <p>هي طبقة حماية إضافية لحسابك. عند تفعيلها، ستحتاج إلى رمز إضافي (من تطبيق Google Authenticator مثلاً) بالإضافة إلى كلمة المرور.</p>
          
          <p className="font-semibold mt-4">خطوات التفعيل:</p>
          <ol className="list-decimal list-inside space-y-2 pr-4">
            <li>اذهب إلى الملف الشخصي → الأمان</li>
            <li>اضغط على "تفعيل المصادقة الثنائية"</li>
            <li>امسح رمز QR بتطبيق المصادقة (Google Authenticator)</li>
            <li>أدخل الرمز الذي يظهر في التطبيق</li>
            <li>احفظ رموز النسخ الاحتياطي في مكان آمن</li>
          </ol>
          <div className="bg-red-50 border-r-4 border-red-400 p-3 rounded mt-3">
            <p className="text-sm text-red-800">⚠️ <strong>مهم جداً:</strong> احفظ رموز النسخ الاحتياطي! إذا فقدت هاتفك، ستحتاجها لاستعادة الوصول.</p>
          </div>
        </div>
      )
    },
    {
      icon: Upload,
      question: "كيف أرفع ملف أو صورة؟",
      answer: (
        <div className="space-y-3 text-gray-700">
          <p className="font-semibold">الخطوات:</p>
          <ol className="list-decimal list-inside space-y-2 pr-4">
            <li>اذهب إلى الصفحة التي تريد رفع الملف فيها (مثل صفحة الحوادث)</li>
            <li>ابحث عن زر "إضافة ملف" أو "رفع صورة"</li>
            <li>اضغط على الزر واختر الملف من جهازك</li>
            <li>انتظر حتى اكتمال الرفع (سيظهر شريط تقدم)</li>
            <li>ستظهر الصورة/الملف بعد الرفع بنجاح</li>
          </ol>
          <div className="bg-yellow-50 border-r-4 border-yellow-400 p-3 rounded mt-3">
            <p className="text-sm text-yellow-800">💡 <strong>نصيحة:</strong> الحد الأقصى لحجم الملف هو 10 ميجابايت. الصيغ المدعومة: JPG, PNG, PDF.</p>
          </div>
        </div>
      )
    },
    {
      icon: Printer,
      question: "كيف أطبع تقرير؟",
      answer: (
        <div className="space-y-3 text-gray-700">
          <p className="font-semibold">الخطوات:</p>
          <ol className="list-decimal list-inside space-y-2 pr-4">
            <li>افتح الصفحة التي تحتوي على التقرير (مثل صفحة التقارير)</li>
            <li>ابحث عن زر "طباعة" أو أيقونة الطابعة في أعلى الصفحة</li>
            <li>اضغط على زر الطباعة</li>
            <li>ستفتح نافذة معاينة الطباعة</li>
            <li>اختر الطابعة واضبط الإعدادات (حجم الورق، الاتجاه، إلخ)</li>
            <li>اضغط على "طباعة"</li>
          </ol>
          <div className="bg-green-50 border-r-4 border-green-400 p-3 rounded mt-3">
            <p className="text-sm text-green-800">✅ <strong>بديل:</strong> يمكنك أيضاً "حفظ كـ PDF" لحفظ التقرير على جهازك.</p>
          </div>
        </div>
      )
    },
    {
      icon: Zap,
      question: "التطبيق بطيء، ما الحل؟",
      answer: (
        <div className="space-y-3 text-gray-700">
          <p className="font-semibold">الحلول المقترحة:</p>
          <ol className="list-decimal list-inside space-y-2 pr-4">
            <li><strong>امسح الذاكرة المؤقتة:</strong> اذهب إلى إعدادات المتصفح → الخصوصية → مسح بيانات التصفح</li>
            <li><strong>أعد تشغيل المتصفح:</strong> أغلق المتصفح بالكامل ثم افتحه من جديد</li>
            <li><strong>تحقق من الإنترنت:</strong> تأكد من أن سرعة الإنترنت جيدة</li>
            <li><strong>أغلق التبويبات الأخرى:</strong> إذا كان لديك تبويبات كثيرة مفتوحة، أغلق غير الضرورية</li>
            <li><strong>استخدم متصفح حديث:</strong> Chrome، Firefox، Edge (آخر إصدار)</li>
            <li><strong>تحقق من ذاكرة الجهاز:</strong> تأكد من أن جهازك لا يعاني من نقص في الذاكرة</li>
          </ol>
          <div className="bg-blue-50 border-r-4 border-blue-400 p-3 rounded mt-3">
            <p className="text-sm text-blue-800">ℹ️ <strong>ملاحظة:</strong> إذا استمرت المشكلة، تواصل مع الدعم الفني.</p>
          </div>
        </div>
      )
    },
    {
      icon: RefreshCw,
      question: "كيف أقوم بمزامنة البيانات؟",
      answer: (
        <div className="space-y-3 text-gray-700">
          <p className="font-semibold">المزامنة التلقائية:</p>
          <p>البيانات تتم مزامنتها تلقائياً عند الاتصال بالإنترنت. لا تحتاج لفعل أي شيء.</p>
          
          <p className="font-semibold mt-4">المزامنة اليدوية:</p>
          <ol className="list-decimal list-inside space-y-2 pr-4">
            <li>اسحب الصفحة للأسفل (Pull to Refresh) على الجوال</li>
            <li>أو اضغط F5 على الكمبيوتر</li>
            <li>أو اضغط على زر "تحديث" إن وجد</li>
          </ol>
          <div className="bg-green-50 border-r-4 border-green-400 p-3 rounded mt-3">
            <p className="text-sm text-green-800">✅ <strong>نصيحة:</strong> إذا كنت تعمل بدون إنترنت، ستتم المزامنة فور عودة الاتصال.</p>
          </div>
        </div>
      )
    },
    {
      icon: HelpCircle,
      question: "أين أجد المساعد الذكي (AI)؟",
      answer: (
        <div className="space-y-3 text-gray-700">
          <p className="font-semibold">الوصول للمساعد الذكي:</p>
          <ol className="list-decimal list-inside space-y-2 pr-4">
            <li>ابحث عن أيقونة "المساعد الذكي" في القائمة الجانبية</li>
            <li>أو اضغط على أيقونة الدردشة في أسفل الشاشة</li>
            <li>اكتب سؤالك أو استفسارك</li>
            <li>سيقوم المساعد بالإجابة فوراً</li>
          </ol>
          <div className="bg-purple-50 border-r-4 border-purple-400 p-3 rounded mt-3">
            <p className="text-sm text-purple-800">🤖 <strong>مثال:</strong> يمكنك سؤال المساعد "كيف أسجل حادث مروري؟" وسيرشدك خطوة بخطوة.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <HelpCircle className="h-8 w-8" />
          أسئلة شائعة (FAQ)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => {
            const FaqIcon = faq.icon;
            return (
              <AccordionItem key={index} value={`faq-${index}`} className="border-b last:border-0">
                <AccordionTrigger className="text-right hover:no-underline py-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <FaqIcon className="h-5 w-5 text-yellow-700" />
                    </div>
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};
