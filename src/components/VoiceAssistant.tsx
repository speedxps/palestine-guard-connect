import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Send, Bot, MessageSquare, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SimpleAudioRecorder, blobToBase64 } from '@/utils/SimpleAudioRecorder';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import PoliceReportGenerator from '@/components/PoliceReportGenerator';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'transcript' | 'error';
}

interface VoiceAssistantProps {
  className?: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ className }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  
  const audioRecorderRef = useRef<SimpleAudioRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playAudio = async (base64Audio: string) => {
    try {
      setIsSpeaking(true);
      
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.remove();
      }

      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      currentAudioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;
        console.error('Error playing audio');
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // تحقق من طلب إنشاء تقرير
    if (text.includes('تقرير') || text.includes('إنشاء تقرير') || text.includes('كتابة تقرير')) {
      setShowReportGenerator(true);
      const reportMessage: Message = { 
        role: 'assistant', 
        content: 'سأساعدك في إنشاء تقرير شرطة. يرجى ملء النموذج أدناه بالبيانات المطلوبة.' 
      };
      setMessages(prev => [...prev, reportMessage]);
      setIsProcessing(false);
      return;
    }

    try {
      // Get AI response
      const chatResponse = await supabase.functions.invoke('ai-chat', {
        body: { message: text, history: messages.slice(-10) }
      });

      if (chatResponse.error) {
        throw new Error(chatResponse.error.message || 'Failed to get AI response');
      }

      const aiText = chatResponse.data?.response;
      if (!aiText) {
        throw new Error('No response from AI');
      }

      const assistantMessage: Message = { role: 'assistant', content: aiText };
      setMessages(prev => [...prev, assistantMessage]);

      // Convert AI response to speech
      const ttsResponse = await supabase.functions.invoke('text-to-voice', {
        body: { text: aiText, voice: 'alloy' }
      });

      if (ttsResponse.error) {
        console.error('TTS Error:', ttsResponse.error);
      } else if (ttsResponse.data?.audioContent) {
        await playAudio(ttsResponse.data.audioContent);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'عذراً، حدث خطأ في معالجة طلبك. الرجاء المحاولة مرة أخرى.',
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "خطأ",
        description: "حدث خطأ في معالجة الرسالة",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      audioRecorderRef.current = new SimpleAudioRecorder();
      await audioRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "🎤 بدء التسجيل",
        description: "تحدث الآن..."
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'لا يمكن الوصول إلى الميكروفون. تأكد من السماح للموقع باستخدام الميكروفون.',
        type: 'error'
      }]);
      
      toast({
        title: "خطأ في الميكروفون",
        description: "لا يمكن الوصول إلى الميكروفون",
        variant: "destructive"
      });
    }
  };

  const stopRecording = async () => {
    if (!audioRecorderRef.current) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);

      const audioBlob = await audioRecorderRef.current.stop();
      const base64Audio = await blobToBase64(audioBlob);

      // Convert speech to text
      const sttResponse = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (sttResponse.error) {
        throw new Error(sttResponse.error.message || 'Failed to convert speech to text');
      }

      const transcribedText = sttResponse.data?.text;
      if (transcribedText && transcribedText.trim()) {
        await sendMessage(transcribedText);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'لم أتمكن من فهم ما قلته. الرجاء المحاولة مرة أخرى.',
          type: 'error'
        }]);
        setIsProcessing(false);
      }

    } catch (error) {
      console.error('Error processing recording:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'حدث خطأ في معالجة التسجيل الصوتي. الرجاء المحاولة مرة أخرى.',
        type: 'error'
      }]);
      setIsProcessing(false);
      
      toast({
        title: "خطأ في التسجيل",
        description: "فشل في معالجة التسجيل الصوتي",
        variant: "destructive"
      });
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    const text = textInput.trim();
    setTextInput('');
    await sendMessage(text);
  };

  const stopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.remove();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  };

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
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>مرحباً! أنا المساعد الذكي للشرطة</p>
              <p className="text-sm mt-1">اسأل عن أي شيء أو استخدم الميكروفون للتحدث</p>
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
                       message.type === 'error'
                         ? "bg-destructive text-destructive-foreground"
                         : message.role === 'user'
                         ? "bg-primary text-primary-foreground"
                         : "bg-secondary text-secondary-foreground"
                     )}
                   >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Text Input */}
        <div className="flex gap-2">
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            onClick={handleTextSubmit}
            disabled={isProcessing || !textInput.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center gap-2">
          {/* Recording Button */}
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            variant={isRecording ? "destructive" : "default"}
            size="sm"
            className="flex-1"
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                إيقاف التسجيل
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                تسجيل صوتي
              </>
            )}
          </Button>

          {/* Speaking Status / Stop Button */}
          {isSpeaking && (
            <Button
              onClick={stopSpeaking}
              variant="outline"
              size="sm"
            >
              <VolumeX className="h-4 w-4 mr-2" />
              إيقاف الصوت
            </Button>
          )}

          {/* Status Indicator */}
          {(isProcessing || isSpeaking || isRecording) && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {isRecording ? "جارٍ التسجيل..." 
               : isProcessing ? "جارٍ المعالجة..." 
               : isSpeaking ? "المساعد يتحدث..." : ""}
            </div>
          )}
        </div>

        {/* Report Generator */}
        {showReportGenerator && (
          <div className="mt-4">
            <PoliceReportGenerator 
              onReportGenerated={(report) => {
                const reportMessage: Message = { 
                  role: 'assistant', 
                  content: 'تم إنشاء التقرير بنجاح! يمكنك طباعته أو نسخه.' 
                };
                setMessages(prev => [...prev, reportMessage]);
                setShowReportGenerator(false);
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceAssistant;