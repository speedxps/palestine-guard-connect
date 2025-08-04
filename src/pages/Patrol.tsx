import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Users, MessageCircle, Send, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PatrolData {
  id: string;
  officer_id: string;
  location_lat: number;
  location_lng: number;
  is_active: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
    badge_number: string;
  };
}

interface ChatMessage {
  id: string;
  duty_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
  };
}

const Patrol = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [patrols, setPatrols] = useState<PatrolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuty, setSelectedDuty] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    fetchPatrols();
  }, []);

  useEffect(() => {
    if (selectedDuty) {
      fetchChatMessages(selectedDuty);
    }
  }, [selectedDuty]);

  const fetchPatrols = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patrol_tracking')
        .select(`
          *,
          profiles!patrol_tracking_officer_id_fkey (full_name, username, badge_number)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatrols(data || []);
    } catch (error) {
      console.error('Error fetching patrols:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الدوريات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (dutyId: string) => {
    try {
      setLoadingChat(true);
      const { data, error } = await supabase
        .from('duty_chat_messages')
        .select(`
          *,
          profiles!duty_chat_messages_user_id_fkey (full_name, username)
        `)
        .eq('duty_id', dutyId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatMessages(data || []);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل رسائل المحادثة",
        variant: "destructive",
      });
    } finally {
      setLoadingChat(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedDuty) return;

    try {
      const { error } = await supabase
        .from('duty_chat_messages')
        .insert({
          duty_id: selectedDuty,
          message: newMessage,
          user_id: user?.id
        });

      if (error) throw error;

      setNewMessage('');
      fetchChatMessages(selectedDuty);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-PS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ar-PS', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group patrols by area/duty
  const groupedPatrols = patrols.reduce((acc, patrol) => {
    const dutyId = `patrol_${Math.floor(patrol.location_lat * 100)}_${Math.floor(patrol.location_lng * 100)}`;
    if (!acc[dutyId]) {
      acc[dutyId] = [];
    }
    acc[dutyId].push(patrol);
    return acc;
  }, {} as { [key: string]: PatrolData[] });

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-arabic">الدوريات</h1>
            <p className="text-sm text-muted-foreground">Patrol Management</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-4">
        {/* Active Patrols Stats */}
        <Card className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">الدوريات النشطة</p>
              <p className="text-2xl font-bold text-foreground">{patrols.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>

        {/* Patrol Groups */}
        <div className="space-y-3">
          {Object.entries(groupedPatrols).map(([dutyId, dutyPatrols]) => (
            <Card key={dutyId} className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    دورية منطقة {dutyId.split('_')[1]}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {dutyPatrols.length} ضابط نشط
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDuty(dutyId)}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  محادثة
                </Button>
              </div>

              {/* Patrol Members */}
              <div className="space-y-2">
                {dutyPatrols.map((patrol) => (
                  <div key={patrol.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {patrol.profiles.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{patrol.profiles.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {patrol.profiles.badge_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        نشط
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(patrol.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {patrols.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد دوريات نشطة حالياً</p>
          </div>
        )}
      </div>

      {/* Chat Dialog */}
      <Dialog open={!!selectedDuty} onOpenChange={() => setSelectedDuty(null)}>
        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-arabic">
              محادثة دورية منطقة {selectedDuty?.split('_')[1]}
            </DialogTitle>
          </DialogHeader>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-96">
            {loadingChat ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div key={message.id} className={`flex gap-2 ${
                  message.user_id === user?.id ? 'justify-end' : 'justify-start'
                }`}>
                  {message.user_id !== user?.id && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {message.profiles.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className={`max-w-[70%] ${
                    message.user_id === user?.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  } rounded-lg p-2`}>
                    {message.user_id !== user?.id && (
                      <p className="text-xs font-semibold mb-1">
                        {message.profiles.full_name}
                      </p>
                    )}
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.user_id === user?.id 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                  {message.user_id === user?.id && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-semibold">
                        {message.profiles.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2 pt-3 border-t">
            <Input
              placeholder="اكتب رسالة..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
            <Button
              size="sm"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patrol;