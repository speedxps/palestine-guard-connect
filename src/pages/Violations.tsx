import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

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

const DEFAULT_DATA: Omit<RecordItem, "id">[] = [
  {
    nationalId: "401234567",
    name: "Ahmed Mohammed",
    type: "violation",
    date: "2025-07-15",
    details: "Speed limit exceeded",
  },
  {
    nationalId: "402345678",
    name: "Layla Khaled",
    type: "case",
    date: "2025-06-10",
    details: "Property dispute",
  },
  {
    nationalId: "404706285",
    name: "Samer Youssef",
    type: "violation",
    date: "2025-08-01",
    details: "Parking in a prohibited area",
  },
];

function ensureSeedData(): RecordItem[] {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return JSON.parse(existing);
  const seeded: RecordItem[] = DEFAULT_DATA.map((r) => ({ id: crypto.randomUUID(), ...r }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

const typeToArabic = (t: EntryType) => (t === "violation" ? "مخالفة مرورية" : "قضية");

export default function Violations() {
  const [nationalId, setNationalId] = useState("");
  const [data, setData] = useState<RecordItem[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // SEO basics
    document.title = "الاستعلام عن المخالفات والقضايا | الشرطة";
    const desc = "ابحث برقم الهوية عن المخالفات والقضايا المسجلة";
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

  useEffect(() => {
    setData(ensureSeedData());
  }, []);

  const results = useMemo(() => {
    const q = nationalId.trim();
    if (!q) return [] as RecordItem[];
    return data.filter((r) => r.nationalId === q);
  }, [nationalId, data]);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">الاستعلام عن المخالفات والقضايا</h1>
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
            <Button onClick={() => setSearched(true)} className="md:w-40">
              <Search className="mr-2 h-4 w-4" />
              بحث
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
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.nationalId}</TableCell>
                      <TableCell>{typeToArabic(r.type)}</TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{r.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
