import React from 'react';
import { PrintableGuide } from '@/components/guide/PrintableGuide';
import { BookOpen, Car, ShieldCheck, Computer, Bot } from 'lucide-react';
import loginScreenshot from '@/assets/guide/login-screenshot.png';
import dashboardScreenshot from '@/assets/guide/dashboard-screenshot.png';
import trafficScreenshot from '@/assets/guide/traffic-screenshot.png';
import cidScreenshot from '@/assets/guide/cid-screenshot.png';
import cyberScreenshot from '@/assets/guide/cyber-screenshot.png';

const PrintGuidePage = () => {
  const sections = [
    {
      id: 'basics',
      title: 'الأساسيات',
      icon: BookOpen,
      items: [
        {
          title: 'تسجيل الدخول والخروج',
          image: loginScreenshot,
          content: (
            <div>
              <h4>خطوات تسجيل الدخول:</h4>
              <ol>
                <li>افتح التطبيق من خلال الرابط المخصص أو من سطح المكتب</li>
                <li>أدخل البريد الإلكتروني الخاص بك</li>
                <li>أدخل كلمة المرور</li>
                <li>اضغط على زر "تسجيل الدخول"</li>
                <li>في حالة تفعيل المصادقة الثنائية، أدخل الرمز المرسل</li>
              </ol>
              <h4>تسجيل الخروج:</h4>
              <p>اضغط على أيقونة حسابك في الأعلى، ثم اختر "تسجيل الخروج"</p>
            </div>
          )
        },
        {
          title: 'واجهة التطبيق الرئيسية',
          image: dashboardScreenshot,
          content: (
            <div>
              <p>تتكون الواجهة الرئيسية من العناصر التالية:</p>
              <ul>
                <li><strong>الصفحة الرئيسية:</strong> عرض الإحصائيات والأخبار والنشاطات الأخيرة</li>
                <li><strong>القائمة الجانبية:</strong> الوصول السريع لجميع الأقسام والصفحات</li>
                <li><strong>شريط الإشعارات:</strong> عرض التنبيهات والرسائل الجديدة</li>
                <li><strong>شريط البحث:</strong> البحث السريع في النظام</li>
              </ul>
            </div>
          )
        },
        {
          title: 'تفعيل تتبع الموقع GPS',
          content: (
            <div>
              <h4>خطوات التفعيل:</h4>
              <ol>
                <li>اذهب إلى "الملف الشخصي" من القائمة الرئيسية</li>
                <li>اضغط على "الإعدادات"</li>
                <li>فعّل خيار "تتبع الموقع"</li>
                <li>اسمح للمتصفح بالوصول إلى موقعك الجغرافي</li>
              </ol>
              <p><strong>ملاحظة:</strong> تتبع الموقع مهم للتحقق من سلامة عمليات تسجيل الدخول</p>
            </div>
          )
        }
      ]
    },
    {
      id: 'traffic',
      title: 'شرطة المرور',
      icon: Car,
      items: [
        {
          title: 'البحث عن مركبة',
          image: trafficScreenshot,
          content: (
            <div>
              <h4>خطوات البحث:</h4>
              <ol>
                <li>انتقل إلى قسم "شرطة المرور" من القائمة الجانبية</li>
                <li>اضغط على "الاستعلام عن مركبة"</li>
                <li>أدخل رقم اللوحة في خانة البحث</li>
                <li>اضغط على زر "بحث"</li>
                <li>ستظهر لك جميع المعلومات المتعلقة بالمركبة</li>
              </ol>
            </div>
          )
        },
        {
          title: 'تسجيل مخالفة مرورية',
          content: (
            <div>
              <h4>خطوات التسجيل:</h4>
              <ol>
                <li>ابحث عن المركبة أولاً كما هو موضح أعلاه</li>
                <li>اضغط على زر "تسجيل مخالفة جديدة"</li>
                <li>اختر نوع المخالفة من القائمة</li>
                <li>أدخل التفاصيل: الموقع، التاريخ، الوقت، والملاحظات</li>
                <li>أرفق الصور إن وجدت</li>
                <li>اضغط "حفظ المخالفة"</li>
              </ol>
            </div>
          )
        }
      ]
    },
    {
      id: 'cid',
      title: 'المباحث الجنائية',
      icon: ShieldCheck,
      items: [
        {
          title: 'البحث عن مشتبه به',
          image: cidScreenshot,
          content: (
            <div>
              <h4>خطوات البحث:</h4>
              <ol>
                <li>انتقل إلى قسم "المباحث الجنائية"</li>
                <li>اضغط على "البحث عن مشتبه"</li>
                <li>أدخل الاسم أو رقم الهوية</li>
                <li>اضغط "بحث" لعرض السجل الجنائي</li>
              </ol>
            </div>
          )
        },
        {
          title: 'تسجيل حادث جنائي',
          content: (
            <div>
              <h4>خطوات التسجيل:</h4>
              <ol>
                <li>اذهب إلى "الحوادث والبلاغات"</li>
                <li>اضغط على "حادث جديد"</li>
                <li>املأ بيانات الحادث: النوع، الموقع، التاريخ</li>
                <li>أدخل تفاصيل الحادث والأطراف المعنية</li>
                <li>أرفق الصور والمستندات الداعمة</li>
                <li>احفظ وأرسل التقرير</li>
              </ol>
            </div>
          )
        }
      ]
    },
    {
      id: 'cyber',
      title: 'الجرائم الإلكترونية',
      icon: Computer,
      items: [
        {
          title: 'الإبلاغ عن جريمة إلكترونية',
          image: cyberScreenshot,
          content: (
            <div>
              <h4>خطوات الإبلاغ:</h4>
              <ol>
                <li>اذهب إلى قسم "الجرائم الإلكترونية"</li>
                <li>اضغط على "بلاغ جديد"</li>
                <li>اختر نوع الجريمة: احتيال، قرصنة، ابتزاز، إلخ</li>
                <li>أدخل التفاصيل الكاملة للجريمة</li>
                <li>أرفق الأدلة الرقمية: صور، رسائل، روابط</li>
                <li>أرسل البلاغ للمتابعة</li>
              </ol>
            </div>
          )
        }
      ]
    },
    {
      id: 'tools',
      title: 'الأدوات المشتركة',
      icon: Bot,
      items: [
        {
          title: 'المساعد الذكي',
          content: (
            <div>
              <h4>كيفية الاستخدام:</h4>
              <ul>
                <li>افتح "المساعد الذكي" من الصفحة الرئيسية</li>
                <li>اكتب سؤالك أو اطلب مساعدة في خانة الدردشة</li>
                <li>يمكنك استخدام الصوت بدلاً من الكتابة</li>
                <li>سيقوم المساعد بالرد عليك فوراً</li>
              </ul>
            </div>
          )
        },
        {
          title: 'إدارة الإشعارات',
          content: (
            <div>
              <h4>التعامل مع الإشعارات:</h4>
              <ul>
                <li>اضغط على أيقونة الجرس 🔔 في الأعلى</li>
                <li>ستظهر قائمة بجميع الإشعارات الجديدة</li>
                <li>اضغط على أي إشعار لفتحه والاطلاع عليه</li>
                <li>يمكنك وضع علامة "مقروء" أو حذف الإشعار</li>
              </ul>
            </div>
          )
        },
        {
          title: 'البحث في سجلات المواطنين',
          content: (
            <div>
              <h4>خطوات البحث:</h4>
              <ol>
                <li>اذهب إلى "السجل المدني" من القائمة</li>
                <li>أدخل رقم الهوية أو الاسم الكامل</li>
                <li>اضغط على "بحث"</li>
                <li>ستظهر البيانات الكاملة للمواطن</li>
              </ol>
            </div>
          )
        }
      ]
    }
  ];

  return <PrintableGuide sections={sections} />;
};

export default PrintGuidePage;