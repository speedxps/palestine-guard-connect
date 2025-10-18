import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
import { Bell, Send, Users, AlertCircle, Edit2, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const NotificationManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [targetType, setTargetType] = useState<'all' | 'department'>('all');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const departments = [
    { id: 'admin', name: 'الإدارة العامة' },
    { id: 'traffic_police', name: 'شرطة المرور' },
    { id: 'cid', name: 'المباحث الجنائية' },
    { id: 'special_police', name: 'الشرطة الخاصة' },
    { id: 'cybercrime', name: 'الجرائم الإلكترونية' },
    { id: 'judicial_police', name: 'الشرطة القضائية' },
    { id: 'officer', name: 'الضباط' },
  ];


  const handleDepartmentToggle = (deptId: string) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId)
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  const [editingNotification, setEditingNotification] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [viewersDialogOpen, setViewersDialogOpen] = useState(false);
  const [selectedNotificationViewers, setSelectedNotificationViewers] = useState<any[]>([]);

  useEffect(() => {
    fetchSentNotifications();
  }, []);

  const fetchSentNotifications = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profileData) return;

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          notification_views (
            user_id,
            viewed_at
          )
        `)
        .eq('sender_id', profileData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSentNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching sent notifications:', error);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'تنبيه',
        description: 'الرجاء إدخال العنوان والرسالة',
        variant: 'destructive',
      });
      return;
    }

    if (targetType === 'department' && selectedDepartments.length === 0) {
      toast({
        title: 'تنبيه',
        description: 'الرجاء اختيار قسم واحد على الأقل',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const notificationData = {
        sender_id: profileData?.id,
        title,
        message,
        priority,
        is_system_wide: targetType === 'all',
        target_departments: targetType === 'department' ? selectedDepartments : null,
        recipient_id: null,
      };

      const { error } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم إرسال الإشعار بنجاح',
      });

      setTitle('');
      setMessage('');
      setPriority('normal');
      setTargetType('all');
      setSelectedDepartments([]);
      fetchSentNotifications();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إرسال الإشعار',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    console.log('Attempting to delete notification:', notificationId);
    
    try {
      // التحقق من البروفايل أولاً
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profileError || !profileData) {
        console.error('Profile error:', profileError);
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      console.log('Profile ID:', profileData.id);

      // حذف المشاهدات المرتبطة بالإشعار أولاً
      const { error: viewsError } = await supabase
        .from('notification_views')
        .delete()
        .eq('notification_id', notificationId);

      if (viewsError) {
        console.error('Error deleting notification views:', viewsError);
      }

      // حذف الإشعار
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      console.log('Notification deleted successfully');

      toast({
        title: 'نجح',
        description: 'تم حذف الإشعار بنجاح',
      });

      fetchSentNotifications();
    } catch (error: any) {
      console.error('Error in handleDeleteNotification:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف الإشعار',
        variant: 'destructive',
      });
    }
  };

  const handleEditNotification = async () => {
    if (!editingNotification || !editTitle.trim() || !editMessage.trim()) {
      toast({
        title: 'تنبيه',
        description: 'الرجاء إدخال العنوان والرسالة',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          title: editTitle,
          message: editMessage,
          priority: editPriority,
        })
        .eq('id', editingNotification.id);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم تحديث الإشعار بنجاح',
      });

      setEditingNotification(null);
      setEditTitle('');
      setEditMessage('');
      setEditPriority('normal');
      fetchSentNotifications();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث الإشعار',
        variant: 'destructive',
      });
    }
  };

  const fetchNotificationViewers = async (notificationId: string) => {
    try {
      const { data: viewsData, error: viewsError } = await supabase
        .from('notification_views')
        .select('user_id, viewed_at')
        .eq('notification_id', notificationId);

      if (viewsError) throw viewsError;

      if (!viewsData || viewsData.length === 0) {
        setSelectedNotificationViewers([]);
        setViewersDialogOpen(true);
        return;
      }

      // Fetch user profiles for each viewer
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, email')
        .in('user_id', viewsData.map(v => v.user_id));

      if (profilesError) throw profilesError;

      // Combine views with profile data
      const viewersWithProfiles = viewsData.map(view => {
        const profile = profilesData?.find(p => p.user_id === view.user_id);
        return {
          user_id: view.user_id,
          viewed_at: view.viewed_at,
          profiles: profile || null
        };
      });

      setSelectedNotificationViewers(viewersWithProfiles);
      setViewersDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching viewers:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في جلب قائمة المشاهدين',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3 bg-card px-4 md:px-6 py-3 rounded-full shadow-lg border">
            <Bell className="h-6 md:h-8 w-6 md:w-8 text-primary" />
            <h1 className="text-xl md:text-3xl font-bold">إدارة الإشعارات</h1>
          </div>
          <div />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              إرسال إشعار جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label>عنوان الإشعار</Label>
              <Input
                placeholder="أدخل العنوان"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label>نص الرسالة</Label>
              <Textarea
                placeholder="اكتب رسالتك هنا..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>الأولوية</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { value: 'low', label: 'منخفضة', color: 'bg-gray-500' },
                  { value: 'normal', label: 'عادية', color: 'bg-blue-500' },
                  { value: 'high', label: 'عالية', color: 'bg-orange-500' },
                  { value: 'urgent', label: 'عاجلة', color: 'bg-red-500' },
                ].map((p) => (
                  <Button
                    key={p.value}
                    type="button"
                    variant={priority === p.value ? 'default' : 'outline'}
                    onClick={() => setPriority(p.value as any)}
                    className={priority === p.value ? p.color : ''}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Target Type */}
            <div className="space-y-2">
              <Label>إرسال إلى</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={targetType === 'all' ? 'default' : 'outline'}
                  onClick={() => setTargetType('all')}
                  className="h-auto py-4"
                >
                  <Users className="h-5 w-5 ml-2" />
                  <div className="text-right">
                    <div className="font-bold">جميع المستخدمين</div>
                    <div className="text-xs opacity-80">إرسال لكافة الأقسام</div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={targetType === 'department' ? 'default' : 'outline'}
                  onClick={() => setTargetType('department')}
                  className="h-auto py-4"
                >
                  <AlertCircle className="h-5 w-5 ml-2" />
                  <div className="text-right">
                    <div className="font-bold">أقسام محددة</div>
                    <div className="text-xs opacity-80">اختر الأقسام المستهدفة</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Department Selection */}
            {targetType === 'department' && (
              <div className="space-y-3">
                <Label>اختر الأقسام المستهدفة</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {departments.map((dept) => (
                    <Button
                      key={dept.id}
                      type="button"
                      variant={selectedDepartments.includes(dept.id) ? 'default' : 'outline'}
                      onClick={() => handleDepartmentToggle(dept.id)}
                      className="justify-start"
                    >
                      {dept.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
            >
              <Send className="h-5 w-5 ml-2" />
              إرسال الإشعار
            </Button>
          </CardContent>
        </Card>

        {/* Sent Notifications */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              الإشعارات المرسلة ({sentNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sentNotifications.map((notification) => (
              <Card key={notification.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg">{notification.title}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingNotification(notification);
                          setEditTitle(notification.title);
                          setEditMessage(notification.message);
                          setEditPriority(notification.priority);
                        }}
                      >
                        <Edit2 className="h-4 w-4 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchNotificationViewers(notification.id)}
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        المشاهدات
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge className={
                      notification.priority === 'urgent' ? 'bg-red-500' :
                      notification.priority === 'high' ? 'bg-orange-500' :
                      notification.priority === 'normal' ? 'bg-blue-500' : 'bg-gray-500'
                    }>
                      {notification.priority === 'urgent' ? 'عاجل' :
                       notification.priority === 'high' ? 'مهم' :
                       notification.priority === 'normal' ? 'عادي' : 'منخفض'}
                    </Badge>
                    <span className="text-muted-foreground">
                      شاهده {notification.notification_views?.length || 0} مستخدم
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingNotification} onOpenChange={(open) => !open && setEditingNotification(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل الإشعار</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="أدخل العنوان"
                />
              </div>
              <div className="space-y-2">
                <Label>الرسالة</Label>
                <Textarea
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  placeholder="أدخل الرسالة"
                  rows={5}
                />
              </div>
              <div className="space-y-2">
                <Label>الأولوية</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'low', label: 'منخفضة', color: 'bg-gray-500' },
                    { value: 'normal', label: 'عادية', color: 'bg-blue-500' },
                    { value: 'high', label: 'عالية', color: 'bg-orange-500' },
                    { value: 'urgent', label: 'عاجلة', color: 'bg-red-500' },
                  ].map((p) => (
                    <Button
                      key={p.value}
                      type="button"
                      variant={editPriority === p.value ? 'default' : 'outline'}
                      onClick={() => setEditPriority(p.value as any)}
                      className={editPriority === p.value ? p.color : ''}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={handleEditNotification} className="w-full">
                حفظ التعديلات
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Viewers Dialog */}
        <Dialog open={viewersDialogOpen} onOpenChange={setViewersDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>المستخدمون الذين شاهدوا الإشعار</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedNotificationViewers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">لم يشاهد أحد هذا الإشعار بعد</p>
              ) : (
                selectedNotificationViewers.map((viewer: any) => (
                  <Card key={viewer.user_id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {viewer.profiles?.full_name || viewer.profiles?.username || viewer.profiles?.email || 'مستخدم'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(viewer.viewed_at).toLocaleString('ar-PS')}
                        </p>
                      </div>
                      <Badge variant="outline">شاهد</Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default NotificationManagement;
