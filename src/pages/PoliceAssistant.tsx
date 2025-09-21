import React from 'react';
import VoiceAssistant from '@/components/VoiceAssistant';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

const PoliceAssistant = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">المساعد الذكي للشرطة</h1>
          </div>
          <div></div> {/* Spacer for center alignment */}
        </div>

        {/* Assistant Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Bot className="h-6 w-6 text-primary" />
                مساعد الشرطة الذكي
              </CardTitle>
              <p className="text-muted-foreground">
                يمكنك التحدث معي أو الكتابة لي للحصول على المساعدة في المهام الشرطية
              </p>
            </CardHeader>
            <CardContent>
              <VoiceAssistant className="w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Features Info */}
        <div className="max-w-4xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl mb-2">🎤</div>
              <h3 className="font-semibold mb-1">المحادثة الصوتية</h3>
              <p className="text-sm text-muted-foreground">تحدث مباشرة مع المساعد</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl mb-2">📝</div>
              <h3 className="font-semibold mb-1">كتابة التقارير</h3>
              <p className="text-sm text-muted-foreground">مساعدة في إنشاء التقارير الشرطية</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl mb-2">❓</div>
              <h3 className="font-semibold mb-1">الاستعلامات</h3>
              <p className="text-sm text-muted-foreground">الإجابة على الأسئلة القانونية</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PoliceAssistant;