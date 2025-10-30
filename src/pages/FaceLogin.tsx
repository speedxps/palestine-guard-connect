import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SimpleFaceLoginVerify } from '@/components/SimpleFaceLoginVerify';
import { useNavigate } from 'react-router-dom';
import { useFaceLogin } from '@/hooks/useFaceLogin';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function FaceLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { verifyFaceAndLogin, isVerifying } = useFaceLogin();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setSelectedImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleEmailVerification = async () => {
    if (!email || !email.includes('@')) {
      toast.error('الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }

    // Check if user exists
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-email-exists', {
        body: { email }
      });

      if (error || !data?.exists) {
        toast.error('البريد الإلكتروني غير مسجل في النظام');
        setIsProcessing(false);
        return;
      }

      setEmailVerified(true);
      toast.success('تم التحقق من البريد، الآن يمكنك المتابعة للتحقق من الوجه');
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('حدث خطأ أثناء التحقق من البريد');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyUploadedImage = async () => {
    if (!selectedImage) {
      toast.error('الرجاء اختيار صورة أولاً');
      return;
    }

    if (!emailVerified) {
      toast.error('يجب التحقق من البريد الإلكتروني أولاً');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await verifyFaceAndLogin(selectedImage);
      
      if (result.success && result.email === email) {
        toast.success('تم تسجيل الدخول بنجاح! 🎉');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else if (result.email !== email) {
        toast.error('الوجه لا يتطابق مع البريد الإلكتروني المدخل');
        setSelectedImage(null);
      } else {
        toast.error(result.error || 'فشل التحقق من الوجه');
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error verifying face:', error);
      toast.error('حدث خطأ أثناء التحقق');
      setSelectedImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraSuccess = () => {
    toast.success('جاري تسجيل الدخول...');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
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
              <li>أدخل بريدك الإلكتروني أولاً للتحقق</li>
              <li>تأكد من أن الإضاءة جيدة وأن وجهك واضح</li>
              <li>انظر مباشرة إلى الكاميرا</li>
              <li>تجنب ارتداء النظارات الشمسية أو القبعات</li>
            </ul>
          </AlertDescription>
        </Alert>

        {!emailVerified && (
          <Card>
            <CardHeader>
              <CardTitle>التحقق من البريد الإلكتروني</CardTitle>
              <CardDescription>
                أدخل بريدك الإلكتروني المسجل أولاً
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    البريد الإلكتروني
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@police.ps"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                <Button
                  onClick={handleEmailVerification}
                  disabled={isProcessing || !email}
                  className="w-full"
                >
                  {isProcessing ? 'جاري التحقق...' : 'التحقق من البريد'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {emailVerified && (
          <Card>
            <CardHeader>
              <CardTitle>اختر طريقة التحقق</CardTitle>
              <CardDescription>
                التقط صورة بالكاميرا أو ارفع صورة من جهازك
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
                <SimpleFaceLoginVerify 
                  onSuccess={handleCameraSuccess}
                  onCancel={() => navigate('/login')}
                />
              </TabsContent>
              
              <TabsContent value="upload" className="mt-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
                    {!selectedImage ? (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-lg font-medium mb-2">اختر صورة وجهك</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            ارفع صورة واضحة لوجهك للتحقق من هويتك
                          </p>
                          <label htmlFor="face-upload">
                            <Button type="button" onClick={() => document.getElementById('face-upload')?.click()}>
                              اختيار صورة
                            </Button>
                          </label>
                          <input
                            id="face-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <img
                          src={selectedImage}
                          alt="Selected face"
                          className="max-w-md mx-auto rounded-lg border"
                        />
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedImage(null)}
                            disabled={isProcessing || isVerifying}
                          >
                            اختيار صورة أخرى
                          </Button>
                          <Button
                            onClick={handleVerifyUploadedImage}
                            disabled={isProcessing || isVerifying}
                          >
                            {isProcessing || isVerifying ? 'جاري التحقق...' : 'تسجيل الدخول'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        )}

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
