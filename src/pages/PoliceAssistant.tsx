import React from 'react';
import VoiceAssistant from '@/components/VoiceAssistant';
import { BackButton } from '@/components/BackButton';
import { Card } from '@/components/ui/card';
import { Bot, Mic, MessageSquare, FileText } from 'lucide-react';

const PoliceAssistant = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Modern Header */}
        <div className="flex items-center justify-between mb-8">
          <BackButton />
          <div className="flex items-center gap-3 bg-card px-6 py-3 rounded-full shadow-lg border">
            <Bot className="h-7 w-7 text-primary animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              المساعد الذكي للشرطة
            </h1>
          </div>
          <div />
        </div>

        {/* Main Assistant Card with Modern Design */}
        <Card className="shadow-2xl border-2 border-primary/20 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/20 rounded-full">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">مساعدك الذكي المتطور</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              تحدث أو اكتب للحصول على مساعدة فورية في جميع المهام الشرطية
            </p>
          </div>
          
          <div className="p-6">
            <VoiceAssistant className="w-full" />
          </div>
        </Card>

        {/* Modern Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-primary/30">
            <div className="p-6 text-center">
              <div className="inline-flex p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Mic className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">المحادثة الصوتية</h3>
              <p className="text-sm text-muted-foreground">
                تحدث مباشرة مع المساعد واحصل على استجابات فورية
              </p>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-primary/30">
            <div className="p-6 text-center">
              <div className="inline-flex p-4 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">إنشاء التقارير</h3>
              <p className="text-sm text-muted-foreground">
                مساعدة ذكية في كتابة وتنسيق التقارير الشرطية
              </p>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-primary/30">
            <div className="p-6 text-center">
              <div className="inline-flex p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">الاستعلامات القانونية</h3>
              <p className="text-sm text-muted-foreground">
                إجابات دقيقة على الأسئلة القانونية والإجرائية
              </p>
            </div>
          </Card>
        </div>

        {/* Additional Info Card */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              💡 <span className="font-semibold">نصيحة:</span> استخدم الأوامر الصوتية أو اكتب أسئلتك بوضوح للحصول على أفضل النتائج
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PoliceAssistant;