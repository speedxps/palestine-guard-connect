import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaceLoginWithApi } from '@/components/FaceLoginWithApi';
import { useNavigate } from 'react-router-dom';

export default function FaceLogin() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="container max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/login')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">تسجيل الدخول بالوجه</h1>
            <p className="text-muted-foreground mt-2">
              استخدم وجهك لتسجيل الدخول بشكل سريع وآمن
            </p>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>تأكد من تسجيل صورة وجهك مسبقاً في إعدادات الحساب</li>
              <li>تأكد من أن الإضاءة جيدة وأن وجهك واضح</li>
              <li>انظر مباشرة إلى الكاميرا</li>
              <li>تجنب ارتداء النظارات الشمسية أو القبعات</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              تسجيل الدخول بالوجه
            </CardTitle>
            <CardDescription>
              نظام تعرف احترافي باستخدام face-api.js
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FaceLoginWithApi 
              onSuccess={handleSuccess}
              onCancel={() => navigate('/login')}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>كيف يعمل النظام؟</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. التقاط أو رفع صورة</h4>
              <p className="text-sm text-muted-foreground">
                قم بالتقاط صورة لوجهك باستخدام الكاميرا أو ارفع صورة واضحة من جهازك.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">2. التحقق التلقائي</h4>
              <p className="text-sm text-muted-foreground">
                يقوم النظام بمقارنة صورتك مع البيانات المحفوظة في قاعدة البيانات باستخدام الذكاء الاصطناعي.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">3. تسجيل الدخول الفوري</h4>
              <p className="text-sm text-muted-foreground">
                في حال التطابق، سيتم تسجيل دخولك تلقائياً دون الحاجة لإدخال البريد الإلكتروني أو كلمة المرور.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">4. الأمان والخصوصية</h4>
              <p className="text-sm text-muted-foreground">
                جميع بيانات الوجه محمية بتشفير عالي المستوى. لا يمكن لأي شخص الوصول إلى بياناتك غيرك.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
