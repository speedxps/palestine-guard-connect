import React, { useState, useEffect } from 'react';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Send, Check, CheckCheck } from 'lucide-react';

const JudicialCommunications = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      setProfile(data);
    };
    
    loadProfile();
  }, [user]);

  const loadCases = async () => {
    try {
      const { data, error } = await supabase
        .from('judicial_cases')
        .select('id, case_number, title')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error: any) {
      console.error('Error loading cases:', error);
      toast({
        title: 'خطأ في تحميل القضايا',
        description: error.message || 'حدث خطأ أثناء تحميل القضايا',
        variant: 'destructive'
      });
    }
  };

  const loadMessages = async (caseId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('judicial_messages')
        .select(`
          *,
          sender:profiles!judicial_messages_sender_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }
      
      setMessages(data || []);
    } catch (error: any) {
      console.error('Detailed error:', error);
      toast({
        title: 'خطأ في تحميل الرسائل',
        description: error.message || 'حدث خطأ أثناء تحميل الرسائل',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCase) {
      loadMessages(selectedCase);
      
      // Set up realtime subscription
      const channel = supabase
        .channel('judicial-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'judicial_messages',
            filter: `case_id=eq.${selectedCase}`
          },
          async (payload) => {
            // Reload messages to get the full data with sender info
            await loadMessages(selectedCase);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'judicial_messages',
            filter: `case_id=eq.${selectedCase}`
          },
          async () => {
            // Reload messages when a message is updated (e.g., marked as read)
            await loadMessages(selectedCase);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedCase]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedCase || !profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('judicial_messages')
        .insert({
          case_id: selectedCase,
          sender_id: profile.id,
          sender_department: 'judicial_police',
          message: newMessage
        });

      if (error) throw error;

      setNewMessage('');
      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال الرسالة بنجاح'
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'خطأ في إرسال الرسالة',
        description: error.message || 'حدث خطأ أثناء إرسال الرسالة',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('judicial_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;

      // Messages will be reloaded automatically via realtime subscription
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تحديث حالة الرسالة',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">التواصل الرسمي</h1>
          </div>
          <div />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>القضايا</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر قضية" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.case_number} - {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>الرسائل</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[600px]">
              <ScrollArea className="flex-1 mb-4">
                {!selectedCase ? (
                  <div className="text-center text-muted-foreground py-8">
                    اختر قضية لعرض الرسائل
                  </div>
                ) : loading && messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    جارٍ التحميل...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    لا توجد رسائل بعد
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isMyMessage = profile && msg.sender_id === profile.id;
                      const senderName = msg.sender?.full_name || msg.sender?.email || 'مستخدم';
                      
                      return (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-lg ${
                            isMyMessage
                              ? 'bg-primary/10 ml-auto'
                              : 'bg-secondary/50 mr-auto'
                          }`}
                          style={{ maxWidth: '80%' }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">
                              {senderName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.created_at).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              {msg.is_read ? (
                                <CheckCheck className="h-4 w-4 text-blue-500" />
                              ) : (
                                <Check className="h-4 w-4 text-gray-400" />
                              )}
                              {isMyMessage && (
                                <span className="text-xs text-muted-foreground">
                                  {msg.is_read ? 'مقروءة' : 'تم الإرسال'}
                                </span>
                              )}
                            </div>
                            {!msg.is_read && !isMyMessage && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(msg.id)}
                              >
                                وضع علامة مقروء
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {selectedCase && (
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    rows={3}
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={loading || !newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JudicialCommunications;