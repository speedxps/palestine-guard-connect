import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type RecordItem = {
  id: string;
  national_id: string;
  citizen_name: string;
  record_type: "violation" | "case";
  record_date: string; // ISO date string
  details: string | null;
};

const typeToArabic = (t: RecordItem["record_type"]) => (t === "violation" ? "مخالفة مرورية" : "قضية");

export default function Violations() {
  const [nationalId, setNationalId] = useState("");
  const [results, setResults] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [citizenPhotos, setCitizenPhotos] = useState<Record<string, string>>({});
  const { toast } = useToast();

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

  // Load related records for the selected person when dialog opens
  useEffect(() => {
    const fetchRelated = async () => {
      if (!detailsOpen || !selected?.national_id) return;
      setDetailsLoading(true);
      try {
        const { data, error } = await supabase
          .from("traffic_records")
          .select("id, national_id, citizen_name, record_type, record_date, details")
          .eq("national_id", selected.national_id)
          .order("record_date", { ascending: false });
        if (error) throw error;
        setRelatedRecords(data || []);
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
                  {results.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span>{r.citizen_name}</span>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تفاصيل السجل</DialogTitle>
            <DialogDescription>معلومات شاملة عن المواطن والسجلات المرتبطة.</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-6">
              <section>
                <h3 className="font-medium">المعلومات الأساسية</h3>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>الاسم: {selected.citizen_name}</p>
                  <p>رقم الهوية: {selected.national_id}</p>
                </div>
              </section>

              <section>
                <h3 className="font-medium">المركبات</h3>
                <p className="mt-2 text-sm text-muted-foreground">لا توجد بيانات متاحة.</p>
              </section>

              <section>
                <h3 className="font-medium">بيانات الأسرة</h3>
                <p className="mt-2 text-sm text-muted-foreground">لا توجد بيانات متاحة.</p>
              </section>

              <section>
                <h3 className="font-medium">المعلومات الأمنية</h3>
                <div className="mt-2">
                  {detailsLoading ? (
                    <p className="text-sm text-muted-foreground">جاري التحميل...</p>
                  ) : relatedRecords.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>النوع</TableHead>
                          <TableHead>التاريخ</TableHead>
                          <TableHead>الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatedRecords.map((rec) => (
                          <TableRow key={rec.id}>
                            <TableCell>{typeToArabic(rec.record_type)}</TableCell>
                            <TableCell>{rec.record_date}</TableCell>
                            <TableCell>-</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">لا توجد سجلات.</p>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا يوجد عنصر محدد.</p>
          )}
        </DialogContent>
      </Dialog>

    </main>
  );
}
