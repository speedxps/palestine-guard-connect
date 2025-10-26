import React, { useState } from 'react';
import { 
  BookOpen, Search, Home, Users, Car, Shield, Globe, 
  FileText, MessageSquare, Bell, Settings, Map, Camera,
  Lock, Smartphone, Mail, Phone, HelpCircle, Radio, Briefcase,
  Activity, Calendar, Award, Database, TrendingUp, UserCheck,
  ClipboardList, AlertTriangle, Eye, Fingerprint, Zap, Target,
  ShieldCheck, Computer, Scale, Bot, Newspaper, MapPin,
  CheckCircle, AlertCircle, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuideSectionCard } from '@/components/guide/GuideSectionCard';
import { GuideFAQ } from '@/components/guide/GuideFAQ';
import { GuideTips } from '@/components/guide/GuideTips';
import { GuideShortcuts } from '@/components/guide/GuideShortcuts';
import { GuideTroubleshooting } from '@/components/guide/GuideTroubleshooting';
import { GuideGlossary } from '@/components/guide/GuideGlossary';
import { GuidePrintButton } from '@/components/guide/GuidePrintButton';
import { GuideRating } from '@/components/guide/GuideRating';

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
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-r-4 border-blue-500">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  تسجيل الدخول
                </h4>
                <ol className="space-y-1.5 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                  <li className="flex gap-2"><span className="font-bold text-blue-600 shrink-0">1.</span> <span>افتح التطبيق</span></li>
                  <li className="flex gap-2"><span className="font-bold text-blue-600 shrink-0">2.</span> <span>أدخل البريد الإلكتروني وكلمة المرور</span></li>
                  <li className="flex gap-2"><span className="font-bold text-blue-600 shrink-0">3.</span> <span>اضغط على "تسجيل الدخول"</span></li>
                  <li className="flex gap-2"><span className="font-bold text-blue-600 shrink-0">4.</span> <span>إذا كان لديك مصادقة ثنائية، أدخل الرمز</span></li>
                </ol>
              </div>
            </div>
          )
        },
        {
          title: 'واجهة التطبيق الرئيسية',
          content: (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">الواجهة الرئيسية تحتوي على:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-1.5 sm:mb-2 text-sm sm:text-base">🏠 الصفحة الرئيسية</h4>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">عرض الإحصائيات والأخبار والنشاطات الأخيرة</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-bold text-green-900 mb-1.5 sm:mb-2 text-sm sm:text-base">☰ القائمة الجانبية</h4>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">الوصول السريع لجميع الأقسام والصفحات</p>
                </div>
              </div>
            </div>
          )
        },
        {
          title: 'تفعيل تتبع الموقع GPS',
          content: (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg border-r-4 border-green-500">
                <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  خطوات التفعيل
                </h4>
                <ol className="space-y-1.5 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                  <li className="flex gap-2"><span className="font-bold text-green-600 shrink-0">1.</span> <span>اذهب إلى "الملف الشخصي"</span></li>
                  <li className="flex gap-2"><span className="font-bold text-green-600 shrink-0">2.</span> <span>اضغط على "الإعدادات"</span></li>
                  <li className="flex gap-2"><span className="font-bold text-green-600 shrink-0">3.</span> <span>فعّل خيار "تتبع الموقع"</span></li>
                  <li className="flex gap-2"><span className="font-bold text-green-600 shrink-0">4.</span> <span>اسمح للمتصفح بالوصول للموقع</span></li>
                </ol>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'traffic',
      title: 'شرطة المرور',
      icon: Car,
      color: 'from-blue-400 to-blue-500',
      items: [
        {
          title: 'البحث عن مركبة',
          content: (
            <div className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
              <p className="font-semibold">الخطوات:</p>
              <ol className="list-decimal list-inside space-y-1.5 sm:space-y-2 pr-3 sm:pr-4">
                <li>انتقل إلى قسم "شرطة المرور"</li>
                <li>اضغط على "الاستعلام عن مركبة"</li>
                <li>أدخل رقم اللوحة</li>
                <li>اضغط "بحث"</li>
              </ol>
            </div>
          )
        },
        {
          title: 'تسجيل مخالفة',
          content: (
            <div className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
              <p className="font-semibold">الخطوات:</p>
              <ol className="list-decimal list-inside space-y-1.5 sm:space-y-2 pr-3 sm:pr-4">
                <li>ابحث عن المركبة أولاً</li>
                <li>اضغط "تسجيل مخالفة جديدة"</li>
                <li>اختر نوع المخالفة</li>
                <li>أدخل التفاصيل والموقع</li>
                <li>احفظ المخالفة</li>
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
      color: 'from-red-500 to-red-600',
      items: [
        {
          title: 'البحث عن مشتبه',
          content: (
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">الخطوات:</p>
              <ol className="list-decimal list-inside space-y-2 pr-4">
                <li>انتقل إلى "المباحث الجنائية"</li>
                <li>اضغط "البحث عن مشتبه"</li>
                <li>أدخل الاسم أو رقم الهوية</li>
                <li>عرض السجل الجنائي</li>
              </ol>
            </div>
          )
        },
        {
          title: 'تسجيل حادث',
          content: (
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">الخطوات:</p>
              <ol className="list-decimal list-inside space-y-2 pr-4">
                <li>اذهب إلى "الحوادث والبلاغات"</li>
                <li>اضغط "حادث جديد"</li>
                <li>املأ بيانات الحادث</li>
                <li>أرفق الصور والمستندات</li>
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
      color: 'from-indigo-500 to-indigo-600',
      items: [
        {
          title: 'الإبلاغ عن جريمة',
          content: (
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">الخطوات:</p>
              <ol className="list-decimal list-inside space-y-2 pr-4">
                <li>اذهب إلى "الجرائم الإلكترونية"</li>
                <li>اضغط "بلاغ جديد"</li>
                <li>اختر نوع الجريمة</li>
                <li>أدخل التفاصيل والأدلة</li>
                <li>أرسل البلاغ</li>
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
      color: 'from-green-500 to-green-600',
      items: [
        {
          title: 'المساعد الذكي',
          content: (
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">كيفية الاستخدام:</p>
              <ol className="list-decimal list-inside space-y-2 pr-4">
                <li>افتح "المساعد الذكي" من الصفحة الرئيسية</li>
                <li>اكتب سؤالك أو اطلب مساعدة</li>
                <li>يمكنك استخدام الصوت بدلاً من الكتابة</li>
                <li>انتظر الإجابة الذكية</li>
              </ol>
            </div>
          )
        },
        {
          title: 'الإشعارات والتنبيهات',
          content: (
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">إدارة الإشعارات:</p>
              <ol className="list-decimal list-inside space-y-2 pr-4">
                <li>اضغط على أيقونة الجرس 🔔</li>
                <li>عرض الإشعارات الجديدة</li>
                <li>اضغط على إشعار لفتحه</li>
                <li>وضع علامة "مقروء" أو حذف</li>
              </ol>
            </div>
          )
        },
        {
          title: 'سجلات المواطنين',
          content: (
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">البحث عن مواطن:</p>
              <ol className="list-decimal list-inside space-y-2 pr-4">
                <li>اذهب إلى "السجل المدني"</li>
                <li>أدخل رقم الهوية أو الاسم</li>
                <li>اضغط "بحث"</li>
                <li>عرض البيانات والسجل</li>
              </ol>
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

  const mainSections = [
    { id: 'basics', title: 'الأساسيات', description: 'تعلم الأساسيات', icon: Home, color: 'from-blue-500 to-blue-600', items: sections[0].items },
    { id: 'departments', title: 'الأقسام الشرطية', description: 'أقسام الشرطة', icon: Shield, color: 'from-red-500 to-red-600', items: sections.slice(1, 4).flatMap(s => s.items) },
    { id: 'tools', title: 'الأدوات والميزات', description: 'أدوات متقدمة', icon: Settings, color: 'from-purple-500 to-purple-600', items: sections[4].items },
  ];

  return (
    <ProfessionalLayout
      title="دليل المستخدم"
      description="دليل شامل لاستخدام نظام PoliceOps"
      showBackButton={true}
      headerActions={<GuidePrintButton sections={sections} />}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto pb-2 mb-6">
          <TabsList className="inline-flex w-auto min-w-full lg:grid lg:grid-cols-7 gap-2">
            <TabsTrigger value="overview" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">نظرة عامة</TabsTrigger>
            <TabsTrigger value="faq" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">أسئلة شائعة</TabsTrigger>
            <TabsTrigger value="tips" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">نصائح</TabsTrigger>
            <TabsTrigger value="shortcuts" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">اختصارات</TabsTrigger>
            <TabsTrigger value="troubleshooting" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">حل المشاكل</TabsTrigger>
            <TabsTrigger value="glossary" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">المصطلحات</TabsTrigger>
            <TabsTrigger value="all" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">جميع المواضيع</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 sm:space-y-8">
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">مرحباً بك في دليل المستخدم</h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                هذا الدليل الشامل سيساعدك على فهم واستخدام جميع ميزات نظام PoliceOps بكفاءة عالية.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
                  <p className="font-bold text-xl sm:text-2xl">{sections.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600">أقسام</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
                  <p className="font-bold text-xl sm:text-2xl">{sections.reduce((acc, s) => acc + s.items.length, 0)}</p>
                  <p className="text-xs sm:text-sm text-gray-600">موضوع</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                  <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
                  <p className="font-bold text-xl sm:text-2xl">10</p>
                  <p className="text-xs sm:text-sm text-gray-600">أسئلة شائعة</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-primary" />
                  <p className="font-bold text-xl sm:text-2xl">18</p>
                  <p className="text-xs sm:text-sm text-gray-600">اختصار</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6">اختر قسماً للبدء</h3>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {mainSections.map((section) => (
                <GuideSectionCard
                  key={section.id}
                  title={section.title}
                  description={section.description}
                  icon={section.icon}
                  color={section.color}
                  itemCount={section.items.length}
                  onClick={() => setActiveTab('all')}
                />
              ))}
            </div>
          </div>

          <Card className="border-2 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-right">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-3 sm:p-4 shrink-0">
                  <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">هل تحتاج مساعدة سريعة؟</h3>
                  <p className="text-sm sm:text-base text-gray-700">استخدم المساعد الذكي للحصول على إجابات فورية لأي سؤال!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq"><GuideFAQ /></TabsContent>
        <TabsContent value="tips"><GuideTips /></TabsContent>
        <TabsContent value="shortcuts"><GuideShortcuts /></TabsContent>
        <TabsContent value="troubleshooting"><GuideTroubleshooting /></TabsContent>
        <TabsContent value="glossary"><GuideGlossary /></TabsContent>

        <TabsContent value="all" className="space-y-6 sm:space-y-8">
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <Input
                type="text"
                placeholder="ابحث في الدليل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-right text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {filteredSections.length === 0 ? (
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <Search className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">لم يتم العثور على نتائج</h3>
                  <p className="text-sm sm:text-base text-gray-600">حاول البحث بكلمات مفتاحية أخرى</p>
                </CardContent>
              </Card>
            ) : (
              filteredSections.map((section) => {
                const SectionIcon = section.icon;
                return (
                  <Card key={section.id} className="border-2 overflow-hidden">
                    <CardHeader className={`bg-gradient-to-r ${section.color} text-white p-4 sm:p-6`}>
                      <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl lg:text-2xl">
                        <SectionIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 shrink-0" />
                        <span className="truncate">{section.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-4 sm:space-y-6">
                        {section.items.map((item, index) => {
                          const ItemIcon = (item as any).icon;
                          return (
                            <div key={index} className="border-b last:border-0 pb-4 sm:pb-6 last:pb-0">
                              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                                {ItemIcon && (
                                  <div className="bg-gray-100 p-1.5 sm:p-2 rounded-lg shrink-0">
                                    <ItemIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                                  </div>
                                )}
                                <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">{item.title}</h3>
                              </div>
                              <div className="text-sm sm:text-base">
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
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </ProfessionalLayout>
  );
};

export default UserGuide;
