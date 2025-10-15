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
              سيقوم هذا الإجراء بإنشاء الحسابات التالية (admin@test.com، traffic@test.com، cid@test.com، special@test.com، cyber@test.com، judicial@test.com)
              بكلمات المرور المحددة مسبقًا.
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
