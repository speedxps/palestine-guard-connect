import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, Trash2, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SimpleFaceLoginSetup } from '@/components/SimpleFaceLoginSetup';
import { FaceUploadSetup } from '@/components/FaceUploadSetup';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function FaceLoginSetup() {
  const navigate = useNavigate();
  const [existingFaceData, setExistingFaceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingFaceData();
  }, []);

  const checkExistingFaceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('face_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setExistingFaceData(data);
    } catch (error) {
      console.error('Error checking face data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaceData = async () => {
    if (!existingFaceData) return;

    const confirmed = window.confirm('هل أنت متأكد من حذف بيانات الوجه؟ ستحتاج إلى إعادة التسجيل لاستخدام تسجيل الدخول بالوجه.');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('face_data')
        .update({ is_active: false })
        .eq('id', existingFaceData.id);

      if (error) throw error;

      // Also disable face login in profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ face_login_enabled: false })
          .eq('id', user.id);
      }

      toast.success('تم حذف بيانات الوجه بنجاح');
      setExistingFaceData(null);
    } catch (error) {
      console.error('Error deleting face data:', error);
      toast.error('فشل في حذف بيانات الوجه');
    }
  };

  const handleSuccess = () => {
    toast.success('تم تسجيل الوجه بنجاح! 🎉');
    checkExistingFaceData();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إعداد تسجيل الدخول بالوجه</h1>
            <p className="text-muted-foreground mt-2">
              قم بتسجيل بيانات وجهك لتسجيل الدخول بشكل سريع وآمن
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/profile')}>
            العودة للملف الشخصي
          </Button>
        </div>

        {existingFaceData && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>تم تفعيل تسجيل الدخول بالوجه</strong>
                  <p className="text-sm mt-1">
                    آخر تحديث: {new Date(existingFaceData.updated_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteFaceData}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف البيانات
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>تأكد من أن الإضاءة جيدة وأن وجهك واضح</li>
              <li>انظر مباشرة إلى الكاميرا</li>
              <li>تجنب ارتداء النظارات الشمسية أو القبعات</li>
              <li>يمكنك استخدام الكاميرا مباشرة أو رفع صورة من جهازك</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>
              {existingFaceData ? 'تحديث بيانات الوجه' : 'تسجيل بيانات الوجه'}
            </CardTitle>
            <CardDescription>
              اختر الطريقة المفضلة لتسجيل صورة وجهك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="camera" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="camera" className="gap-2">
                  <Camera className="h-4 w-4" />
                  التقاط بالكاميرا
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  رفع صورة
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="camera" className="mt-6">
                <SimpleFaceLoginSetup 
                  onSuccess={handleSuccess}
                />
              </TabsContent>
              
              <TabsContent value="upload" className="mt-6">
                <FaceUploadSetup 
                  onSuccess={handleSuccess}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>كيف يعمل النظام؟</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. تسجيل بي��نات الوجه</h4>
              <p className="text-sm text-muted-foreground">
                عند تسجيل صورة وجهك، يقوم النظام بتحليل الملامح الدقيقة لوجهك وإنشاء "بصمة" رقمية فريدة يتم تخزينها بشكل آمن.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">2. تسجيل الدخول بالوجه</h4>
              <p className="text-sm text-muted-foreground">
                في صفحة تسجيل الدخول، انقر على زر "تسجيل الدخول بالوجه" واسمح للكاميرا بالتقاط صورة. سيقوم النظام بمقارنة الصورة مع البيانات المحفوظة.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">3. الأمان والخصوصية</h4>
              <p className="text-sm text-muted-foreground">
                جميع بيانات الوجه محمية بتشفير عالي المستوى. لا يمكن لأي شخص الوصول إلى بياناتك غيرك.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
