import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealTimeFaceRecognition } from '@/components/face-recognition/RealTimeFaceRecognition';
import { FaceRecognitionUpload } from '@/components/face-recognition/FaceRecognitionUpload';
import BatchProcessEmbeddings from '@/components/BatchProcessEmbeddings';
import { Camera, Upload, Settings } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { PageHeader } from '@/components/layout/PageHeader';

const RealTimeFaceRecognitionPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="نظام التعرف على الوجوه الاحترافي"
        description="نظام تعرف على الوجوه في الوقت الفعلي باستخدام face-api.js و pgvector"
      />

      <div className="container mx-auto p-6 space-y-6">
        <BackButton />

        <Tabs defaultValue="camera" dir="rtl" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              كاميرا مباشرة
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              رفع صورة
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              معالجة دفعية
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="mt-6">
            <RealTimeFaceRecognition />
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <FaceRecognitionUpload />
          </TabsContent>

          <TabsContent value="batch" className="mt-6">
            <BatchProcessEmbeddings />
          </TabsContent>
        </Tabs>

        {/* قسم شرح آلية العمل */}
        <div className="bg-gradient-to-br from-primary/5 to-primary-glow/5 border border-primary/20 rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">🔍 كيف يعمل نظام التعرف على الوجوه؟</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-background/80 backdrop-blur rounded-lg p-5 border border-border">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                كشف الوجه (Face Detection)
              </h4>
              <p className="text-muted-foreground leading-relaxed mr-9">
                يستخدم النظام نموذج <strong>SSD MobileNet V1</strong> للكشف عن الوجوه في الصورة أو الفيديو.
                يحدد موقع الوجه بدقة عالية ويرسم مربع حوله (Bounding Box).
              </p>
              <div className="mt-3 mr-9 flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-primary/10 rounded text-primary font-medium">السرعة: ~50ms</span>
                <span className="px-2 py-1 bg-primary/10 rounded text-primary font-medium">الدقة: 95%+</span>
              </div>
            </div>

            <div className="bg-background/80 backdrop-blur rounded-lg p-5 border border-border">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                تحديد معالم الوجه (Face Landmarks)
              </h4>
              <p className="text-muted-foreground leading-relaxed mr-9">
                يحدد النظام <strong>68 نقطة معلمية</strong> على الوجه (العيون، الأنف، الفم، الحواجب، شكل الوجه).
                هذه النقاط تساعد في توجيه الوجه وتحسين دقة التعرف.
              </p>
              <div className="mt-3 mr-9 grid grid-cols-2 gap-2 text-sm">
                <span className="px-2 py-1 bg-blue-500/10 rounded text-blue-600 font-medium">العيون: 12 نقطة</span>
                <span className="px-2 py-1 bg-blue-500/10 rounded text-blue-600 font-medium">الأنف: 9 نقاط</span>
                <span className="px-2 py-1 bg-blue-500/10 rounded text-blue-600 font-medium">الفم: 20 نقطة</span>
                <span className="px-2 py-1 bg-blue-500/10 rounded text-blue-600 font-medium">الوجه: 27 نقطة</span>
              </div>
            </div>

            <div className="bg-background/80 backdrop-blur rounded-lg p-5 border border-border">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                استخراج البصمة الرقمية (Face Embedding)
              </h4>
              <p className="text-muted-foreground leading-relaxed mr-9">
                يحول النظام الوجه إلى <strong>بصمة رقمية فريدة</strong> مكونة من <strong>128 رقم</strong> (Face Descriptor).
                هذه الأرقام تمثل خصائص الوجه الفريدة وتُستخدم للمقارنة والبحث.
              </p>
              <div className="mt-3 mr-9 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded p-3 text-sm">
                <div className="font-mono text-xs text-muted-foreground">
                  [0.245, -0.891, 0.634, 0.127, -0.456, 0.783, ...]
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  مثال على Face Embedding: 128 رقم عشري بين -1 و +1
                </p>
              </div>
            </div>

            <div className="bg-background/80 backdrop-blur rounded-lg p-5 border border-border">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span>
                البحث في قاعدة البيانات (Vector Search)
              </h4>
              <p className="text-muted-foreground leading-relaxed mr-9">
                يُرسل النظام البصمة الرقمية إلى قاعدة البيانات التي تستخدم <strong>pgvector</strong> للبحث السريع.
                يتم حساب <strong>Cosine Similarity</strong> بين البصمة المُدخلة وجميع البصمات المحفوظة.
              </p>
              <div className="mt-3 mr-9 space-y-2">
                <div className="flex items-center justify-between text-sm bg-green-500/10 rounded p-2">
                  <span className="text-muted-foreground">تطابق عالي (High Confidence)</span>
                  <span className="font-bold text-green-600">80% - 100%</span>
                </div>
                <div className="flex items-center justify-between text-sm bg-yellow-500/10 rounded p-2">
                  <span className="text-muted-foreground">تطابق متوسط (Medium Confidence)</span>
                  <span className="font-bold text-yellow-600">70% - 80%</span>
                </div>
                <div className="flex items-center justify-between text-sm bg-orange-500/10 rounded p-2">
                  <span className="text-muted-foreground">تطابق منخفض (Low Confidence)</span>
                  <span className="font-bold text-orange-600">60% - 70%</span>
                </div>
              </div>
            </div>

            <div className="bg-background/80 backdrop-blur rounded-lg p-5 border border-border">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">5</span>
                عرض النتائج (Results Display)
              </h4>
              <p className="text-muted-foreground leading-relaxed mr-9">
                يعرض النظام أقرب <strong>5 تطابقات</strong> مع نسبة التشابه لكل منها.
                في وضع الكاميرا المباشرة، يتم رسم مربع أخضر حول الوجه مع اسم الشخص ونسبة التطابق.
              </p>
              <div className="mt-3 mr-9 flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-green-500/10 rounded text-green-600 font-medium">✓ وجه معروف</span>
                <span className="px-2 py-1 bg-red-500/10 rounded text-red-600 font-medium">✗ وجه غير معروف</span>
                <span className="px-2 py-1 bg-yellow-500/10 rounded text-yellow-600 font-medium">⚠ تطابق منخفض</span>
              </div>
            </div>
          </div>

          {/* نصائح للحصول على أفضل النتائج */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-5 border border-blue-500/20">
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              💡 نصائح للحصول على أفضل النتائج
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-muted-foreground">استخدم إضاءة جيدة ومتوازنة</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-muted-foreground">اجعل الوجه أمام الكاميرا مباشرة</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-muted-foreground">تجنب الظلال القوية على الوجه</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-muted-foreground">استخدم صور واضحة بدقة عالية</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span className="text-muted-foreground">تجنب الوجوه المائلة أو الجانبية</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span className="text-muted-foreground">تجنب الأقنعة أو النظارات الداكنة</span>
              </div>
            </div>
          </div>
        </div>

        {/* معلومات تقنية */}
        <div className="bg-muted/50 border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">📊 المعلومات التقنية</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-muted-foreground">التقنية المستخدمة</p>
              <p>face-api.js + pgvector</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">نوع البيانات</p>
              <p>Face Embeddings (128 dimensions)</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">طريقة المقارنة</p>
              <p>Cosine Similarity</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">الدقة المتوقعة</p>
              <p>99%+ في الظروف المثالية</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">السرعة</p>
              <p>&lt; 100ms للبحث</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">الحد الأدنى للتطابق</p>
              <p>60% (قابل للتعديل)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeFaceRecognitionPage;