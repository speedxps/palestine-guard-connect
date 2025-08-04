import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Computer, CreditCard, Mail, Phone, Globe, ArrowLeft } from 'lucide-react';

const Cybercrime = () => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkCybercrimeAccess();
  }, [user]);

  const checkCybercrimeAccess = async () => {
    if (!user) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    try {
      // Check if user is admin first
      if (user.role === 'admin') {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      // Check cybercrime access directly from the table
      const { data, error } = await supabase
        .from('cybercrime_access')
        .select('is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // User has access if they have an active cybercrime_access record
      setHasAccess(!!data);
    } catch (error) {
      console.error('Error checking cybercrime access:', error);
      setHasAccess(false);
      toast({
        title: "خطأ في التحقق من الصلاحيات",
        description: "لا يمكن التحقق من صلاحيات الوصول",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="mobile-container">
        <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex flex-col justify-center px-6">
          <Card className="p-8 text-center">
            <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold font-arabic mb-4">الوصول محظور</h2>
            <p className="text-muted-foreground mb-6">
              هذه الصفحة مخصصة للضباط المعتمدين في قسم الجرائم الإلكترونية فقط
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Access Restricted to Authorized Cyber Crime Officers Only
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة للصفحة الرئيسية
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Badge variant="destructive" className="text-xs">
              سري للغاية
            </Badge>
          </div>
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-bold font-arabic">دائرة الجرائم الإلكترونية</h1>
          </div>
          <p className="text-sm text-muted-foreground font-inter">
            Cybercrime Investigation Unit
          </p>
        </div>

        <div className="px-4 pb-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="types">أنواع الجرائم</TabsTrigger>
              <TabsTrigger value="investigation">التحقيق</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-bold font-arabic mb-4">نظرة عامة على الجرائم الإلكترونية</h3>
                <div className="space-y-4 text-sm">
                  <p>
                    الجرائم الإلكترونية هي أي نشاط إجرامي يتضمن استخدام أجهزة الكمبيوتر أو الشبكات أو الأجهزة المتصلة بالإنترنت كأدوات أو أهداف أو مكان لارتكاب الجريمة.
                  </p>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 text-destructive mr-2" />
                      <span className="font-semibold text-destructive">تحذير هام</span>
                    </div>
                    <p className="text-xs">
                      هذه المعلومات سرية ومخصصة للاستخدام الرسمي فقط. يُمنع تداولها خارج نطاق العمل.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold font-arabic mb-3">إحصائيات سريعة</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-primary">24</div>
                    <div className="text-xs text-muted-foreground">قضايا نشطة</div>
                  </div>
                  <div className="bg-success/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-success">156</div>
                    <div className="text-xs text-muted-foreground">قضايا محلولة</div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="types" className="space-y-4">
              <div className="grid gap-4">
                <Card className="p-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <CreditCard className="h-6 w-6 text-destructive mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold font-arabic mb-2">الابتزاز الإلكتروني</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        تهديد الضحايا بنشر معلومات أو صور حساسة مقابل المال أو خدمات.
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="bg-muted rounded px-2 py-1">
                          <strong>العلامات:</strong> طلب أموال، تهديدات، صور شخصية
                        </div>
                        <div className="bg-muted rounded px-2 py-1">
                          <strong>الإجراء:</strong> حفظ الأدلة، عدم الدفع، الإبلاغ فوراً
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <Mail className="h-6 w-6 text-warning mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold font-arabic mb-2">الاحتيال الإلكتروني</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        خداع الضحايا للحصول على معلومات مالية أو شخصية.
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="bg-muted rounded px-2 py-1">
                          <strong>الأنواع:</strong> رسائل مزيفة، مواقع وهمية، مكالمات احتيالية
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <Computer className="h-6 w-6 text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold font-arabic mb-2">اختراق الأنظمة</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        الوصول غير المصرح به لأنظمة الكمبيوتر أو الشبكات.
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="bg-muted rounded px-2 py-1">
                          <strong>المؤشرات:</strong> نشاط غير طبيعي، بطء النظام، ملفات مشبوهة
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="investigation" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-bold font-arabic mb-4">إجراءات التحقيق</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold mb-2">1. جمع الأدلة الرقمية</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• حفظ لقطات الشاشة</li>
                      <li>• توثيق الرسائل والمحادثات</li>
                      <li>• جمع عناوين IP والبيانات التقنية</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-warning pl-4">
                    <h4 className="font-semibold mb-2">2. التحليل الفني</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• تحليل البيانات الوصفية</li>
                      <li>• تتبع المسارات الرقمية</li>
                      <li>• فحص الأجهزة المشبوهة</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-success pl-4">
                    <h4 className="font-semibold mb-2">3. الإجراءات القانونية</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• تحرير محضر رسمي</li>
                      <li>• التنسيق مع النيابة</li>
                      <li>• متابعة القضية قضائياً</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-center">
                  <Phone className="h-8 w-8 text-emergency mx-auto mb-3" />
                  <h4 className="font-semibold font-arabic mb-2">الخط الساخن للطوارئ</h4>
                  <div className="text-2xl font-bold text-emergency mb-2">101</div>
                  <p className="text-xs text-muted-foreground">متاح 24/7 للحالات العاجلة</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Cybercrime;