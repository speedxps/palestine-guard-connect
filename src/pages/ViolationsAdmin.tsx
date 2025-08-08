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

// Types
type EntryType = "violation" | "case";

interface RecordItem {
  id: string;
  nationalId: string;
  name: string;
  type: EntryType;
  date: string; // YYYY-MM-DD
  details: string;
}

const STORAGE_KEY = "violationsData";

function loadData(): RecordItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as RecordItem[]; } catch { return []; }
}

function saveData(d: RecordItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

const typeToArabic = (t: EntryType) => (t === "violation" ? "مخالفة مرورية" : "قضية");

export default function ViolationsAdmin() {
  const { toast } = useToast();

  // SEO basics
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
    const linkEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkEl) {
      const l = document.createElement("link");
      l.rel = "canonical";
      l.href = window.location.href;
      document.head.appendChild(l);
    }
  }, []);

  const [data, setData] = useState<RecordItem[]>(() => loadData());

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

  const filtered = useMemo(() => {
    return data.filter((r) => {
      const typeOk = typeFilter === "all" ? true : r.type === typeFilter;
      const d = new Date(r.date).getTime();
      const fromOk = fromDate ? d >= new Date(fromDate).getTime() : true;
      const toOk = toDate ? d <= new Date(toDate).getTime() : true;
      return typeOk && fromOk && toOk;
    });
  }, [data, typeFilter, fromDate, toDate]);

  const addRecord = () => {
    if (!nationalId || !name || !date) {
      toast({ title: "بيانات ناقصة", description: "يرجى تعبئة رقم الهوية والاسم والتاريخ", variant: "destructive" });
      return;
    }
    const newItem: RecordItem = { id: crypto.randomUUID(), nationalId, name, type, date, details };
    const next = [newItem, ...data];
    setData(next);
    saveData(next);
    setNationalId(""); setName(""); setType("violation"); setDate(""); setDetails("");
    toast({ title: "تمت الإضافة", description: "تمت إضافة السجل بنجاح" });
  };

  const deleteRecord = (id: string) => {
    const next = data.filter((r) => r.id !== id);
    setData(next);
    saveData(next);
    toast({ title: "تم الحذف", description: "تم حذف السجل" });
  };

  const openEdit = (item: RecordItem) => setEditing(item);

  const saveEdit = () => {
    if (!editing) return;
    const next = data.map((r) => (r.id === editing.id ? editing : r));
    setData(next);
    saveData(next);
    setEditing(null);
    toast({ title: "تم التعديل", description: "تم حفظ التعديلات" });
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
            <TableCaption>إجمالي السجلات: {filtered.length}</TableCaption>
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
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.nationalId}</TableCell>
                  <TableCell>{typeToArabic(r.type)}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell className="max-w-[320px] truncate" title={r.details}>{r.details}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteRecord(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
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
                  <Input value={editing.nationalId} onChange={(e) => setEditing({ ...editing, nationalId: e.target.value.replace(/[^0-9]/g, "") })} />
                </div>
                <div>
                  <Label>الاسم</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <Label>النوع</Label>
                  <Select value={editing.type} onValueChange={(v: EntryType) => setEditing({ ...editing, type: v })}>
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
                  <Input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>تفاصيل إضافية</Label>
                <Textarea value={editing.details} onChange={(e) => setEditing({ ...editing, details: e.target.value })} rows={3} />
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
