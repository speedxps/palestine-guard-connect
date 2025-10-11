import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
import { Bell, Send, Users, AlertCircle } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';

const NotificationManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
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

  useEffect(() => {
    if (!isAdmin) {
      navigate('/access-denied');
    }
  }, [isAdmin, navigate]);

  const handleDepartmentToggle = (deptId: string) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId)
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
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
      // Get profile ID
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

      // Reset form
      setTitle('');
      setMessage('');
      setPriority('normal');
      setTargetType('all');
      setSelectedDepartments([]);
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
      </div>
    </div>
  );
};

export default NotificationManagement;
