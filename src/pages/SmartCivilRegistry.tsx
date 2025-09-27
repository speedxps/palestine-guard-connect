import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function SmartCivilRegistry() {
  const [citizen, setCitizen] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCitizen = async () => {
      setLoading(true);

      // جلب بيانات المواطن الأساسي
      const { data: citizenData } = await supabase
        .from("citizens")
        .select("*")
        .limit(1)
        .single();

      if (citizenData) {
        setCitizen(citizenData);

        // جلب الممتلكات
        const { data: props } = await supabase
          .from("properties")
          .select("*")
          .eq("citizen_id", citizenData.id);
        setProperties(props || []);

        // جلب السجل التاريخي
        const { data: logs } = await supabase
          .from("audit_logs")
          .select("*")
          .eq("citizen_id", citizenData.id)
          .order("performed_at", { ascending: false });
        setAuditLogs(logs || []);
      }

      setLoading(false);
    };

    fetchCitizen();
  }, []);

  if (loading) {
    return <p className="text-center py-10">جاري التحميل...</p>;
  }

  if (!citizen) {
    return <p className="text-center py-10">لم يتم العثور على مواطن</p>;
  }

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>الملف المدني الذكي</CardTitle>
        </CardHeader>
        <CardContent>
          <p><b>الاسم:</b> {citizen.full_name}</p>
          <p><b>رقم الهوية:</b> {citizen.national_id}</p>
          <p><b>تاريخ الميلاد:</b> {citizen.date_of_birth}</p>
          <p><b>مكان السكن:</b> {citizen.address}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="properties">الممتلكات</TabsTrigger>
          <TabsTrigger value="security">الحالة الأمنية</TabsTrigger>
          <TabsTrigger value="history">السجل التاريخي</TabsTrigger>
        </TabsList>

        {/* تبويب الممتلكات */}
        <TabsContent value="properties">
          {properties.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              لا يوجد ممتلكات مسجلة لهذا المواطن
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {properties.map((property) => (
                <Card key={property.id}>
                  <CardHeader>
                    <CardTitle>{property.property_type}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><b>الوصف:</b> {property.property_description}</p>
                    <p><b>رقم التسجيل:</b> {property.registration_number || "غير محدد"}</p>
                    <p><b>القيمة:</b> {property.value ? `${property.value} ₪` : "غير محدد"}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* تبويب الحالة الأمنية */}
        <TabsContent value="security">
          {citizen.security_status ? (
            <Card>
              <CardHeader>
                <CardTitle>الحالة الأمنية</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{citizen.security_status}</p>
              </CardContent>
            </Card>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              لا يوجد بيانات أمنية لهذا المواطن
            </p>
          )}
        </TabsContent>

        {/* تبويب السجل التاريخي */}
        <TabsContent value="history">
          {auditLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              لا يوجد سجل عمليات
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العملية</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المنفذ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.action_type}</TableCell>
                    <TableCell>
                      {new Date(log.performed_at).toLocaleString("ar-SA")}
                    </TableCell>
                    <TableCell>{log.performed_by || "غير معروف"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
