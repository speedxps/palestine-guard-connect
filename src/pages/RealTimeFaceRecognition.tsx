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

        <div className="bg-muted/50 border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">📊 معلومات النظام</h3>
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