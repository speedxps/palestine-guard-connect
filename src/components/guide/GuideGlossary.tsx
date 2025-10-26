import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const GuideGlossary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const terms = [
    {
      term: "CID",
      fullName: "Criminal Investigation Department",
      arabic: "المباحث الجنائية",
      description: "القسم المسؤول عن التحقيق في الجرائم الكبرى والحالات الجنائية المعقدة."
    },
    {
      term: "GPS",
      fullName: "Global Positioning System",
      arabic: "نظام تحديد المواقع العالمي",
      description: "تقنية تستخدم الأقمار الصناعية لتحديد الموقع الجغرافي الدقيق للمستخدمين والمركبات."
    },
    {
      term: "2FA",
      fullName: "Two-Factor Authentication",
      arabic: "المصادقة الثنائية",
      description: "طبقة أمان إضافية تتطلب رمز تحقق إضافي بالإضافة إلى كلمة المرور."
    },
    {
      term: "RLS",
      fullName: "Row Level Security",
      arabic: "أمان مستوى الصف",
      description: "نظام أمان في قاعدة البيانات يتحكم في من يمكنه رؤية أو تعديل بيانات معينة."
    },
    {
      term: "OTP",
      fullName: "One-Time Password",
      arabic: "كلمة مرور لمرة واحدة",
      description: "رمز مؤقت يستخدم مرة واحدة فقط للتحقق من الهوية."
    },
    {
      term: "PDF",
      fullName: "Portable Document Format",
      arabic: "صيغة المستند المحمول",
      description: "صيغة ملف شائعة للمستندات تحافظ على التنسيق عبر الأجهزة المختلفة."
    },
    {
      term: "QR Code",
      fullName: "Quick Response Code",
      arabic: "رمز الاستجابة السريعة",
      description: "رمز ثنائي الأبعاد يمكن مسحه بالكاميرا للوصول السريع للمعلومات."
    },
    {
      term: "API",
      fullName: "Application Programming Interface",
      arabic: "واجهة برمجة التطبيقات",
      description: "طريقة للتواصل بين البرامج والأنظمة المختلفة."
    },
    {
      term: "Cache",
      fullName: "Cache Memory",
      arabic: "الذاكرة المؤقتة",
      description: "ذاكرة تخزين مؤقتة تحفظ البيانات المستخدمة بكثرة لتسريع التطبيق."
    },
    {
      term: "URL",
      fullName: "Uniform Resource Locator",
      arabic: "محدد موقع الموارد الموحد",
      description: "عنوان الويب الذي يحدد موقع صفحة أو مورد على الإنترنت."
    },
    {
      term: "VPN",
      fullName: "Virtual Private Network",
      arabic: "الشبكة الافتراضية الخاصة",
      description: "تقنية تشفير الاتصال بالإنترنت لحماية الخصوصية والأمان."
    },
    {
      term: "SSL",
      fullName: "Secure Sockets Layer",
      arabic: "طبقة المقابس الآمنة",
      description: "بروتوكول أمان يشفر البيانات المنقولة عبر الإنترنت."
    },
    {
      term: "FAQ",
      fullName: "Frequently Asked Questions",
      arabic: "الأسئلة الشائعة",
      description: "قائمة بالأسئلة الأكثر تكراراً وإجاباتها."
    },
    {
      term: "UI",
      fullName: "User Interface",
      arabic: "واجهة المستخدم",
      description: "الجزء المرئي من التطبيق الذي يتفاعل معه المستخدم."
    },
    {
      term: "DB",
      fullName: "Database",
      arabic: "قاعدة البيانات",
      description: "مجموعة منظمة من البيانات المخزنة إلكترونياً."
    }
  ];

  const filteredTerms = terms.filter(
    t =>
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.arabic.includes(searchTerm) ||
      t.description.includes(searchTerm)
  );

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <BookOpen className="h-8 w-8" />
          معجم المصطلحات
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <Input
            type="text"
            placeholder="ابحث عن مصطلح..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="space-y-4">
          {filteredTerms.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 border-2 border-gray-200 hover:border-teal-400 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold text-lg px-4 py-2">
                  {item.term}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900">{item.fullName}</h4>
                    <span className="text-teal-600">•</span>
                    <span className="text-gray-600 font-semibold">{item.arabic}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}

          {filteredTerms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">لم يتم العثور على مصطلحات مطابقة</p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border-r-4 border-blue-400 p-4 rounded">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>ملاحظة:</strong> إذا كنت بحاجة لشرح مصطلح غير موجود هنا، استخدم المساعد الذكي أو تواصل مع الدعم الفني.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
