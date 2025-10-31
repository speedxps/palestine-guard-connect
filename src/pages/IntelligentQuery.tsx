import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Send, Sparkles, Clock, FileSearch, Car, User, TrendingUp } from 'lucide-react';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';
import { IntelligentReportViewer } from '@/components/IntelligentReportViewer';
import { intelligentQueryService, QueryResponse } from '@/services/intelligentQueryService';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'report';
  content: string;
  timestamp: Date;
  reportData?: QueryResponse;
}

const quickQueries = [
  {
    icon: TrendingUp,
    label: 'إحصائيات اليوم',
    query: 'أعطني إحصائيات اليوم عن المخالفات والحوادث والقضايا'
  },
  {
    icon: FileSearch,
    label: 'بحث برقم هوية',
    query: 'أعطني معلومات شاملة عن المواطن رقم الهوية '
  },
  {
    icon: Car,
    label: 'بحث عن مركبة',
    query: 'معلومات عن السيارة رقم '
  },
  {
    icon: User,
    label: 'بحث بالاسم',
    query: 'ابحث عن مواطن باسم '
  }
];

export default function IntelligentQuery() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي للاستعلام عن أي معلومات في النظام. يمكنك السؤال عن مواطن برقم الهوية، البحث بالاسم، الاستعلام عن مركبة، أو طلب إحصائيات. كيف يمكنني مساعدتك؟',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendQuery = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await intelligentQueryService.sendQuery(inputValue);

      if (response.type === 'error') {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'حدث خطأ أثناء معالجة الاستعلام',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const reportMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'report',
          content: 'تم إنشاء التقرير',
          timestamp: new Date(),
          reportData: response
        };
        setMessages(prev => [...prev, reportMessage]);
      }
    } catch (error: any) {
      console.error('Query error:', error);
      toast.error('حدث خطأ أثناء معالجة الاستعلام');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'عذراً، حدث خطأ أثناء معالجة استعلامك. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuery = (query: string) => {
    setInputValue(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  return (
    <ProfessionalLayout
      title="الاستعلام الإلكتروني الذكي"
      description="استعلم عن أي معلومات في النظام باستخدام الذكاء الاصطناعي"
      showBackButton={true}
    >
      <div className="flex flex-col h-[calc(100vh-200px)]">
        {/* Quick Actions */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">استعلامات سريعة:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickQueries.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuery(item.query)}
                  className="justify-start h-auto py-2"
                >
                  <IconComponent className="w-4 h-4 ml-2" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'report' && message.reportData ? (
                <div className="w-full">
                  <IntelligentReportViewer report={message.reportData} />
                </div>
              ) : (
                <Card
                  className={`max-w-[85%] ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-[#7CB342] to-[#689F38] text-white'
                      : 'bg-white'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {message.type === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <div
                          className={`flex items-center gap-1 mt-2 text-xs ${
                            message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {message.timestamp.toLocaleTimeString('ar-PS', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب استعلامك هنا... مثال: أعطني معلومات عن المواطن رقم الهوية 123456789"
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendQuery}
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-br from-[#7CB342] to-[#689F38] hover:from-[#689F38] hover:to-[#558B2F] px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 نصيحة: اضغط Enter للإرسال، Shift+Enter لسطر جديد
          </p>
        </div>
      </div>
    </ProfessionalLayout>
  );
}
