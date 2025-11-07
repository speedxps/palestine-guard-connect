import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, CheckCircle, XCircle, Users, Eye } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { BackButton } from '@/components/BackButton';

interface UserFaceRecord {
  id: string;
  user_id: string;
  face_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function UserFaceManagement() {
  const [faceRecords, setFaceRecords] = useState<UserFaceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  const loadFaceRecords = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_face_data')
        .select(`
          id,
          user_id,
          face_image_url,
          is_active,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // جلب بيانات المستخدمين
      const userIds = (data as any)?.map((record: any) => record.user_id) || [];
      const { data: usersData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      // جلب emails من auth.users (للأدمن فقط)
      const enrichedData: UserFaceRecord[] = ((data as any) || []).map((record: any) => {
        const profile = usersData?.find(u => u.user_id === record.user_id);

        
        return {
          ...record,
          email: record.user_id,
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null
        };
      });

      setFaceRecords(enrichedData);

      // حساب الإحصائيات
      setStats({
        total: enrichedData.length,
        active: enrichedData.filter(r => r.is_active).length,
        inactive: enrichedData.filter(r => !r.is_active).length
      });

    } catch (error: any) {
      console.error('Error loading face records:', error);
      toast.error('فشل تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaceRecords();
  }, []);

  const toggleActiveStatus = async (recordId: string, currentStatus: boolean) => {
    try {
      console.log('Toggling status for record:', recordId);
      const { error } = await supabase
        .from('user_face_data')
        .update({ is_active: !currentStatus })
        .eq('id', recordId);

      if (error) {
        console.error('Toggle error:', error);
        throw error;
      }

      toast.success(currentStatus ? 'تم تعطيل السجل' : 'تم تفعيل السجل');
      await loadFaceRecords();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast.error('فشل تحديث الحالة: ' + (error.message || 'خطأ غير معروف'));
    }
  };

  const deleteRecord = async (recordId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.')) return;

    try {
      console.log('Deleting record:', recordId);
      const { error } = await supabase
        .from('user_face_data')
        .delete()
        .eq('id', recordId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      toast.success('تم حذف السجل بنجاح');
      await loadFaceRecords();
    } catch (error: any) {
      console.error('Error deleting record:', error);
      toast.error('فشل حذف السجل: ' + (error.message || 'خطأ غير معروف'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="إدارة وجوه المستخدمين"
        description="إدارة بيانات التعرف على الوجوه للمستخدمين النظام"
      />

      <div className="container mx-auto p-6 space-y-6">
        <BackButton />

        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي السجلات</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">السجلات النشطة</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">السجلات المعطلة</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.inactive}</p>
                </div>
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة السجلات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              سجلات وجوه المستخدمين
            </CardTitle>
            <CardDescription>
              جميع المستخدمين المسجلين في نظام التعرف على الوجوه
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : faceRecords.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد سجلات بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {faceRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={record.face_image_url || record.avatar_url || undefined} 
                        alt={record.full_name || record.email}
                      />
                      <AvatarFallback>
                        {record.full_name?.charAt(0) || record.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">
                          {record.full_name || record.email}
                        </p>
                        <Badge variant={record.is_active ? 'default' : 'secondary'}>
                          {record.is_active ? 'نشط' : 'معطل'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {record.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        تم الإنشاء: {new Date(record.created_at).toLocaleDateString('ar')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={record.is_active ? 'outline' : 'default'}
                        onClick={() => toggleActiveStatus(record.id, record.is_active)}
                      >
                        {record.is_active ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            تعطيل
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            تفعيل
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteRecord(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
