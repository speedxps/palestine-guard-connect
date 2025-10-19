import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SetupTestUsers: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any | null>(null);

  React.useEffect(() => {
    document.title = "إنشاء المستخدمين التجريبيين | PoliceOps";
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-test-users", {
        body: {},
      });
      if (error) throw error;
      setResult(data);
      toast({ title: "تم الإنشاء", description: "تم إنشاء/مزامنة حسابات الاختبار" });
    } catch (e: any) {
      toast({
        title: "فشل التنفيذ",
        description: e?.message || "تعذر إنشاء المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6">
      <section className="w-full max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">إنشاء المستخدمين التجريبيين</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm opacity-80">
              سيقوم هذا الإجراء بإنشاء جميع الحسابات التجريبية التالية:
              <br />• admin@test.com (مدير النظام)
              <br />• admin_ops@test.com (العمليات وإدارة الجهاز)
              <br />• traffic@test.com (شرطة المرور)
              <br />• cid@test.com (المباحث الجنائية)
              <br />• special@test.com (الشرطة الخاصة)
              <br />• cyber@test.com (الجرائم الإلكترونية)
              <br />• judicial@test.com (الشرطة القضائية)
              <br />• border_admin@test.com (المعابر والحدود)
              <br />• tourism_admin@test.com (الشرطة السياحية)
              <br />• joint_admin@test.com (العمليات المشتركة)
            </p>
            <Button onClick={handleCreate} disabled={loading} className="w-full">
              {loading ? "جارٍ التنفيذ..." : "إنشاء/مزامنة المستخدمين الآن"}
            </Button>
            {result && (
              <div className="mt-4">
                <h2 className="font-medium mb-2">النتيجة</h2>
                <pre className="text-xs bg-black/5 p-3 rounded overflow-auto max-h-72">
                  {JSON.stringify(result.summary ?? result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default SetupTestUsers;
