import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, AlertTriangle, Users, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
            <DialogTitle>تفاصيل السجل</DialogTitle>
            <DialogDescription>معلومات شاملة عن المواطن والسجلات المرتبطة.</DialogDescription>
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

    </main>
  );
}
