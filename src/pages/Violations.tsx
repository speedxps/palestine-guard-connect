import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, AlertTriangle, Users, Calendar, Printer, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTickets } from "@/hooks/useTickets";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/BackButton";

type RecordItem = {
  id: string;
  national_id: string;
  citizen_name: string;
  record_type: "violation" | "case";
  record_date: string; // ISO date string
  details: string | null;
};

type WantedPerson = {
  id: string;
  citizen_id: string;
  monitor_start_date: string;
  monitor_end_date: string | null;
  reason: string | null;
  is_active: boolean;
};

type FamilyMember = {
  id: string;
  relative_name: string;
  relative_national_id: string | null;
  relation: string;
};

const typeToArabic = (t: RecordItem["record_type"]) => (t === "violation" ? "مخالفة مرورية" : "قضية");

export default function Violations() {
  const [nationalId, setNationalId] = useState("");
  const [results, setResults] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [citizenPhotos, setCitizenPhotos] = useState<Record<string, string>>({});
  const [wantedPersons, setWantedPersons] = useState<Record<string, WantedPerson>>({});
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { logTicket } = useTickets();

  // Details dialog state
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [relatedRecords, setRelatedRecords] = useState<RecordItem[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    // SEO basics
    document.title = "المخالفات والقضايا | للمستخدمين";
    const desc = "ابحث برقم الهوية عن المخالفات والقضايا المسجلة (للمستخدمين المسجّلين)";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
    if (!document.querySelector('link[rel="canonical"]')) {
      const l = document.createElement("link");
      l.rel = "canonical";
      l.href = window.location.href;
      document.head.appendChild(l);
    }
  }, []);

  const handleSearch = async () => {
    const q = nationalId.trim();
    setSearched(true);
    if (!q) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("traffic_records")
        .select("id, national_id, citizen_name, record_type, record_date, details")
        .eq("national_id", q)
        .order("record_date", { ascending: false });

      if (error) throw error;
      setResults(data || []);
      
      // تسجيل عملية البحث في tickets
      await logTicket({
        section: 'المخالفات والقضايا',
        action_type: 'view',
        description: `بحث عن مخالفات برقم الهوية: ${q}`,
        metadata: { 
          nationalId: q,
          resultsCount: data?.length || 0
        }
      });
      
      // Fetch citizen photos and wanted status
      if (data && data.length > 0) {
        const nationalIds = [...new Set(data.map(r => r.national_id))];
        
        // Fetch citizen data with photos
        const { data: citizenData, error: citizenError } = await supabase
          .from("citizens")
          .select("national_id, photo_url, id")
          .in("national_id", nationalIds);
        
        if (!citizenError && citizenData) {
          const photoMap = citizenData.reduce((acc, citizen) => {
            if (citizen.photo_url) {
              acc[citizen.national_id] = citizen.photo_url;
            }
            return acc;
          }, {} as Record<string, string>);
          setCitizenPhotos(photoMap);

          // Fetch wanted persons data
          const citizenIds = citizenData.map(c => c.id);
          const { data: wantedData, error: wantedError } = await supabase
            .from("wanted_persons")
            .select("*")
            .in("citizen_id", citizenIds)
            .eq("is_active", true);
          
          if (!wantedError && wantedData) {
            const wantedMap = wantedData.reduce((acc, wanted) => {
              const citizen = citizenData.find(c => c.id === wanted.citizen_id);
              if (citizen) {
                acc[citizen.national_id] = wanted;
              }
              return acc;
            }, {} as Record<string, WantedPerson>);
            setWantedPersons(wantedMap);
          }
        }
      }
    } catch (err: any) {
      console.error("Search error:", err);
      toast({ title: "خطأ في البحث", description: "تعذر جلب النتائج. حاول لاحقًا.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (r: RecordItem) => {
    setSelected(r);
    setDetailsOpen(true);
  };

  // Load related records and family data for the selected person when dialog opens
  useEffect(() => {
    const fetchRelated = async () => {
      if (!detailsOpen || !selected?.national_id) return;
      setDetailsLoading(true);
      try {
        // Fetch related traffic records
        const { data, error } = await supabase
          .from("traffic_records")
          .select("id, national_id, citizen_name, record_type, record_date, details")
          .eq("national_id", selected.national_id)
          .order("record_date", { ascending: false });
        if (error) throw error;
        setRelatedRecords(data || []);

        // Fetch citizen ID and family members
        const { data: citizenData, error: citizenError } = await supabase
          .from("citizens")
          .select("id")
          .eq("national_id", selected.national_id)
          .single();

        if (!citizenError && citizenData) {
          const { data: familyData, error: familyError } = await supabase
            .from("family_members")
            .select("id, relative_name, relative_national_id, relation")
            .eq("person_id", citizenData.id);
          
          if (!familyError && familyData) {
            setFamilyMembers(familyData);
          }
        }
      } catch (err: any) {
        console.error("Details fetch error:", err);
        toast({ title: "خطأ", description: "تعذر تحميل التفاصيل.", variant: "destructive" });
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchRelated();
  }, [detailsOpen, selected?.national_id]);

  // Optional: reload if data changes in realtime while a query is active
  useEffect(() => {
    if (!searched || !nationalId.trim()) return;
    const channel = supabase
      .channel("traffic-records-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "traffic_records" }, handleSearch)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "traffic_records" }, handleSearch)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "traffic_records" }, handleSearch)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searched, nationalId]);

  const isWanted = (nationalId: string) => wantedPersons[nationalId]?.is_active;

  const handleExcelUpload = async (file: File) => {
    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Skip header row and process data
      const rows = jsonData.slice(1) as any[][];
      
      for (const row of rows) {
        if (row[0] && row[1] && row[2]) { // national_id, citizen_name, record_type required
          const recordType = String(row[2]).toLowerCase() === 'violation' ? 'violation' : 'case';
          const record = {
            national_id: String(row[0]),
            citizen_name: String(row[1]),
            record_type: recordType as "violation" | "case",
            record_date: row[3] ? new Date(row[3]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            details: row[4] ? String(row[4]) : null,
            is_resolved: false
          };
          
          const { error } = await supabase
            .from('traffic_records')
            .insert(record);
            
          if (error) {
            console.error('Insert error:', error);
            throw error;
          }
        }
      }
      
      toast({ title: "نجح", description: `تم رفع ${rows.length} سجل بنجاح` });
      setUploadDialogOpen(false);
      
      // Refresh current search if active
      if (nationalId.trim()) {
        handleSearch();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ 
        title: "خطأ في الرفع", 
        description: "فشل في معالجة الملف. تأكد من تنسيق البيانات.",
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const searchRelatives = async (nationalId: string) => {
    if (!nationalId) return;
    
    try {
      // First get the citizen
      const { data: citizenData, error: citizenError } = await supabase
        .from("citizens")
        .select("id, full_name")
        .eq("national_id", nationalId)
        .single();

      if (citizenError || !citizenData) {
        toast({ title: "لم يتم العثور على المواطن", variant: "destructive" });
        return;
      }

      // Get family members
      const { data: familyData, error: familyError } = await supabase
        .from("family_members")
        .select(`
          id,
          relative_name,
          relative_national_id,
          relation
        `)
        .eq("person_id", citizenData.id);

      if (familyError) throw familyError;

      if (familyData && familyData.length > 0) {
        setFamilyMembers(familyData);
        
        // Check if any relatives are wanted
        const relativeIds = familyData
          .map(f => f.relative_national_id)
          .filter(Boolean);
          
        if (relativeIds.length > 0) {
          const { data: relativeCitizens } = await supabase
            .from("citizens")
            .select("id, national_id")
            .in("national_id", relativeIds);
            
          if (relativeCitizens) {
            const citizenIds = relativeCitizens.map(c => c.id);
            const { data: wantedRelatives } = await supabase
              .from("wanted_persons")
              .select("*")
              .in("citizen_id", citizenIds)
              .eq("is_active", true);
              
            if (wantedRelatives && wantedRelatives.length > 0) {
              toast({ 
                title: "تنبيه", 
                description: `تم العثور على ${wantedRelatives.length} من الأقارب في قائمة المطلوبين`,
                variant: "destructive"
              });
            }
          }
        }
        
        toast({ 
          title: "تم العثور على الأقارب", 
          description: `${familyData.length} فرد من العائلة`
        });
      } else {
        toast({ title: "لا توجد بيانات أقارب مسجلة" });
      }
    } catch (error: any) {
      console.error('Relatives search error:', error);
      toast({ 
        title: "خطأ في البحث", 
        description: "فشل في البحث عن الأقارب",
        variant: "destructive" 
      });
    }
  };

  const handlePrint = () => {
    if (!selected) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const isWanted = wantedPersons[selected.national_id];
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تقرير المخالفات والقضايا</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 15px;
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
          .main-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-right: 4px solid #1e40af;
          }
          .info-row {
            display: flex;
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            width: 120px;
            color: #374151;
          }
          .info-value {
            color: #111827;
          }
          .wanted-alert {
            background: #fef2f2;
            border: 2px solid #dc2626;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          .wanted-title {
            color: #dc2626;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .records-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .records-table th,
          .records-table td {
            border: 1px solid #d1d5db;
            padding: 10px;
            text-align: right;
          }
          .records-table th {
            background: #f3f4f6;
            font-weight: bold;
          }
          .family-member {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 10px;
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
            .header { page-break-after: avoid; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${window.location.origin}/src/assets/police-logo.png" alt="شعار الشرطة" class="logo">
          <div class="title">وزارة الداخلية - الأمن العام</div>
          <div class="subtitle">تقرير المخالفات والقضايا</div>
        </div>

        <div class="main-info">
          <div class="info-row">
            <span class="info-label">الاسم الكامل:</span>
            <span class="info-value">${selected.citizen_name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">رقم الهوية:</span>
            <span class="info-value">${selected.national_id}</span>
          </div>
          <div class="info-row">
            <span class="info-label">تاريخ التقرير:</span>
            <span class="info-value">${currentDate}</span>
          </div>
        </div>

        ${isWanted ? `
          <div class="wanted-alert">
            <div class="wanted-title">⚠️ شخص مطلوب للسلطات</div>
            <div class="info-row">
              <span class="info-label">بداية المراقبة:</span>
              <span class="info-value">${new Date(isWanted.monitor_start_date).toLocaleDateString('ar-SA')}</span>
            </div>
            ${isWanted.monitor_end_date ? `
              <div class="info-row">
                <span class="info-label">نهاية المراقبة:</span>
                <span class="info-value">${new Date(isWanted.monitor_end_date).toLocaleDateString('ar-SA')}</span>
              </div>
            ` : ''}
            ${isWanted.reason ? `
              <div class="info-row">
                <span class="info-label">سبب المطالبة:</span>
                <span class="info-value">${isWanted.reason}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div class="section">
          <div class="section-title">السجل الأمني</div>
          ${relatedRecords.length > 0 ? `
            <table class="records-table">
              <thead>
                <tr>
                  <th>نوع السجل</th>
                  <th>التاريخ</th>
                  <th>التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                ${relatedRecords.map(record => `
                  <tr>
                    <td>${typeToArabic(record.record_type)}</td>
                    <td>${record.record_date}</td>
                    <td>${record.details || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>لا توجد سجلات أمنية مسجلة.</p>'}
        </div>

        <div class="section">
          <div class="section-title">بيانات الأسرة</div>
          ${familyMembers.length > 0 ? 
            familyMembers.map(member => `
              <div class="family-member">
                <div class="info-row">
                  <span class="info-label">الاسم:</span>
                  <span class="info-value">${member.relative_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">صلة القرابة:</span>
                  <span class="info-value">${member.relation}</span>
                </div>
                ${member.relative_national_id ? `
                  <div class="info-row">
                    <span class="info-label">رقم الهوية:</span>
                    <span class="info-value">${member.relative_national_id}</span>
                  </div>
                ` : ''}
              </div>
            `).join('') 
            : '<p>لا توجد بيانات عائلية مسجلة.</p>'
          }
        </div>

        <div class="footer">
          <p>هذا التقرير صادر من نظام إدارة المخالفات والقضايا - وزارة الداخلية</p>
          <p>تم إنشاء التقرير في: ${new Date().toLocaleString('ar-SA')}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">المخالفات والقضايا</h1>
        <p className="text-muted-foreground mt-2">أدخل رقم الهوية الوطنية لعرض أي مخالفات مرورية أو قضايا مسجلة.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>بحث برقم الهوية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              inputMode="numeric"
              placeholder="أدخل رقم الهوية الوطنية"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/[^0-9]/g, ""))}
              className="md:flex-1"
              aria-label="رقم الهوية الوطنية"
            />
            <Button onClick={handleSearch} className="md:w-40" disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              {loading ? "جاري البحث..." : "بحث"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => searchRelatives(nationalId)}
              disabled={!nationalId.trim()}
              className="md:w-40"
            >
              <Users className="mr-2 h-4 w-4" />
              بحث الأقارب
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setUploadDialogOpen(true)}
              className="md:w-40"
            >
              <Upload className="mr-2 h-4 w-4" />
              رفع ملف Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="mt-8">
        {searched && results.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              لا توجد نتائج مطابقة لرقم الهوية المدخل.
            </CardContent>
          </Card>
        ) : null}

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>النتائج</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>نتائج البحث المطابقة لرقم الهوية: {nationalId}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصورة</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>رقم الهوية</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>تفاصيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => {
                    const isWanted = wantedPersons[r.national_id];
                    return (
                      <TableRow key={r.id} className={isWanted ? "bg-red-50 dark:bg-red-950/20" : ""}>
                        <TableCell>
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                              {citizenPhotos[r.national_id] ? (
                                <img 
                                  src={citizenPhotos[r.national_id]} 
                                  alt={`صورة ${r.citizen_name}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                  لا توجد صورة
                                </div>
                              )}
                            </div>
                            {isWanted && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span>{r.citizen_name}</span>
                                {isWanted && (
                                  <Badge variant="destructive" className="text-xs">
                                    مطلوب
                                  </Badge>
                                )}
                              </div>
                              {isWanted && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  مراقبة: {new Date(isWanted.monitor_start_date).toLocaleDateString('ar-SA')}
                                  {isWanted.monitor_end_date && ` - ${new Date(isWanted.monitor_end_date).toLocaleDateString('ar-SA')}`}
                                </div>
                              )}
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => openDetails(r)}>
                              التفاصيل
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{r.national_id}</TableCell>
                        <TableCell>{typeToArabic(r.record_type)}</TableCell>
                        <TableCell>{r.record_date}</TableCell>
                        <TableCell>{r.details || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>تفاصيل السجل</DialogTitle>
                <DialogDescription>معلومات شاملة عن المواطن والسجلات المرتبطة.</DialogDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                طباعة التقرير
              </Button>
            </div>
          </DialogHeader>
          {selected ? (
            <div className="space-y-6">
              {/* Basic Information with Wanted Status */}
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-medium">المعلومات الأساسية</h3>
                  {wantedPersons[selected.national_id] && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      مطلوب للسلطات
                    </Badge>
                  )}
                </div>
                <div className="mt-2 text-sm space-y-1">
                  <p><span className="font-medium">الاسم:</span> {selected.citizen_name}</p>
                  <p><span className="font-medium">رقم الهوية:</span> {selected.national_id}</p>
                  {wantedPersons[selected.national_id] && (
                    <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-red-700 dark:text-red-300 font-medium mb-2">معلومات المطلوب:</p>
                      <div className="space-y-1 text-red-600 dark:text-red-400">
                        <p><span className="font-medium">بداية المراقبة:</span> {new Date(wantedPersons[selected.national_id].monitor_start_date).toLocaleDateString('ar-SA')}</p>
                        {wantedPersons[selected.national_id].monitor_end_date && (
                          <p><span className="font-medium">نهاية المراقبة:</span> {new Date(wantedPersons[selected.national_id].monitor_end_date).toLocaleDateString('ar-SA')}</p>
                        )}
                        {wantedPersons[selected.national_id].reason && (
                          <p><span className="font-medium">السبب:</span> {wantedPersons[selected.national_id].reason}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <Separator />

              {/* Family Members */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" />
                  <h3 className="font-medium">بيانات الأسرة</h3>
                </div>
                {detailsLoading ? (
                  <p className="text-sm text-muted-foreground">جاري التحميل...</p>
                ) : familyMembers.length > 0 ? (
                  <div className="space-y-2">
                    {familyMembers.map((member) => (
                      <div key={member.id} className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{member.relative_name}</p>
                            <p className="text-sm text-muted-foreground">صلة القرابة: {member.relation}</p>
                            {member.relative_national_id && (
                              <p className="text-sm text-muted-foreground">رقم الهوية: {member.relative_national_id}</p>
                            )}
                          </div>
                          {member.relative_national_id && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setNationalId(member.relative_national_id || "")}
                            >
                              بحث
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">لا توجد بيانات عائلية مسجلة.</p>
                )}
              </section>

              <Separator />

              {/* Security Information */}
              <section>
                <h3 className="font-medium mb-3">المعلومات الأمنية</h3>
                <div className="mt-2">
                  {detailsLoading ? (
                    <p className="text-sm text-muted-foreground">جاري التحميل...</p>
                  ) : relatedRecords.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>النوع</TableHead>
                          <TableHead>التاريخ</TableHead>
                          <TableHead>التفاصيل</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatedRecords.map((rec) => (
                          <TableRow key={rec.id}>
                            <TableCell>{typeToArabic(rec.record_type)}</TableCell>
                            <TableCell>{rec.record_date}</TableCell>
                            <TableCell>{rec.details || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">لا توجد سجلات أمنية.</p>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا يوجد عنصر محدد.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Excel Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفع ملف Excel</DialogTitle>
            <DialogDescription>
              اختر ملف Excel يحتوي على بيانات المخالفات والمطلوبين. يجب أن يحتوي الملف على الأعمدة التالية:
              رقم الهوية، اسم المواطن، نوع السجل (violation/case)، التاريخ، التفاصيل
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleExcelUpload(file);
                }
              }}
              className="w-full"
              disabled={uploading}
            />
            {uploading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                جاري معالجة الملف...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </main>
  );
}
