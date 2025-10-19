import { BackButton } from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Database, FileText, Folder, Download, Lock, Eye } from 'lucide-react';

export default function JointOpsSharedFiles() {
  const categories = [
    {
      name: 'قضايا مشتركة',
      count: 24,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'تقارير أمنية',
      count: 15,
      icon: Folder,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'وثائق سرية',
      count: 8,
      icon: Lock,
      color: 'from-red-500 to-orange-500'
    },
    {
      name: 'عمليات سابقة',
      count: 32,
      icon: Database,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const recentFiles = [
    {
      name: 'تقرير العملية الأخيرة - سري',
      date: '2025-10-19',
      size: '2.5 MB',
      agency: 'الأمن الوقائي',
      classification: 'سري للغاية'
    },
    {
      name: 'بروتوكول التنسيق المشترك',
      date: '2025-10-18',
      size: '1.8 MB',
      agency: 'المخابرات العامة',
      classification: 'سري'
    },
    {
      name: 'خطة العمليات المشتركة Q4',
      date: '2025-10-17',
      size: '3.2 MB',
      agency: 'قوات الأمن الوطني',
      classification: 'محدود التداول'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <BackButton />
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">الملفات المشتركة</h1>
          <p className="text-muted-foreground">قاعدة بيانات القضايا والملفات المشتركة بين الأجهزة</p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="p-6 space-y-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                  <category.icon className="h-7 w-7 text-white" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold mb-1">{category.name}</h3>
                  <p className="text-2xl font-bold text-primary">{category.count} ملف</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Files */}
        <Card className="p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            الملفات الأخيرة
          </h2>
          
          <div className="space-y-4">
            {recentFiles.map((file, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-bold">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {file.agency} • {file.size} • {new Date(file.date).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Download className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-semibold text-red-600">{file.classification}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
