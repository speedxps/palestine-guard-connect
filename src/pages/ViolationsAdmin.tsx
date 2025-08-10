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
import { Edit, Filter, Plus, Trash2 } from "lucide-react";
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

  // Add form
  const [nationalId, setNationalId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<EntryType>("violation");
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");

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
              <Input id="nid" inputMode="numeric" value={nationalId} onChange={(e) => setNationalId(e.target.value.replace(/[^0-9]/g, ""))} placeholder="مثال: 401234567" />
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
                  <TableCell>{r.citizen_name}</TableCell>
                  <TableCell>{r.national_id}</TableCell>
                  <TableCell>{typeToArabic(r.record_type)}</TableCell>
                  <TableCell>{r.record_date}</TableCell>
                  <TableCell className="max-w-[320px] truncate" title={r.details || undefined}>{r.details || "-"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(r)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteRecord(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
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
    </main>
  );
}
