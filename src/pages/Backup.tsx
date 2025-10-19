import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Printer, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Backup() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateBackupData = async () => {
    setLoading(true);
    try {
      // Fetch all system data
      const [
        { data: profiles },
        { data: citizens },
        { data: trafficRecords },
        { data: wantedPersons },
        { data: familyMembers },
        { data: vehicles },
        { data: incidents },
        { data: tasks },
        { data: cybercrimeReports },
        { data: notifications }
      ] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("citizens").select("*"),
        supabase.from("traffic_records").select("*"),
        supabase.from("wanted_persons").select("*"),
        supabase.from("family_members").select("*"),
        supabase.from("vehicles").select("*"),
        supabase.from("incidents").select("*"),
        supabase.from("tasks").select("*"),
        supabase.from("cybercrime_reports").select("*"),
        supabase.from("notifications").select("*")
      ]);

      return {
        profiles: profiles || [],
        citizens: citizens || [],
        trafficRecords: trafficRecords || [],
        wantedPersons: wantedPersons || [],
        familyMembers: familyMembers || [],
        vehicles: vehicles || [],
        incidents: incidents || [],
        tasks: tasks || [],
        cybercrimeReports: cybercrimeReports || [],
        notifications: notifications || []
      };
    } catch (error) {
      console.error("Backup generation error:", error);
      toast({ title: "خطأ", description: "فشل في إنشاء النسخة الاحتياطية", variant: "destructive" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    const data = await generateBackupData();
    if (!data) return;

    const csvContent = generateCSVContent(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `system_backup_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "تم", description: "تم تنزيل النسخة الاحتياطية بنجاح" });
  };

  const printBackup = async () => {
    const data = await generateBackupData();
    if (!data) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generatePrintContent(data);
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };

  const generateCSVContent = (data: any) => {
    let csvContent = "نوع البيانات,التفاصيل\n";
    
    // Add profiles
    csvContent += `المستخدمين (${data.profiles.length}),\n`;
    data.profiles.forEach((profile: any) => {
      csvContent += `,"الاسم: ${profile.full_name}, الدور: ${profile.role}, الهاتف: ${profile.phone || 'غير محدد'}"\n`;
    });
    
    // Add citizens
    csvContent += `\nالمواطنين (${data.citizens.length}),\n`;
    data.citizens.forEach((citizen: any) => {
      csvContent += `,"الاسم: ${citizen.full_name}, رقم الهوية: ${citizen.national_id}, تاريخ الميلاد: ${citizen.date_of_birth || 'غير محدد'}"\n`;
    });
    
    // Add traffic records
    csvContent += `\nالسجلات المرورية (${data.trafficRecords.length}),\n`;
    data.trafficRecords.forEach((record: any) => {
      csvContent += `,"الاسم: ${record.citizen_name}, رقم الهوية: ${record.national_id}, النوع: ${record.record_type}, التاريخ: ${record.record_date}"\n`;
    });
    
    // Add wanted persons
    csvContent += `\nالأشخاص المطلوبين (${data.wantedPersons.length}),\n`;
    data.wantedPersons.forEach((wanted: any) => {
      csvContent += `,"بداية المراقبة: ${wanted.monitor_start_date}, السبب: ${wanted.reason || 'غير محدد'}, نشط: ${wanted.is_active ? 'نعم' : 'لا'}"\n`;
    });

    return csvContent;
  };

  const generatePrintContent = (data: any) => {
    const currentDate = new Date().toLocaleDateString('en-US');
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>النسخة الاحتياطية للنظام</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 16px;
            color: #666;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-card {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
          }
          .stat-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">النسخة الاحتياطية الشاملة للنظام</div>
          <div class="subtitle">وزارة الداخلية - الأمن العام</div>
        </div>

        <div class="section">
          <div class="section-title">إحصائيات النظام</div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${data.profiles.length}</div>
              <div class="stat-label">إجمالي المستخدمين</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.citizens.length}</div>
              <div class="stat-label">إجمالي المواطنين</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.trafficRecords.length}</div>
              <div class="stat-label">السجلات المرورية</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.wantedPersons.filter((w: any) => w.is_active).length}</div>
              <div class="stat-label">الأشخاص المطلوبين</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.vehicles.length}</div>
              <div class="stat-label">المركبات المسجلة</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.incidents.length}</div>
              <div class="stat-label">الحوادث</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">تفاصيل البيانات</div>
          <p><strong>تاريخ النسخة الاحتياطية:</strong> ${currentDate}</p>
          <p><strong>المستخدم:</strong> ${user?.name || 'غير محدد'}</p>
          <p><strong>إجمالي جداول البيانات:</strong> 10 جداول</p>
          <p><strong>حجم البيانات:</strong> ${(JSON.stringify(data).length / 1024).toFixed(2)} KB</p>
        </div>

        <div class="footer">
          <p>هذه النسخة الاحتياطية تم إنشاؤها من نظام إدارة الأمن - وزارة الداخلية</p>
          <p>تم الإنشاء في: ${new Date().toLocaleString('en-US')}</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">النسخ الاحتياطية</h1>
        <p className="text-muted-foreground mt-2">إنشاء وإدارة النسخ الاحتياطية الشاملة لجميع بيانات النظام.</p>
      </header>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              النسخة الاحتياطية الشاملة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              إنشاء نسخة احتياطية شاملة تحتوي على جميع بيانات النظام من المستخدمين والمواطنين والسجلات الأمنية.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                onClick={downloadExcel} 
                disabled={loading}
                className="flex items-center gap-2"
                size="lg"
              >
                <FileSpreadsheet className="w-5 h-5" />
                {loading ? "جاري الإنشاء..." : "تنزيل ملف Excel"}
              </Button>
              
              <Button 
                onClick={printBackup} 
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
                size="lg"
              >
                <Printer className="w-5 h-5" />
                {loading ? "جاري الإنشاء..." : "طباعة التقرير"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>محتويات النسخة الاحتياطية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">بيانات المستخدمين:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>جميع ملفات المستخدمين وتفاصيلهم</li>
                  <li>الأدوار والصلاحيات</li>
                  <li>معلومات الاتصال</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">السجلات الأمنية:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>جميع المخالفات والقضايا</li>
                  <li>الأشخاص المطلوبين</li>
                  <li>بيانات العائلات والمركبات</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">الحوادث والمهام:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>تقارير الحوادث</li>
                  <li>المهام المسندة</li>
                  <li>حالات الجرائم الإلكترونية</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">الإشعارات والرسائل:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>جميع الإشعارات</li>
                  <li>رسائل الدردشة</li>
                  <li>التنبيهات النشطة</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}