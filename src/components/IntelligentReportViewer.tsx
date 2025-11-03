import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Printer, FileText } from 'lucide-react';
import { QueryResponse, intelligentQueryService } from '@/services/intelligentQueryService';
import { toast } from 'sonner';

interface IntelligentReportViewerProps {
  report: QueryResponse;
}

export const IntelligentReportViewer: React.FC<IntelligentReportViewerProps> = ({ report }) => {
  const handleCopy = () => {
    intelligentQueryService.copyReportToClipboard(report);
    toast.success('تم نسخ التقرير');
  };

  const handlePrint = () => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Failed to create print document');
      }
      
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>${report.title}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              direction: rtl;
              text-align: right;
              padding: 20px;
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2B9BF4;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 10px;
            }
            h1 {
              color: #2B9BF4;
              font-size: 24px;
              margin: 10px 0;
            }
            .subtitle {
              color: #666;
              font-size: 14px;
            }
            .summary {
              background: #f8f9fa;
              padding: 15px;
              border-right: 4px solid #7CB342;
              border-radius: 4px;
              margin: 20px 0;
              line-height: 1.8;
              white-space: pre-wrap;
              font-size: 14px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #eee;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🚔</div>
            <h2 style="color: #2B9BF4; margin: 5px 0;">الشرطة الفلسطينية</h2>
            <p class="subtitle">نظام المعلومات الموحد - PoliceOps</p>
          </div>
          
          <h1>${report.title}</h1>
          
          <div class="summary">${report.summary}</div>
          
          <div class="footer">
            <p>تاريخ التقرير: ${new Date(report.timestamp).toLocaleString('ar-PS', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p style="margin-top: 5px;">تم إنشاؤه بواسطة نظام الاستعلام الذكي</p>
          </div>
        </body>
        </html>
      `);
      iframeDoc.close();
      
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
      
      toast.success('جاري تحضير الطباعة...');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('حدثت مشكلة أثناء الطباعة');
    }
  };


  const renderDataSection = () => {
    if (!report.data) return null;

    // Citizen comprehensive data
    if (report.data.citizen) {
      const { citizen, summary, vehicles, violations, cases, incidents } = report.data;
      
      return (
        <div className="space-y-4">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">البيانات الشخصية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold">الاسم الكامل:</span>
                  <p>{citizen.full_name || '-'}</p>
                </div>
                <div>
                  <span className="font-semibold">رقم الهوية:</span>
                  <p>{citizen.national_id || '-'}</p>
                </div>
                <div>
                  <span className="font-semibold">تاريخ الميلاد:</span>
                  <p>{citizen.date_of_birth || '-'}</p>
                </div>
                <div>
                  <span className="font-semibold">الجنس:</span>
                  <p>{citizen.gender || '-'}</p>
                </div>
                <div>
                  <span className="font-semibold">الهاتف:</span>
                  <p>{citizen.phone || '-'}</p>
                </div>
                <div>
                  <span className="font-semibold">العنوان:</span>
                  <p>{citizen.address || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ملخص الإحصائيات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{summary.total_vehicles || 0}</div>
                    <div className="text-xs text-gray-600">المركبات</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{summary.total_violations || 0}</div>
                    <div className="text-xs text-gray-600">إجمالي المخالفات</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{summary.pending_violations || 0}</div>
                    <div className="text-xs text-gray-600">مخالفات معلقة</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{summary.total_cases || 0}</div>
                    <div className="text-xs text-gray-600">القضايا</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{summary.total_incidents || 0}</div>
                    <div className="text-xs text-gray-600">الحوادث</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vehicles */}
          {vehicles && vehicles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المركبات ({vehicles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vehicles.map((vehicle: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="font-semibold">{vehicle.license_plate}</div>
                      <div className="text-gray-600">{vehicle.make} {vehicle.model} - {vehicle.year}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other sections can be added similarly */}
        </div>
      );
    }

    // Search by name results
    if (report.data.citizens) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">نتائج البحث ({report.data.citizens.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.data.citizens.map((citizen: any) => (
                <div key={citizen.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-semibold">{citizen.full_name}</div>
                  <div className="text-sm text-gray-600">رقم الهوية: {citizen.national_id}</div>
                  <div className="text-sm text-gray-600">الهاتف: {citizen.phone || '-'}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Statistics
    if (report.data.statistics) {
      const stats = report.data.statistics;
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">الإحصائيات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{stats.violations}</div>
                <div className="text-sm text-gray-600">المخالفات</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{stats.incidents}</div>
                <div className="text-sm text-gray-600">الحوادث</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{stats.cybercrime}</div>
                <div className="text-sm text-gray-600">الجرائم الإلكترونية</div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // لا نعرض البيانات الخام - فقط نعرض رسالة بسيطة
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{report.title}</CardTitle>
              <p className="text-sm text-gray-600">
                {new Date(report.timestamp).toLocaleString('ar-PS', {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 ml-2" />
                طباعة الملخص
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4 ml-2" />
                نسخ
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI Summary */}
      {report.summary && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              الملخص الذكي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Data Sections */}
      {renderDataSection()}
    </div>
  );
};
