import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Users,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Message {
  id: string;
  subject: string;
  message: string;
  sender_id: string;
  sender_department: string;
  target_department: string;
  priority: string;
  status: string;
  created_at: string;
  sender?: {
    full_name: string;
  };
  reply_to?: string;
}

const DEPARTMENTS = [
  { value: 'all', label: 'الجميع' },
  { value: 'admin', label: 'الإدارة العامة' },
  { value: 'operations', label: 'العمليات وإدارة الجهاز' },
  { value: 'traffic_police', label: 'شرطة المرور' },
  { value: 'cid', label: 'المباحث الجنائية' },
  { value: 'special_police', label: 'الشرطة الخاصة' },
  { value: 'cybercrime', label: 'الجرائم الإلكترونية' },
  { value: 'judicial_police', label: 'الشرطة القضائية' },
  { value: 'borders', label: 'المعابر والحدود' },
  { value: 'tourism_police', label: 'الشرطة السياحية' },
  { value: 'joint_operations', label: 'العمليات المشتركة' },
];

const InterDepartmentCommunication = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    targetDepartment: '',
    priority: 'normal',
  });
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('dept-communications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agency_communications',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('agency_communications')
        .select(`
          *,
          sender:sender_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.message || !formData.targetDepartment) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get sender profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user?.id)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      const messageData: any = {
        sender_id: profile.id,
        sender_department: profile.role,
        target_department: formData.targetDepartment,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
        status: 'sent',
      };

      if (replyToMessage) {
        messageData.reply_to = replyToMessage.id;
      }

      const { error } = await supabase.from('agency_communications').insert([messageData]);

      if (error) throw error;

      // إرسال إشعار للمستخدمين المستهدفين
      const targetDepartments = formData.targetDepartment === 'all' 
        ? ['admin', 'operations', 'traffic_police', 'cid', 'special_police', 'cybercrime', 'judicial_police', 'borders', 'tourism_police', 'joint_operations']
        : [formData.targetDepartment];

      // Get current user's profile for sender_id
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (currentProfile) {
        await supabase.from('notifications').insert([{
          title: replyToMessage ? `رد على: ${replyToMessage.subject}` : 'رسالة جديدة',
          message: `من ${profile.role}: ${formData.subject}`,
          priority: formData.priority,
          is_system_wide: formData.targetDepartment === 'all',
          target_departments: targetDepartments,
          action_url: '/inter-department-communication',
          sender_id: currentProfile.id,
        }]);
      }

      toast({
        title: 'نجاح',
        description: 'تم إرسال الرسالة بنجاح',
      });

      setFormData({
        subject: '',
        message: '',
        targetDepartment: '',
        priority: 'normal',
      });
      setReplyToMessage(null);
      setIsDialogOpen(false);
      fetchMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إرسال الرسالة',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      default:
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'عاجل';
      case 'high':
        return 'مهم';
      default:
        return 'عادي';
    }
  };

  const getTimeDiff = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return 'الآن';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/80 backdrop-blur-md border-b border-border/50 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold font-arabic text-primary-foreground">
                التواصل المشترك
              </h1>
              <p className="text-sm text-primary-foreground/80">Inter-Department Communication</p>
            </div>
            <MessageSquare className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{messages.length}</div>
              <div className="text-xs text-muted-foreground">إجمالي الرسائل</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{DEPARTMENTS.length}</div>
              <div className="text-xs text-muted-foreground">الأقسام</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {messages.filter((m) => m.priority === 'urgent').length}
              </div>
              <div className="text-xs text-muted-foreground">عاجل</div>
            </CardContent>
          </Card>
        </div>

        {/* New Message Button */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setReplyToMessage(null);
            setFormData({
              subject: '',
              message: '',
              targetDepartment: '',
              priority: 'normal',
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <Send className="h-4 w-4 ml-2" />
              رسالة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>{replyToMessage ? `رد على: ${replyToMessage.subject}` : 'إرسال رسالة جديدة'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">القسم المستهدف</label>
                <Select
                  value={formData.targetDepartment}
                  onValueChange={(value) =>
                    setFormData({ ...formData, targetDepartment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">الأولوية</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">عادي</SelectItem>
                    <SelectItem value="high">مهم</SelectItem>
                    <SelectItem value="urgent">عاجل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">الموضوع</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="أدخل موضوع الرسالة"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">الرسالة</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="اكتب رسالتك هنا..."
                  rows={5}
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 ml-2" />
                إرسال
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Messages List */}
        <div className="space-y-3">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </CardContent>
            </Card>
          ) : messages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">لا توجد رسائل حالياً</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {message.sender?.full_name?.charAt(0) || '؟'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {message.sender?.full_name || 'مرسل غير معروف'}
                        </h4>
                        <Badge className={`${getPriorityColor(message.priority)} text-xs`}>
                          {getPriorityLabel(message.priority)}
                        </Badge>
                      </div>
                      <h3 className="font-medium mb-1">{message.subject}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {message.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {getTimeDiff(message.created_at)}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReplyToMessage(message);
                            setFormData({
                              ...formData,
                              targetDepartment: message.sender_department || '',
                              subject: `رد: ${message.subject}`,
                            });
                            setIsDialogOpen(true);
                          }}
                        >
                          <Send className="h-3 w-3 ml-1" />
                          رد
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InterDepartmentCommunication;
