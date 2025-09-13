import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mic, MicOff, Square, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const VoiceReportButton = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const { user } = useAuth();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('بدأ التسجيل...');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('فشل في بدء التسجيل');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('تم إيقاف التسجيل');
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) {
      toast.error('لا يوجد تسجيل صوتي');
      return;
    }

    setIsProcessing(true);
    try {
      // تحويل الصوت إلى base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // استدعاء edge function لتحويل الصوت إلى نص
        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { audio: base64Audio }
        });

        if (error) {
          throw error;
        }

        setTranscription(data.text);
        toast.success('تم تحويل الصوت إلى نص بنجاح');
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('فشل في تحويل الصوت إلى نص');
    } finally {
      setIsProcessing(false);
    }
  };

  const createReport = async () => {
    if (!transcription || !user) {
      toast.error('يرجى تحويل التسجيل إلى نص أولاً');
      return;
    }

    try {
      // إنشاء بلاغ جديد
      const { error } = await supabase.from('incidents').insert({
        title: 'بلاغ صوتي',
        description: transcription,
        incident_type: 'voice_report',
        reporter_id: user.id,
        status: 'new'
      });

      if (error) {
        throw error;
      }

      toast.success('تم إنشاء البلاغ بنجاح');
      setOpen(false);
      
      // إعادة تعيين الحالة
      setAudioBlob(null);
      setAudioUrl(null);
      setTranscription('');
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('فشل في إنشاء البلاغ');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Mic className="h-4 w-4" />
          بلاغ صوتي
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إنشاء بلاغ صوتي</DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">التسجيل الصوتي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              {!isRecording ? (
                <Button onClick={startRecording} size="lg" className="gap-2">
                  <Mic className="h-5 w-5" />
                  بدء التسجيل
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2">
                  <Square className="h-5 w-5" />
                  إيقاف التسجيل
                </Button>
              )}
            </div>

            {audioUrl && (
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {!isPlaying ? (
                    <Button onClick={playAudio} variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={pauseAudio} variant="outline" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button 
                    onClick={transcribeAudio} 
                    disabled={isProcessing}
                    size="sm"
                  >
                    {isProcessing ? 'جاري التحويل...' : 'تحويل إلى نص'}
                  </Button>
                </div>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}

            {transcription && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">النص المحول:</label>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    {transcription}
                  </div>
                </div>
                
                <Button onClick={createReport} className="w-full">
                  إنشاء البلاغ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceReportButton;