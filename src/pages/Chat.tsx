import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Send, 
  Shield,
  Plus,
  Users,
  Edit,
  Trash2,
  UserPlus,
  X
} from 'lucide-react';

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  department: string;
  created_by: string;
  created_at: string;
  member_count?: number;
}

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface RoomMember {
  id: string;
  user_id: string;
  joined_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
    badge_number: string | null;
  };
}

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { roles } = useUserRoles();
  const { toast } = useToast();

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  
  // Form states
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(roles[0] || '');
  
  // Members states
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (roles.length > 0) {
      setSelectedDepartment(roles[0]);
      fetchChatRooms();
    }
  }, [roles]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages();
      const cleanup = subscribeToMessages();
      return cleanup;
    }
  }, [selectedRoom]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      
      // Filter rooms by user's departments
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_active', true)
        .in('department', roles)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChatRooms(data || []);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل غرف المحادثة',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedRoom) return;

    try {
      const { data, error } = await supabase
        .from('department_chat_messages')
        .select(`
          *,
          sender:profiles!department_chat_messages_sender_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .eq('room_id', selectedRoom.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedRoom) return () => {};

    const channel = supabase
      .channel(`room-${selectedRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'department_chat_messages',
          filter: `room_id=eq.${selectedRoom.id}`,
        },
        async (payload) => {
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...payload.new, sender: senderData } as Message,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedRoom || !user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profileData) return;

      const { error } = await supabase
        .from('department_chat_messages')
        .insert({
          room_id: selectedRoom.id,
          sender_id: profileData.id,
          message: message.trim(),
        });

      if (error) throw error;
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'خطأ',
        description: 'فشل إرسال الرسالة',
        variant: 'destructive',
      });
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profileData) return;

      const { data: newRoom, error } = await supabase
        .from('chat_rooms')
        .insert([{
          name: roomName.trim(),
          description: roomDescription.trim() || null,
          department: selectedDepartment as any,
          created_by: profileData.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // Add creator as member
      await supabase.from('chat_room_members').insert({
        room_id: newRoom.id,
        user_id: profileData.id,
      });

      toast({
        title: 'نجح',
        description: 'تم إنشاء غرفة المحادثة',
      });

      setCreateDialogOpen(false);
      setRoomName('');
      setRoomDescription('');
      fetchChatRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'خطأ',
        description: 'فشل إنشاء غرفة المحادثة',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRoom = async () => {
    if (!selectedRoom || !roomName.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_rooms')
        .update({
          name: roomName.trim(),
          description: roomDescription.trim() || null,
        })
        .eq('id', selectedRoom.id);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم تحديث غرفة المحادثة',
      });

      setEditDialogOpen(false);
      fetchChatRooms();
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحديث غرفة المحادثة',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الغرفة؟')) return;

    try {
      const { error } = await supabase
        .from('chat_rooms')
        .update({ is_active: false })
        .eq('id', roomId);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم حذف غرفة المحادثة',
      });

      if (selectedRoom?.id === roomId) {
        setSelectedRoom(null);
      }
      fetchChatRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حذف غرفة المحادثة',
        variant: 'destructive',
      });
    }
  };

  const fetchRoomMembers = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_room_members')
        .select(`
          *,
          profile:profiles!chat_room_members_user_id_fkey(
            full_name,
            avatar_url,
            badge_number
          )
        `)
        .eq('room_id', roomId);

      if (error) throw error;
      setRoomMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchAvailableUsers = async (department: string) => {
    try {
      // Get all user IDs with the specified role
      const { data: userRoleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', department as any);

      if (roleError) throw roleError;
      
      const userIds = userRoleData?.map(ur => ur.user_id) || [];
      
      if (userIds.length === 0) {
        setAvailableUsers([]);
        return;
      }

      // Get profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, badge_number, avatar_url, user_id')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;
      
      // Filter out users who are already members
      if (selectedRoom) {
        const { data: existingMembers } = await supabase
          .from('chat_room_members')
          .select('user_id')
          .eq('room_id', selectedRoom.id);
        
        const existingMemberIds = existingMembers?.map(m => m.user_id) || [];
        const filtered = profilesData?.filter(p => !existingMemberIds.includes(p.id)) || [];
        setAvailableUsers(filtered);
      } else {
        setAvailableUsers(profilesData || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل المستخدمين',
        variant: 'destructive',
      });
    }
  };

  const handleAddMember = async () => {
    if (!selectedRoom || !selectedUserId) return;

    try {
      const { error } = await supabase
        .from('chat_room_members')
        .insert({
          room_id: selectedRoom.id,
          user_id: selectedUserId,
        });

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم إضافة العضو',
      });

      setAddMemberDialogOpen(false);
      setSelectedUserId('');
      fetchRoomMembers(selectedRoom.id);
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: 'خطأ',
        description: 'فشل إضافة العضو',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذا العضو؟')) return;

    try {
      const { error } = await supabase
        .from('chat_room_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم إزالة العضو',
      });

      if (selectedRoom) {
        fetchRoomMembers(selectedRoom.id);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'خطأ',
        description: 'فشل إزالة العضو',
        variant: 'destructive',
      });
    }
  };

  if (selectedRoom) {
    return (
      <div className="mobile-container">
        {/* Chat Header */}
        <div className="bg-card/80 backdrop-blur-md border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRoom(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h3 className="font-semibold font-arabic">{selectedRoom.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedRoom.description || 'غرفة محادثة'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  fetchRoomMembers(selectedRoom.id);
                  setMembersDialogOpen(true);
                }}
              >
                <Users className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setRoomName(selectedRoom.name);
                  setRoomDescription(selectedRoom.description || '');
                  setEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwn = user?.id && msg.sender_id === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card/50 text-foreground rounded-bl-md'
                    }`}
                  >
                    {!isOwn && msg.sender && (
                      <p className="text-xs text-muted-foreground mb-1 font-arabic">
                        {msg.sender.full_name}
                      </p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {new Date(msg.created_at).toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-card/80 backdrop-blur-md border-t border-border/50 p-4">
          <div className="flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب رسالة..."
              className="flex-1"
            />
            <Button
              variant="default"
              size="icon"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Members Dialog */}
        <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-arabic">أعضاء الغرفة</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  if (selectedRoom) {
                    fetchAvailableUsers(selectedRoom.department);
                    setAddMemberDialogOpen(true);
                  }
                }}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 ml-2" />
                إضافة عضو
              </Button>
              <ScrollArea className="h-[300px]">
                {roomMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 border-b"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        {member.profile?.avatar_url ? (
                          <img
                            src={member.profile.avatar_url}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm">
                            {member.profile?.full_name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-arabic">
                          {member.profile?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.profile?.badge_number}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id, member.user_id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-arabic">إضافة عضو جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>اختر العضو</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر عضو" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name} {profile.badge_number ? `- ${profile.badge_number}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddMember} className="w-full">
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Room Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-arabic">تعديل الغرفة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>اسم الغرفة</Label>
                <Input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="اسم الغرفة"
                />
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  placeholder="وصف الغرفة"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateRoom} className="flex-1">
                  حفظ
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteRoom(selectedRoom.id)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
            onClick={() => navigate(-1)}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold font-arabic">المحادثات</h1>
            <p className="text-sm text-muted-foreground">
              {roles.length > 0 && (
                <>
                  {roles[0] === 'admin' && 'الإدارة العامة'}
                  {roles[0] === 'traffic_police' && 'شرطة المرور'}
                  {roles[0] === 'cid' && 'المباحث الجنائية'}
                  {roles[0] === 'special_police' && 'الشرطة الخاصة'}
                  {roles[0] === 'cybercrime' && 'الجرائم الإلكترونية'}
                  {roles[0] === 'judicial_police' && 'الشرطة القضائية'}
                </>
              )}
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 ml-2" />
                غرفة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-arabic">إنشاء غرفة محادثة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>اسم الغرفة</Label>
                  <Input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="اسم الغرفة"
                  />
                </div>
                <div>
                  <Label>الوصف</Label>
                  <Textarea
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    placeholder="وصف الغرفة"
                  />
                </div>
                <div>
                  <Label>القسم</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role === 'admin' && 'الإدارة العامة'}
                          {role === 'traffic_police' && 'شرطة المرور'}
                          {role === 'cid' && 'المباحث الجنائية'}
                          {role === 'special_police' && 'الشرطة الخاصة'}
                          {role === 'cybercrime' && 'الجرائم الإلكترونية'}
                          {role === 'judicial_police' && 'الشرطة القضائية'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateRoom} className="w-full">
                  إنشاء
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-4">
        {/* Security Notice */}
        <Card className="glass-card p-4 border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-400" />
            <div>
              <h4 className="font-semibold text-green-400">محادثات آمنة</h4>
              <p className="text-xs text-green-400/80">
                جميع الرسائل محمية بسياسات الأمان المتقدمة
              </p>
            </div>
          </div>
        </Card>

        {/* Chat Rooms */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : chatRooms.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground mb-4">لا توجد غرف محادثة</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إنشاء غرفة جديدة
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {chatRooms.map((room) => (
              <Card
                key={room.id}
                className="glass-card p-4 cursor-pointer hover:bg-card/90 transition-all duration-300"
                onClick={() => setSelectedRoom(room)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold font-arabic text-sm">
                        {room.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {room.description || 'غرفة محادثة'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {room.department === 'admin' && 'الإدارة'}
                    {room.department === 'traffic_police' && 'المرور'}
                    {room.department === 'cid' && 'المباحث'}
                    {room.department === 'special_police' && 'الخاصة'}
                    {room.department === 'cybercrime' && 'السيبرانية'}
                    {room.department === 'judicial_police' && 'القضائية'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
