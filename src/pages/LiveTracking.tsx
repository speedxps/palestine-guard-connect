import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Radio, Users, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MapboxComponent from '@/components/MapboxComponent';
import { BackButton } from '@/components/BackButton';

interface TrackedUser {
  id: string;
  user_id: string;
  profile_id: string | null;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string;
    badge_number: string | null;
    phone: string | null;
  };
}

const LiveTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trackedUsers, setTrackedUsers] = useState<TrackedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    fetchTrackedUsers();
    
    // الاشتراك في التحديثات المباشرة
    const channel = supabase
      .channel('gps-tracking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gps_tracking'
        },
        (payload) => {
          console.log('GPS tracking update:', payload);
          fetchTrackedUsers();
        }
      )
      .subscribe();

    // تحديث البيانات كل 10 ثواني
    const interval = setInterval(() => {
      fetchTrackedUsers();
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchTrackedUsers = async () => {
    try {
      setLoading(true);
      
      // جلب آخر موقع لكل مستخدم نشط
      const { data, error } = await supabase
        .from('gps_tracking')
        .select(`
          *,
          profile:profiles(full_name, badge_number, phone)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // تصفية للحصول على آخر موقع لكل مستخدم
      const uniqueUsers = new Map<string, TrackedUser>();
      data?.forEach((item: any) => {
        if (!uniqueUsers.has(item.user_id) || 
            new Date(item.created_at) > new Date(uniqueUsers.get(item.user_id)!.created_at)) {
          uniqueUsers.set(item.user_id, item);
        }
      });

      const users = Array.from(uniqueUsers.values());
      setTrackedUsers(users);
      setActiveCount(users.length);

    } catch (error) {
      console.error('Error fetching tracked users:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات التتبع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // تحويل البيانات لتنسيق MapboxComponent
  const mapPatrols = trackedUsers.map((user, index) => ({
    id: user.id,
    name: user.profile?.full_name || `مستخدم ${index + 1}`,
    area: user.profile?.badge_number || 'غير محدد',
    location_lat: Number(user.latitude),
    location_lng: Number(user.longitude),
    location_address: `${Number(user.latitude).toFixed(6)}, ${Number(user.longitude).toFixed(6)}`,
    status: 'active',
    patrol_members: [
      {
        officer_name: user.profile?.full_name || 'غير متوفر',
        officer_phone: user.profile?.phone || '',
        role: user.profile?.badge_number || 'ضابط',
        officer_id: user.user_id
      }
    ]
  }));

  const getTimeDifference = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    const hours = Math.floor(diffInMinutes / 60);
    return `منذ ${hours} ساعة`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Radio className="h-8 w-8 text-primary animate-pulse" />
              التتبع المباشر GPS
            </h1>
            <p className="text-muted-foreground mt-1">
              مراقبة المواقع الجغرافية المباشرة للمستخدمين النشطين
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">المستخدمون النشطون</p>
                <p className="text-3xl font-bold text-green-700">{activeCount}</p>
              </div>
              <Radio className="h-10 w-10 text-green-600 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">التحديث التلقائي</p>
                <p className="text-xl font-bold text-blue-700">كل 10 ثواني</p>
              </div>
              <Clock className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">المواقع المتتبعة</p>
                <p className="text-3xl font-bold text-purple-700">{trackedUsers.length}</p>
              </div>
              <MapPin className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            خريطة التتبع المباشر
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {mapPatrols.length > 0 ? (
            <div className="h-[600px]">
              <MapboxComponent
                patrols={mapPatrols}
                center={[
                  Number(trackedUsers[0]?.longitude) || 34.4668,
                  Number(trackedUsers[0]?.latitude) || 31.5017
                ]}
                zoom={12}
                height="600px"
              />
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center bg-muted">
              <div className="text-center">
                <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">
                  لا يوجد مستخدمون نشطون حالياً
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  سيظهر المستخدمون هنا عند تفعيل التتبع
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            المستخدمون النشطون ({activeCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trackedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا يوجد مستخدمون يتم تتبعهم حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trackedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
                      <Radio className="h-6 w-6 text-white animate-pulse" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {user.profile?.full_name || 'مستخدم'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {Number(user.latitude).toFixed(6)}, {Number(user.longitude).toFixed(6)}
                        </span>
                      </div>
                      {user.profile?.badge_number && (
                        <p className="text-xs text-muted-foreground mt-1">
                          الشارة: {user.profile.badge_number}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <Radio className="h-3 w-3 mr-1 animate-pulse" />
                      نشط
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {getTimeDifference(user.updated_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      دقة: {user.accuracy?.toFixed(0)}م
                    </p>
                    {user.speed && (
                      <p className="text-xs text-muted-foreground">
                        السرعة: {(Number(user.speed) * 3.6).toFixed(0)} كم/س
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveTracking;
