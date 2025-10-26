import React, { useState } from 'react';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Search, 
  Car, 
  ShieldCheck, 
  Computer, 
  Scale, 
  Shield,
  Bot,
  Bell,
  Newspaper,
  UserCheck,
  FileText,
  MapPin,
  MessageSquare,
  Camera,
  Phone,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const UserGuide = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const sections = [
    {
      id: 'basics',
      title: 'الأساسيات',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      items: [
        {
          title: 'تسجيل الدخول والخروج',
          content: (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-r-4 border-blue-500">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  تسجيل الدخول
                </h4>
                <ol className="space-y-2 text-gray-700">
                  <li className="flex gap-2"><span className="font-bold text-blue-600">1.</span> افتح التطبيق</li>
                  <li className="flex gap-2"><span className="font-bold text-blue-600">2.</span> أدخل البريد الإلكتروني وكلمة المرور</li>
                  <li className="flex gap-2"><span className="font-bold text-blue-600">3.</span> اضغط على "تسجيل الدخول"</li>
                  <li className="flex gap-2"><span className="font-bold text-blue-600">4.</span> إذا كان لديك مصادقة ثنائية، أدخل الرمز</li>
                </ol>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border-r-4 border-red-500">
                <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  تسجيل الخروج
                </h4>
                <ol className="space-y-2 text-gray-700">
                  <li className="flex gap-2"><span className="font-bold text-red-600">1.</span> افتح القائمة الجانبية (☰)</li>
                  <li className="flex gap-2"><span className="font-bold text-red-600">2.</span> اضغط على "تسجيل الخروج" في أسفل القائمة</li>
                  <li className="flex gap-2"><span className="font-bold text-red-600">3.</span> أكد الخروج</li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: 'واجهة التطبيق الرئيسية',
          content: (
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                الواجهة الرئيسية تحتوي على:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">🏠 الصفحة الرئيسية</h4>
                  <p className="text-sm text-gray-700">عرض الإحصائيات والأخبار والنشاطات الأخيرة</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <h4 className="font-bold text-green-900 mb-2">☰ القائمة الجانبية</h4>
                  <p className="text-sm text-gray-700">الوصول السريع لجميع الأقسام والصفحات</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-900 mb-2">🔔 الإشعارات</h4>
                  <p className="text-sm text-gray-700">عرض التنبيهات والإشعارات المهمة</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-900 mb-2">👤 الملف الشخصي</h4>
                  <p className="text-sm text-gray-700">إدارة البيانات الشخصية والإعدادات</p>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'تفعيل تتبع الموقع GPS',
          content: (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border-r-4 border-green-500">
                <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  خطوات التفعيل
                </h4>
                <ol className="space-y-2 text-gray-700">
                  <li className="flex gap-2"><span className="font-bold text-green-600">1.</span> اذهب إلى "الملف الشخصي"</li>
                  <li className="flex gap-2"><span className="font-bold text-green-600">2.</span> اضغط على "الإعدادات"</li>
                  <li className="flex gap-2"><span className="font-bold text-green-600">3.</span> فعّل خيار "تتبع الموقع"</li>
                  <li className="flex gap-2"><span className="font-bold text-green-600">4.</span> اسمح للمتصفح بالوصول للموقع</li>
                </ol>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border-r-4 border-yellow-500">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  <span>ملاحظة: تتبع الموقع ضروري للعمليات الميدانية والدوريات</span>
                </p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'departments',
      title: 'الأقسام الرئيسية',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      items: [
        {
          title: 'شرطة المرور',
          icon: Car,
          content: (
            <div className="space-y-4">
              <Badge className="bg-blue-500">شرطة المرور</Badge>
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">🔍 البحث عن مركبة</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• انتقل إلى قسم "شرطة المرور"</li>
                    <li>• اضغط على "الاستعلام عن مركبة"</li>
                    <li>• أدخل رقم اللوحة</li>
                    <li>• اضغط "بحث"</li>
                  </ol>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">📝 تسجيل مخالفة</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• ابحث عن المركبة أولاً</li>
                    <li>• اضغط "تسجيل مخالفة جديدة"</li>
                    <li>• اختر نوع المخالفة</li>
                    <li>• أدخل التفاصيل والموقع</li>
                    <li>• التقط صور (اختياري)</li>
                    <li>• احفظ المخالفة</li>
                  </ol>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">🚔 إدارة الدوريات</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• اذهب إلى "إدارة الدوريات"</li>
                    <li>• عرض الدوريات النشطة</li>
                    <li>• بدء دورية جديدة</li>
                    <li>• تتبع الموقع الحالي</li>
                  </ol>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'المباحث الجنائية',
          icon: ShieldCheck,
          content: (
            <div className="space-y-4">
              <Badge className="bg-red-500">المباحث الجنائية</Badge>
              <div className="space-y-3">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-bold text-red-900 mb-2">🔍 البحث عن مشتبه</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• انتقل إلى "المباحث الجنائية"</li>
                    <li>• اضغط "البحث عن مشتبه"</li>
                    <li>• أدخل الاسم أو رقم الهوية</li>
                    <li>• عرض السجل الجنائي</li>
                  </ol>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-bold text-red-900 mb-2">📋 تسجيل حادث</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• اذهب إلى "الحوادث والبلاغات"</li>
                    <li>• اضغط "حادث جديد"</li>
                    <li>• املأ بيانات الحادث</li>
                    <li>• أرفق الصور والمستندات</li>
                    <li>• حدد الموقع على الخريطة</li>
                    <li>• احفظ وأرسل التقرير</li>
                  </ol>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-bold text-red-900 mb-2">🔬 المختبرات الجنائية</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• انتقل إلى "المختبرات الجنائية"</li>
                    <li>• طلب تحليل جديد</li>
                    <li>• متابعة نتائج التحليل</li>
                    <li>• عرض التقارير</li>
                  </ol>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'الجرائم الإلكترونية',
          icon: Computer,
          content: (
            <div className="space-y-4">
              <Badge className="bg-indigo-500">الجرائم الإلكترونية</Badge>
              <div className="space-y-3">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-bold text-indigo-900 mb-2">🚨 الإبلاغ عن جريمة</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• اذهب إلى "الجرائم الإلكترونية"</li>
                    <li>• اضغط "بلاغ جديد"</li>
                    <li>• اختر نوع الجريمة</li>
                    <li>• أدخل التفاصيل والأدلة</li>
                    <li>• أرفق لقطات الشاشة</li>
                    <li>• أرسل البلاغ</li>
                  </ol>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-bold text-indigo-900 mb-2">📊 تحليل البيانات</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• انتقل إلى "النظام المتقدم"</li>
                    <li>• عرض إحصائيات الجرائم</li>
                    <li>• تحليل الاتجاهات</li>
                    <li>• إنشاء تقرير</li>
                  </ol>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'الشرطة القضائية',
          icon: Scale,
          content: (
            <div className="space-y-4">
              <Badge className="bg-emerald-500">الشرطة القضائية</Badge>
              <div className="space-y-3">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-bold text-emerald-900 mb-2">⚖️ إدارة القضايا</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• اذهب إلى "إدارة القضايا"</li>
                    <li>• عرض القضايا المسندة</li>
                    <li>• البحث عن قضية محددة</li>
                    <li>• تحديث حالة القضية</li>
                    <li>• إضافة مستندات</li>
                  </ol>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-bold text-emerald-900 mb-2">📞 الاتصالات القضائية</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• انتقل إلى "الاتصالات القضائية"</li>
                    <li>• إرسال طلب للمحكمة</li>
                    <li>• متابعة الردود</li>
                    <li>• عرض المراسلات</li>
                  </ol>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'المعابر والحدود',
          icon: Shield,
          content: (
            <div className="space-y-4">
              <Badge className="bg-cyan-500">المعابر والحدود</Badge>
              <div className="space-y-3">
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <h4 className="font-bold text-cyan-900 mb-2">🛂 مراقبة المعابر</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• اذهب إلى "مراقبة المعابر"</li>
                    <li>• عرض المعابر النشطة</li>
                    <li>• تسجيل حركة العبور</li>
                    <li>• فحص الوثائق</li>
                  </ol>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <h4 className="font-bold text-cyan-900 mb-2">📄 إصدار تصاريح</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• انتقل إلى "التصاريح"</li>
                    <li>• طلب تصريح جديد</li>
                    <li>• مراجعة الطلبات</li>
                    <li>• الموافقة أو الرفض</li>
                  </ol>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'العمليات المشتركة',
          icon: Shield,
          content: (
            <div className="space-y-4">
              <Badge className="bg-purple-500">العمليات المشتركة</Badge>
              <div className="space-y-3">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-900 mb-2">🤝 التنسيق بين الأقسام</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• اذهب إلى "العمليات المشتركة"</li>
                    <li>• إنشاء عملية مشتركة</li>
                    <li>• دعوة الأقسام المعنية</li>
                    <li>• متابعة التنسيق</li>
                  </ol>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-900 mb-2">🎯 العمليات الميدانية</h4>
                  <ol className="space-y-1 text-sm text-gray-700">
                    <li>• انتقل إلى "مركز القيادة"</li>
                    <li>• عرض العمليات الجارية</li>
                    <li>• تتبع الموقع الفوري</li>
                    <li>• الاتصال بالفرق</li>
                  </ol>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'tools',
      title: 'الأدوات المشتركة',
      icon: Bot,
      color: 'from-green-500 to-green-600',
      items: [
        {
          title: 'المساعد الذكي',
          icon: Bot,
          content: (
            <div className="space-y-4">
              <Badge className="bg-green-500">المساعد الذكي AI</Badge>
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-900 mb-2">💬 كيفية الاستخدام</h4>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex gap-2"><span className="font-bold text-green-600">1.</span> افتح "المساعد الذكي" من الصفحة الرئيسية</li>
                    <li className="flex gap-2"><span className="font-bold text-green-600">2.</span> اكتب سؤالك أو اطلب مساعدة</li>
                    <li className="flex gap-2"><span className="font-bold text-green-600">3.</span> يمكنك استخدام الصوت بدلاً من الكتابة</li>
                    <li className="flex gap-2"><span className="font-bold text-green-600">4.</span> انتظر الإجابة الذكية</li>
                    <li className="flex gap-2"><span className="font-bold text-green-600">5.</span> نفذ الإجراء المقترح</li>
                  </ol>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-900 mb-2">💡 أمثلة على الأسئلة</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• "كيف أسجل مخالفة مرورية؟"</li>
                    <li>• "ابحث عن مركبة رقم 123456"</li>
                    <li>• "ما هي الإجراءات لتسجيل حادث؟"</li>
                    <li>• "أين أجد المختبرات الجنائية؟"</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'الإشعارات والتنبيهات',
          icon: Bell,
          content: (
            <div className="space-y-4">
              <Badge className="bg-orange-500">الإشعارات</Badge>
              <div className="space-y-3">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-900 mb-2">🔔 إدارة الإشعارات</h4>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex gap-2"><span className="font-bold text-orange-600">1.</span> اضغط على أيقونة الجرس 🔔 في الأعلى</li>
                    <li className="flex gap-2"><span className="font-bold text-orange-600">2.</span> عرض الإشعارات الجديدة</li>
                    <li className="flex gap-2"><span className="font-bold text-orange-600">3.</span> اضغط على إشعار لفتحه</li>
                    <li className="flex gap-2"><span className="font-bold text-orange-600">4.</span> وضع علامة "مقروء" أو حذف</li>
                  </ol>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-900 mb-2">⚙️ إعدادات الإشعارات</h4>
                  <p className="text-sm text-gray-700 mb-2">يمكنك التحكم في أنواع الإشعارات من:</p>
                  <p className="text-sm text-gray-700">الملف الشخصي → الإعدادات → إعدادات الإشعارات</p>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'الأخبار الداخلية',
          icon: Newspaper,
          content: (
            <div className="space-y-4">
              <Badge className="bg-blue-500">الأخبار</Badge>
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">📰 قراءة الأخبار</h4>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex gap-2"><span className="font-bold text-blue-600">1.</span> اذهب إلى قسم "الأخبار"</li>
                    <li className="flex gap-2"><span className="font-bold text-blue-600">2.</span> تصفح الأخبار الأخيرة</li>
                    <li className="flex gap-2"><span className="font-bold text-blue-600">3.</span> اضغط على خبر لقراءته كاملاً</li>
                    <li className="flex gap-2"><span className="font-bold text-blue-600">4.</span> شارك الخبر مع الزملاء</li>
                  </ol>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'سجلات المواطنين',
          icon: UserCheck,
          content: (
            <div className="space-y-4">
              <Badge className="bg-purple-500">السجل المدني</Badge>
              <div className="space-y-3">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-900 mb-2">🔍 البحث عن مواطن</h4>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex gap-2"><span className="font-bold text-purple-600">1.</span> اذهب إلى "السجل المدني"</li>
                    <li className="flex gap-2"><span className="font-bold text-purple-600">2.</span> أدخل رقم الهوية أو الاسم</li>
                    <li className="flex gap-2"><span className="font-bold text-purple-600">3.</span> اضغط "بحث"</li>
                    <li className="flex gap-2"><span className="font-bold text-purple-600">4.</span> عرض البيانات والسجل</li>
                  </ol>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-900 mb-2">📸 التعرف على الوجه</h4>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex gap-2"><span className="font-bold text-purple-600">1.</span> انتقل إلى "التعرف على الوجه"</li>
                    <li className="flex gap-2"><span className="font-bold text-purple-600">2.</span> التقط صورة أو ارفع صورة</li>
                    <li className="flex gap-2"><span className="font-bold text-purple-600">3.</span> انتظر نتائج المطابقة</li>
                    <li className="flex gap-2"><span className="font-bold text-purple-600">4.</span> عرض البيانات المطابقة</li>
                  </ol>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'scenarios',
      title: 'سيناريوهات عملية',
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      items: [
        {
          title: 'سيناريو 1: ضابط مرور يوقف مركبة مخالفة',
          content: (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-4 rounded-lg border-r-4 border-blue-500">
                <h4 className="font-bold text-blue-900 mb-3 text-lg">📍 الموقف</h4>
                <p className="text-gray-700 mb-4">ضابط مرور لاحظ مركبة تسير بسرعة زائدة في منطقة مدرسة</p>
                
                <h4 className="font-bold text-blue-900 mb-2 mt-4">📋 الخطوات</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-blue-700 mb-1">الخطوة 1: إيقاف المركبة</p>
                    <p className="text-sm text-gray-600">أوقف المركبة بشكل آمن على جانب الطريق</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-blue-700 mb-1">الخطوة 2: فتح التطبيق</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• افتح تطبيق PoliceOps</li>
                      <li>• اذهب إلى قسم "شرطة المرور"</li>
                      <li>• اضغط على "الاستعلام عن مركبة"</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-blue-700 mb-1">الخطوة 3: البحث عن المركبة</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• أدخل رقم لوحة المركبة</li>
                      <li>• اضغط "بحث"</li>
                      <li>• عرض بيانات المركبة والمالك</li>
                      <li>• التحقق من وجود مخالفات سابقة</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-blue-700 mb-1">الخطوة 4: تسجيل المخالفة</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• اضغط "تسجيل مخالفة جديدة"</li>
                      <li>• اختر نوع المخالفة: "سرعة زائدة"</li>
                      <li>• أدخل السرعة المسجلة والسرعة المسموحة</li>
                      <li>• حدد الموقع (تلقائي من GPS)</li>
                      <li>• التقط صورة للمركبة (اختياري)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-blue-700 mb-1">الخطوة 5: إنهاء الإجراء</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• راجع البيانات المدخلة</li>
                      <li>• اضغط "حفظ المخالفة"</li>
                      <li>• اطبع إيصال المخالفة (اختياري)</li>
                      <li>• سلّم الإيصال للسائق</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg mt-4">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-bold">النتيجة:</span> تم تسجيل المخالفة بنجاح في النظام وإرسال إشعار للسائق</p>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'سيناريو 2: محقق يسجل حادث جديد',
          content: (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-red-100 to-red-50 p-4 rounded-lg border-r-4 border-red-500">
                <h4 className="font-bold text-red-900 mb-3 text-lg">📍 الموقف</h4>
                <p className="text-gray-700 mb-4">محقق جنائي وصل إلى موقع حادث سرقة منزل</p>
                
                <h4 className="font-bold text-red-900 mb-2 mt-4">📋 الخطوات</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-red-700 mb-1">الخطوة 1: فتح التطبيق</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• افتح تطبيق PoliceOps</li>
                      <li>• اذهب إلى "المباحث الجنائية"</li>
                      <li>• اضغط على "الحوادث والبلاغات"</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-red-700 mb-1">الخطوة 2: إنشاء حادث جديد</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• اضغط "حادث جديد"</li>
                      <li>• اختر نوع الحادث: "سرقة"</li>
                      <li>• اختر الفئة: "سرقة منزل"</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-red-700 mb-1">الخطوة 3: ملء البيانات الأساسية</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• أدخل عنوان الحادث</li>
                      <li>• حدد الموقع على الخريطة</li>
                      <li>• سجل تاريخ ووقت الحادث</li>
                      <li>• أدخل وصف مفصل للحادث</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-red-700 mb-1">الخطوة 4: إضافة الأدلة</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• التقط صور للموقع</li>
                      <li>• صور آثار الجريمة</li>
                      <li>• سجل مقطع فيديو (اختياري)</li>
                      <li>• أرفق أي مستندات</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-red-700 mb-1">الخطوة 5: بيانات المبلّغ والشهود</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• سجل بيانات المبلّغ</li>
                      <li>• أضف شهود إن وجدوا</li>
                      <li>• سجل أقوالهم</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-red-700 mb-1">الخطوة 6: حفظ وإرسال</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• راجع جميع البيانات</li>
                      <li>• اضغط "حفظ التقرير"</li>
                      <li>• اضغط "إرسال للمتابعة"</li>
                      <li>• اطبع نسخة للملف</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg mt-4">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-bold">النتيجة:</span> تم تسجيل الحادث وإرساله لقسم التحقيقات للمتابعة</p>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'سيناريو 3: ضابط يستخدم المساعد الذكي',
          content: (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-lg border-r-4 border-green-500">
                <h4 className="font-bold text-green-900 mb-3 text-lg">📍 الموقف</h4>
                <p className="text-gray-700 mb-4">ضابط جديد يحتاج مساعدة في استخدام النظام</p>
                
                <h4 className="font-bold text-green-900 mb-2 mt-4">📋 الخطوات</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-green-700 mb-1">الخطوة 1: فتح المساعد الذكي</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• اذهب إلى الصفحة الرئيسية</li>
                      <li>• اضغط على "المساعد الذكي" 🤖</li>
                      <li>• أو افتحه من القائمة الجانبية</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-green-700 mb-1">الخطوة 2: طرح السؤال</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• اكتب السؤال: "كيف أبحث عن مركبة؟"</li>
                      <li>• أو استخدم الميكروفون 🎤</li>
                      <li>• اضغط إرسال</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-green-700 mb-1">الخطوة 3: قراءة الإجابة</p>
                    <p className="text-sm text-gray-600">المساعد الذكي سيرد بخطوات واضحة:</p>
                    <div className="bg-green-50 p-2 mt-2 rounded text-xs text-gray-700">
                      "للبحث عن مركبة:<br/>
                      1. اذهب لقسم 'شرطة المرور'<br/>
                      2. اضغط 'الاستعلام عن مركبة'<br/>
                      3. أدخل رقم اللوحة<br/>
                      4. اضغط بحث"
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-green-700 mb-1">الخطوة 4: تنفيذ الإجراء</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• اتبع الخطوات المقترحة</li>
                      <li>• يمكنك طرح أسئلة إضافية</li>
                      <li>• المساعد متوفر 24/7</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg mt-4">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-bold">النتيجة:</span> حصل الضابط على المساعدة الفورية وتمكن من إنجاز المهمة</p>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'سيناريو 4: عملية مشتركة بين الأقسام',
          content: (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-4 rounded-lg border-r-4 border-purple-500">
                <h4 className="font-bold text-purple-900 mb-3 text-lg">📍 الموقف</h4>
                <p className="text-gray-700 mb-4">عملية أمنية مشتركة بين المرور والمباحث لضبط مركبة مشتبه بها</p>
                
                <h4 className="font-bold text-purple-900 mb-2 mt-4">📋 الخطوات</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-purple-700 mb-1">الخطوة 1: إنشاء العملية</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• اذهب إلى "العمليات المشتركة"</li>
                      <li>• اضغط "عملية جديدة"</li>
                      <li>• أدخل اسم ووصف العملية</li>
                      <li>• حدد الأولوية: "عالية"</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-purple-700 mb-1">الخطوة 2: دعوة الأقسام</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• اختر "شرطة المرور"</li>
                      <li>• اختر "المباحث الجنائية"</li>
                      <li>• أرسل الدعوات</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-purple-700 mb-1">الخطوة 3: التنسيق</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• شارك معلومات المركبة المشتبه بها</li>
                      <li>• حدد نقاط التفتيش على الخريطة</li>
                      <li>• وزّع المهام على الفرق</li>
                      <li>• ابدأ العملية</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-purple-700 mb-1">الخطوة 4: المتابعة الفورية</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• افتح "مركز القيادة"</li>
                      <li>• تتبع مواقع الفرق على الخريطة</li>
                      <li>• استخدم الاتصال السريع بين الفرق</li>
                      <li>• راقب التحديثات الفورية</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-purple-700 mb-1">الخطوة 5: إنهاء العملية</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• سجل نتيجة العملية</li>
                      <li>• أرفق التقرير النهائي</li>
                      <li>• أغلق العملية</li>
                      <li>• أرسل ملخص لجميع المشاركين</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg mt-4">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-bold">النتيجة:</span> تم تنفيذ العملية بنجاح بتنسيق محكم بين الأقسام</p>
                </div>
              </div>
            </div>
          )
        }
      ]
    }
  ];

  // Filter sections based on search
  const filteredSections = searchQuery 
    ? sections.map(section => ({
        ...section,
        items: section.items.filter(item => 
          item.title.includes(searchQuery) ||
          section.title.includes(searchQuery)
        )
      })).filter(section => section.items.length > 0)
    : sections;

  return (
    <ProfessionalLayout
      title="دليل المستخدم"
      description="دليل شامل لاستخدام نظام إدارة الشرطة"
      showBackButton={true}
      backTo="/dashboard"
    >
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-[#2B9BF4] to-blue-500 border-0 text-white">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">مرحباً بك في دليل المستخدم</CardTitle>
                <CardDescription className="text-blue-100">
                  دليل شامل لجميع ميزات وإمكانيات نظام PoliceOps
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Search Box */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="ابحث في الدليل... (مثال: كيف أسجل مخالفة)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-right"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-blue-900">{sections.length}</p>
                <p className="text-sm text-blue-700">أقسام رئيسية</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {sections.reduce((acc, section) => acc + section.items.length, 0)}
                </p>
                <p className="text-sm text-green-700">موضوع</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-purple-900">6</p>
                <p className="text-sm text-purple-700">أقسام شرطية</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-orange-900">4</p>
                <p className="text-sm text-orange-700">أمثلة عملية</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Sections */}
        <div className="space-y-4">
          {filteredSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <Card key={section.id} className="overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${section.color} text-white`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <SectionIcon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-white text-xl">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {section.items.map((item, index) => {
                      const ItemIcon = (item as any).icon;
                      return (
                        <div key={index} className="border-b last:border-0 pb-6 last:pb-0">
                          <div className="flex items-center gap-3 mb-4">
                            {ItemIcon && (
                              <div className="bg-gray-100 p-2 rounded-lg">
                                <ItemIcon className="h-5 w-5 text-gray-700" />
                              </div>
                            )}
                            <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                          </div>
                          <div>
                            {item.content}
                          </div>
                          <GuideRating topicId={`${section.id}-${index}`} topicTitle={item.title} />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredSections.length === 0 && searchQuery && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold mb-2">لم يتم العثور على نتائج</p>
                <p className="text-sm">جرب البحث بكلمات مختلفة</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Card */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-500 text-white p-3 rounded-lg">
                <Bot className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">هل تحتاج مساعدة إضافية؟</h3>
                <p className="text-gray-700 text-sm mb-3">
                  يمكنك استخدام المساعد الذكي للحصول على إجابات فورية على أسئلتك
                </p>
                <Badge className="bg-green-500 text-white">
                  <Bot className="h-4 w-4 ml-1" />
                  المساعد الذكي متوفر 24/7
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfessionalLayout>
  );
};

export default UserGuide;
