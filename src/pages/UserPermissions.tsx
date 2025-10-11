import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
import { Shield, Check, X, UserCog } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

interface UserWithRoles {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  badge_number: string;
  is_active: boolean;
  roles: string[];
}

const UserPermissions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useUserRoles();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);

  const roleLabels: Record<string, string> = {
    admin: 'مدير النظام',
    traffic_police: 'شرطة المرور',
    cid: 'المباحث الجنائية',
    special_police: 'الشرطة الخاصة',
    cybercrime: 'الجرائم الإلكترونية',
    judicial_police: 'الشرطة القضائية',
    officer: 'ضابط',
    user: 'مستخدم',
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/access-denied');
      return;
    }

    fetchUsersWithRoles();
  }, [isAdmin, navigate]);

  const fetchUsersWithRoles = async () => {
    try {
      setLoading(true);

      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, badge_number, is_active')
        .order('full_name');

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: userRoles
          ?.filter(r => r.user_id === profile.user_id)
          .map(r => r.role) || [],
      })) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: `تم ${!isActive ? 'تفعيل' : 'تعطيل'} المستخدم`,
      });

      fetchUsersWithRoles();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة المستخدم',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3 bg-card px-4 md:px-6 py-3 rounded-full shadow-lg border">
            <Shield className="h-6 md:h-8 w-6 md:w-8 text-primary" />
            <h1 className="text-xl md:text-3xl font-bold">صلاحيات المستخدمين</h1>
          </div>
          <div />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              المستخدمون والصلاحيات ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    user.is_active
                      ? 'bg-card border-border'
                      : 'bg-muted/50 border-muted opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{user.full_name}</h3>
                        {user.is_active ? (
                          <Badge className="bg-green-500">
                            <Check className="h-3 w-3 ml-1" />
                            نشط
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <X className="h-3 w-3 ml-1" />
                            معطل
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {user.email}
                      </p>
                      {user.badge_number && (
                        <Badge variant="outline" className="mb-2">
                          رقم الشارة: {user.badge_number}
                        </Badge>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className="bg-primary/10 text-primary"
                            >
                              {roleLabels[role] || role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">لا توجد صلاحيات</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={user.is_active ? 'destructive' : 'default'}
                        onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                      >
                        {user.is_active ? (
                          <>
                            <X className="h-4 w-4 ml-2" />
                            تعطيل
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 ml-2" />
                            تفعيل
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  لا يوجد مستخدمون
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserPermissions;
