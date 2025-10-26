import React from 'react';
import { Keyboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const GuideShortcuts: React.FC = () => {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'فتح البحث السريع', category: 'عام' },
    { keys: ['Ctrl', 'N'], description: 'إنشاء حادث جديد', category: 'حوادث' },
    { keys: ['Ctrl', 'P'], description: 'طباعة الصفحة الحالية', category: 'عام' },
    { keys: ['Ctrl', 'S'], description: 'حفظ التغييرات', category: 'عام' },
    { keys: ['Ctrl', 'F'], description: 'بحث في الصفحة الحالية', category: 'عام' },
    { keys: ['Esc'], description: 'إغلاق النافذة المنبثقة الحالية', category: 'عام' },
    { keys: ['F5'], description: 'تحديث الصفحة', category: 'عام' },
    { keys: ['Ctrl', 'Z'], description: 'التراجع عن آخر إجراء', category: 'عام' },
    { keys: ['Ctrl', 'Y'], description: 'إعادة آخر إجراء تم التراجع عنه', category: 'عام' },
    { keys: ['Alt', 'H'], description: 'العودة للصفحة الرئيسية', category: 'تنقل' },
    { keys: ['Alt', 'M'], description: 'فتح/إغلاق القائمة الجانبية', category: 'تنقل' },
    { keys: ['Ctrl', 'E'], description: 'تحرير السجل الحالي', category: 'تحرير' },
    { keys: ['Ctrl', 'D'], description: 'حذف السجل الحالي', category: 'تحرير' },
    { keys: ['Ctrl', 'B'], description: 'وضع النص عريض', category: 'تنسيق' },
    { keys: ['Ctrl', 'I'], description: 'وضع النص مائل', category: 'تنسيق' },
    { keys: ['Tab'], description: 'الانتقال للحقل التالي', category: 'نماذج' },
    { keys: ['Shift', 'Tab'], description: 'الانتقال للحقل السابق', category: 'نماذج' },
    { keys: ['Enter'], description: 'إرسال النموذج', category: 'نماذج' },
  ];

  const categories = [...new Set(shortcuts.map(s => s.category))];

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Keyboard className="h-8 w-8" />
          اختصارات لوحة المفاتيح
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="h-1 w-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded"></span>
                {category}
              </h3>
              <div className="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="text-right font-bold text-gray-900">الاختصار</TableHead>
                      <TableHead className="text-right font-bold text-gray-900">الوصف</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shortcuts
                      .filter(s => s.category === category)
                      .map((shortcut, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-mono">
                            <div className="flex gap-1 flex-wrap">
                              {shortcut.keys.map((key, i) => (
                                <React.Fragment key={i}>
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-white border-2 border-gray-300 text-gray-700 font-semibold px-3 py-1"
                                  >
                                    {key}
                                  </Badge>
                                  {i < shortcut.keys.length - 1 && (
                                    <span className="text-gray-400 font-bold">+</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700">{shortcut.description}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-blue-50 border-r-4 border-blue-400 p-4 rounded">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>ملاحظة:</strong> بعض الاختصارات قد تختلف حسب نظام التشغيل. على macOS، استخدم <strong>Cmd</strong> بدلاً من <strong>Ctrl</strong>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
