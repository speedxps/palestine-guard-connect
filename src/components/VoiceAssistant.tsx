import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, MessageSquare, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'transcript' | 'transcript_delta';
}

interface VoiceAssistantProps {
  className?: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ className }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const chatRef = useRef<RealtimeChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleMessage = (message: Message) => {
    if (message.type === 'transcript_delta') {
      setCurrentTranscript(prev => prev + message.content);
    } else if (message.type === 'transcript' || !message.type) {
      setMessages(prev => [...prev, message]);
      setCurrentTranscript('');
    }
  };

  const startConversation = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      chatRef.current = new RealtimeChat(handleMessage, setIsSpeaking);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "🎤 المساعد الصوتي متصل",
        description: "يمكنك الآن التحدث مع المساعد الذكي",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "خطأ في الاتصال",
        description: error instanceof Error ? error.message : 'فشل في بدء المحادثة',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    setCurrentTranscript('');
    
    toast({
      title: "انتهت المحادثة",
      description: "تم قطع الاتصال مع المساعد الذكي",
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript]);

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <Card className={cn("flex flex-col h-96", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-primary" />
          المساعد الذكي للشرطة
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-3 bg-muted/30 rounded-lg p-3 min-h-0">
          {messages.length === 0 && !currentTranscript ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>ابدأ المحادثة للحصول على المساعدة</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-2 max-w-[80%]",
                    message.role === 'user' ? "ml-auto" : "mr-auto"
                  )}
                >
                  <div
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              
              {/* Current transcript being built */}
              {currentTranscript && (
                <div className="flex gap-2 max-w-[80%] mr-auto">
                  <div className="bg-secondary/50 text-secondary-foreground px-3 py-2 rounded-lg text-sm animate-pulse">
                    {currentTranscript}...
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {!isConnected ? (
            <Button 
              onClick={startConversation}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              <Mic className="h-4 w-4 mr-2" />
              بدء المحادثة الصوتية
            </Button>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <Button 
                onClick={endConversation}
                variant="outline"
                size="sm"
              >
                <MicOff className="h-4 w-4 mr-2" />
                إنهاء
              </Button>
              
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg flex-1 transition-colors",
                isSpeaking 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isSpeaking ? "bg-green-500" : "bg-blue-500"
                )}>
                </div>
                <span className="text-sm font-medium">
                  {isSpeaking ? "المساعد يتحدث..." : "استمع..."}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAssistant;