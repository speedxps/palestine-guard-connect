import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Filter, Plus, Trash2, Upload, User, AlertTriangle } from "lucide-react";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

// DB Types
type EntryType = "violation" | "case";
interface RecordItem {
  id: string;
  national_id: string;
  citizen_name: string;
  record_type: EntryType;
  record_date: string; // ISO date
  details: string | null;
}

const typeToArabic = (t: EntryType) => (t === "violation" ? "مخالفة مرورية" : "قضية");

export default function ViolationsAdmin() {
  const { toast } = useToast();

  // SEO
  useEffect(() => {
    document.title = "لوحة إدارة المخالفات والقضايا | الشرطة";
    const desc = "إدارة وإضافة وتعديل سجلات المخالفات والقضايا مع إمكانات التصفية";
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

  const [data, setData] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [markWantedDialogOpen, setMarkWantedDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [citizenPhotos, setCitizenPhotos] = useState<Record<string, string>>({});
  
  // Photo management
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<{national_id: string, name: string} | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [excelUploading, setExcelUploading] = useState(false);
  const [markingWanted, setMarkingWanted] = useState(false);

  // Add form
  const [nationalId, setNationalId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<EntryType>("violation");
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");
  const [isLoadingCitizen, setIsLoadingCitizen] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<"all" | EntryType>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Edit dialog
  const [editing, setEditing] = useState<RecordItem | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("traffic_records")
        .select("id, national_id, citizen_name, record_type, record_date, details")
        .order("record_date", { ascending: false });

      if (typeFilter !== "all") query = query.eq("record_type", typeFilter);
      if (fromDate) query = query.gte("record_date", fromDate);
      if (toDate) query = query.lte("record_date", toDate);

      const { data, error } = await query;
      if (error) throw error;
      setData(data || []);
      
      // Fetch citizen photos
      if (data && data.length > 0) {
        const nationalIds = [...new Set(data.map(r => r.national_id))];
        const { data: citizenData, error: citizenError } = await supabase
          .from("citizens")
          .select("national_id, photo_url")
          .in("national_id", nationalIds);
        
        if (!citizenError && citizenData) {
          const photoMap = citizenData.reduce((acc, citizen) => {
            if (citizen.photo_url) {
              acc[citizen.national_id] = citizen.photo_url;
            }
            return acc;
          }, {} as Record<string, string>);
          setCitizenPhotos(photoMap);
        }
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      toast({ title: "خطأ في الجلب", description: "تعذر تحميل السجلات.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, fromDate, toDate]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("traffic-records-admin")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "traffic_records" }, fetchData)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "traffic_records" }, fetchData)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "traffic_records" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch citizen data from Smart Civil Registry
  const fetchCitizenByNationalId = async (nationalIdValue: string) => {
    if (!nationalIdValue || nationalIdValue.length < 9) return;
    
    setIsLoadingCitizen(true);
    try {
      const { data, error } = await supabase
        .from('citizens')
        .select('full_name, first_name, second_name, third_name, family_name, phone, address, date_of_birth')
        .eq('national_id', nationalIdValue)
        .maybeSingle();

      if (error) {
        console.error('Error fetching citizen:', error);
        return;
      }

      if (data) {
        // Auto-fill the name field
        setName(data.full_name || `${data.first_name || ''} ${data.second_name || ''} ${data.third_name || ''} ${data.family_name || ''}`.trim());
        toast({
          title: "تم العثور على المواطن",
          description: `تم جلب بيانات ${data.full_name} من السجل المدني`,
        });
      } else {
        toast({
          title: "تنبيه",
          description: "رقم الهوية غير موجود في السجل المدني",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoadingCitizen(false);
    }
  };

  const addRecord = async () => {
    if (!nationalId || !name || !date) {
      toast({ title: "بيانات ناقصة", description: "يرجى تعبئة رقم الهوية والاسم والتاريخ", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("traffic_records").insert({
        national_id: nationalId,
        citizen_name: name,
        record_type: type,
        record_date: date,
        details: details || null,
      });
      if (error) throw error;
      setNationalId(""); setName(""); setType("violation"); setDate(""); setDetails("");
      toast({ title: "تمت الإضافة", description: "تمت إضافة السجل بنجاح" });
    } catch (err: any) {
      console.error("Insert error:", err);
      toast({ title: "فشل الإضافة", description: "تحقق من الصلاحيات أو البيانات.", variant: "destructive" });
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase.from("traffic_records").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "تم الحذف", description: "تم حذف السجل" });
    } catch (err: any) {
      console.error("Delete error:", err);
      toast({ title: "فشل الحذف", description: "تحقق من الصلاحيات.", variant: "destructive" });
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const { error } = await supabase
        .from("traffic_records")
        .update({
          national_id: editing.national_id,
          citizen_name: editing.citizen_name,
          record_type: editing.record_type,
          record_date: editing.record_date,
          details: editing.details ?? null,
        })
        .eq("id", editing.id);
      if (error) throw error;
      setEditing(null);
      toast({ title: "تم التعديل", description: "تم حفظ التعديلات" });
    } catch (err: any) {
      console.error("Update error:", err);
      toast({ title: "فشل التعديل", description: "تحقق من الصلاحيات أو البيانات.", variant: "destructive" });
    }
  };

  const openPhotoDialog = (nationalId: string, name: string) => {
    setSelectedCitizen({ national_id: nationalId, name });
    setPhotoDialogOpen(true);
    setPhotoFile(null);
  };

  const uploadPhoto = async () => {
    if (!photoFile || !selectedCitizen) return;
    
    setUploadingPhoto(true);
    try {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${selectedCitizen.national_id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('citizen-photos')
        .upload(fileName, photoFile);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('citizen-photos')
        .getPublicUrl(fileName);
      
      // Update or insert citizen record
      const { error: upsertError } = await supabase
        .from('citizens')
        .upsert({
          national_id: selectedCitizen.national_id,
          full_name: selectedCitizen.name,
          photo_url: publicUrl
        }, {
          onConflict: 'national_id'
        });
      
      if (upsertError) throw upsertError;
      
      // Update local state
      setCitizenPhotos(prev => ({
        ...prev,
        [selectedCitizen.national_id]: publicUrl
      }));
      
      setPhotoDialogOpen(false);
      setPhotoFile(null);
      setSelectedCitizen(null);
      
      toast({ title: "تم رفع الصورة", description: "تم رفع الصورة الشخصية بنجاح" });
    } catch (err: any) {
      console.error("Photo upload error:", err);
      toast({ title: "فشل رفع الصورة", description: "تعذر رفع الصورة. حاول مرة أخرى.", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({ title: "خطأ", description: "يرجى رفع ملف Excel أو CSV", variant: "destructive" });
      return;
    }

    setExcelUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row and process data
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length >= 4) {
          const [nationalId, citizenName, recordType, details] = columns;
          
          // Insert record
          await supabase.from("traffic_records").insert({
            national_id: nationalId,
            citizen_name: citizenName,
            record_type: recordType.toLowerCase() === 'violation' ? 'violation' : 'case',
            record_date: new Date().toISOString().split('T')[0],
            details: details || null,
            is_resolved: false
          });
        }
      }

      toast({ title: "نجح", description: `تم رفع ${lines.length - 1} سجلاً من الملف` });
      fetchData();
    } catch (error) {
      console.error("Excel upload error:", error);
      toast({ title: "خطأ", description: "فشل في معالجة الملف", variant: "destructive" });
    } finally {
      setExcelUploading(false);
      event.target.value = '';
    }
  };

  const markAsWanted = async (citizenNationalId: string) => {
    setMarkingWanted(true);
    try {
      // Find citizen by national ID
      const { data: citizen } = await supabase
        .from("citizens")
        .select("id")
        .eq("national_id", citizenNationalId)
        .single();

      if (!citizen) {
        toast({ title: "خطأ", description: "لم يتم العثور على المواطن", variant: "destructive" });
        return;
      }

      // Add to wanted persons
      const { error } = await supabase
        .from("wanted_persons")
        .insert({
          citizen_id: citizen.id,
          monitor_start_date: new Date().toISOString().split('T')[0],
          reason: "مطلوب للسلطات",
          is_active: true
        });

      if (error) throw error;

      toast({ title: "نجح", description: "تم وضع علامة مطلوب على الشخص" });
    } catch (error) {
      console.error("Mark wanted error:", error);
      toast({ title: "خطأ", description: "فشل في وضع علامة مطلوب", variant: "destructive" });
    } finally {
      setMarkingWanted(false);
    }
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">لوحة إدارة المخالفات والقضايا</h1>
        <p className="text-muted-foreground mt-2">إضافة وتعديل وحذف السجلات مع إمكانات التصفية حسب النوع والتاريخ.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> إضافة سجل جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nid">رقم الهوية</Label>
              <div className="relative">
                <Input 
                  id="nid" 
                  inputMode="numeric" 
                  value={nationalId} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setNationalId(value);
                    if (value.length === 9) {
                      fetchCitizenByNationalId(value);
                    }
                  }}
                  placeholder="مثال: 401234567"
                  disabled={isLoadingCitizen}
                />
                {isLoadingCitizen && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">سيتم جلب البيانات تلقائياً من السجل المدني</p>
            </div>
            <div>
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم المواطن" />
            </div>
            <div>
              <Label>النوع</Label>
              <Select value={type} onValueChange={(v: EntryType) => setType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="violation">مخالفة مرورية</SelectItem>
                  <SelectItem value="case">قضية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">التاريخ</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <Label htmlFor="details">تفاصيل إضافية</Label>
              <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="مثال: تجاوز السرعة المحددة" rows={3} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={addRecord}>إضافة</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> عوامل التصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>نوع السجل</Label>
              <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="violation">مخالفة مرورية</SelectItem>
                  <SelectItem value="case">قضية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>من تاريخ</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <Label>إلى تاريخ</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setUploadDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              رفع ملف Excel
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelUpload}
              style={{ display: 'none' }}
              id="excel-upload"
              disabled={excelUploading}
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('excel-upload')?.click()}
              disabled={excelUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {excelUploading ? "جاري الرفع..." : "رفع سريع CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>السجلات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>{loading ? "جاري التحميل..." : `إجمالي السجلات: ${data.length}`}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>الصورة</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>رقم الهوية</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>التفاصيل</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                        {citizenPhotos[r.national_id] ? (
                          <img 
                            src={citizenPhotos[r.national_id]} 
                            alt={`صورة ${r.citizen_name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openPhotoDialog(r.national_id, r.citizen_name)}
                        title="إدارة الصورة"
                      >
                        <Upload className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{r.citizen_name}</TableCell>
                  <TableCell>{r.national_id}</TableCell>
                  <TableCell>{typeToArabic(r.record_type)}</TableCell>
                  <TableCell>{r.record_date}</TableCell>
                  <TableCell className="max-w-[320px] truncate" title={r.details || undefined}>{r.details || "-"}</TableCell>
                   <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(r)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => markAsWanted(r.national_id)}
                      disabled={markingWanted}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteRecord(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    لا توجد سجلات مطابقة لمعايير التصفية الحالية.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل السجل</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>رقم الهوية</Label>
                  <Input value={editing.national_id} onChange={(e) => setEditing({ ...editing, national_id: e.target.value.replace(/[^0-9]/g, "") })} />
                </div>
                <div>
                  <Label>الاسم</Label>
                  <Input value={editing.citizen_name} onChange={(e) => setEditing({ ...editing, citizen_name: e.target.value })} />
                </div>
                <div>
                  <Label>النوع</Label>
                  <Select value={editing.record_type} onValueChange={(v: EntryType) => setEditing({ ...editing, record_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="violation">مخالفة مرورية</SelectItem>
                      <SelectItem value="case">قضية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>التاريخ</Label>
                  <Input type="date" value={editing.record_date} onChange={(e) => setEditing({ ...editing, record_date: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>تفاصيل إضافية</Label>
                <Textarea value={editing.details || ""} onChange={(e) => setEditing({ ...editing, details: e.target.value })} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
            <Button onClick={saveEdit}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Management Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إدارة الصورة الشخصية</DialogTitle>
          </DialogHeader>
          {selectedCitizen && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mx-auto mb-4">
                  {citizenPhotos[selectedCitizen.national_id] ? (
                    <img 
                      src={citizenPhotos[selectedCitizen.national_id]} 
                      alt={`صورة ${selectedCitizen.name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="font-medium">{selectedCitizen.name}</p>
                <p className="text-sm text-muted-foreground">رقم الهوية: {selectedCitizen.national_id}</p>
              </div>
              
              <div>
                <Label htmlFor="photo-upload">اختر صورة جديدة</Label>
                <Input 
                  id="photo-upload"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoDialogOpen(false)}>إلغاء</Button>
            <Button 
              onClick={uploadPhoto} 
              disabled={!photoFile || uploadingPhoto}
            >
              {uploadingPhoto ? "جاري الرفع..." : "رفع الصورة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excel Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفع ملف Excel للمخالفات والمطلوبين</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              اختر ملف Excel يحتوي على البيانات التالية: رقم الهوية، اسم المواطن، نوع السجل، التفاصيل
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleExcelUpload({ target: { files: [file] } } as any);
                  setUploadDialogOpen(false);
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
