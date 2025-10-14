import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertTriangle, Computer, CreditCard, Mail, Phone, ArrowLeft, Users } from 'lucide-react';

const Cybercrime = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
          {/* Quick Actions */}
          <div className="mb-6 space-y-3">
            <Button 
              onClick={() => navigate('/cybercrime-reports')}
              className="w-full bg-primary hover:bg-primary/90 font-arabic"
            >
              <Shield className="h-4 w-4 ml-2" />
              عرض تقارير الجرائم الإلكترونية
            </Button>
            
            {user?.role === 'admin' && (
              <Button 
                onClick={() => navigate('/cybercrime-access')}
                className="w-full"
                variant="outline"
              >
                <Users className="h-4 w-4 ml-2" />
                إدارة الصلاحيات
              </Button>
            )}
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="types">أنواع الجرائم</TabsTrigger>
              <TabsTrigger value="investigation">التحقيق</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
                <Card className="p-6">
                <h3 className="text-lg font-bold font-arabic mb-4">نظرة عامة على الجرائم الإلكترونية - محافظة الخليل</h3>
                <div className="space-y-4 text-sm">
                  <p>
                    دائرة الجرائم الإلكترونية في محافظة الخليل تتولى التحقيق في القضايا الإلكترونية التي تؤثر على المواطنين في الخليل ومدنها (دورا، سعير، بني نعيم، حلحول، بيت أمر).
                  </p>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 text-destructive mr-2" />
                      <span className="font-semibold text-destructive">تحذير هام</span>
                    </div>
                    <p className="text-xs">
                      هذه المعلومات سرية ومخصصة للاستخدام الرسمي فقط. يُمنع تداولها خارج نطاق العمل - دائرة الجرائم الإلكترونية الخليل.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold font-arabic mb-3">إحصائيات سريعة - محافظة الخليل</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-primary">7</div>
                    <div className="text-xs text-muted-foreground">قضايا نشطة</div>
                  </div>
                  <div className="bg-success/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-success">23</div>
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
                  <h4 className="font-semibold font-arabic mb-2">الخط الساخن للطوارئ - محافظة الخليل</h4>
                  <div className="text-2xl font-bold text-emergency mb-2">0599000000</div>
                  <p className="text-xs text-muted-foreground">متاح 24/7 للحالات العاجلة - دائرة الجرائم الإلكترونية الخليل</p>
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