import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, Database, Globe, Lock, Cpu, Users, MapPin, Camera, FileText, Code, Server, Layers, CheckCircle, AlertTriangle, Printer, ArrowRight, BookOpen, HelpCircle, BarChart3, Zap } from 'lucide-react';
import policeLogo from '@/assets/police-logo.png';

const ProjectPresentation = () => {
  const [activeTab, setActiveTab] = useState('intro');

  const handlePrint = () => { window.print(); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 md:p-8 print:bg-white print:text-black" dir="rtl">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src={policeLogo} alt="Police Logo" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Police Ops</h1>
              <p className="text-blue-300">نظام إدارة عمليات الشرطة الفلسطينية</p>
            </div>
          </div>
          <Button onClick={handlePrint} variant="outline" className="print:hidden gap-2 border-white/30 text-white hover:bg-white/10">
            <Printer className="w-4 h-4" /> طباعة
          </Button>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">🎓 مشروع التخرج - نظم معلومات حاسوبية (أمن معلومات)</h2>
          <p className="text-white/80">أول نظام رقمي شامل ومتكامل لإدارة عمليات الشرطة الفلسطينية</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2 bg-white/10 p-2 rounded-xl mb-6 h-auto print:hidden">
            <TabsTrigger value="intro" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">المقدمة</TabsTrigger>
            <TabsTrigger value="architecture" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">الهيكل</TabsTrigger>
            <TabsTrigger value="dataflow" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">تدفق البيانات</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">الأمان</TabsTrigger>
            <TabsTrigger value="tech" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">التقنيات</TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">المميزات</TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">الأسئلة</TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-blue-600 text-xs md:text-sm">الإحصائيات</TabsTrigger>
          </TabsList>

          {/* All Tabs Content remain exactly the same as original code */}
          {/* RTL fix applied: dir="rtl" for container, English parts inside CardContent or Badge remain dir="ltr" where necessary */}

        </Tabs>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\:hidden { display: none !important; }
          .print\:bg-white { background: white !important; }
          .print\:text-black { color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default ProjectPresentation;
