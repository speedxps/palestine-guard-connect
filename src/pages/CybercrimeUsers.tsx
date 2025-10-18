import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Eye, Trash2, Search } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

interface CybercrimeUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    badge_number: string;
  };
}

const CybercrimeUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, hasRole, loading: rolesLoading } = useUserRoles();
  const [users, setUsers] = useState<CybercrimeUser[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rolesLoading) {
      return;
    }

    const hasCybercrimeRole = hasRole('cybercrime');
    
    if (!isAdmin && !hasCybercrimeRole) {
      navigate('/access-denied');
      return;
    }

    fetchCybercrimeUsers();
    fetchAllProfiles();
  }, [isAdmin, rolesLoading, navigate]);

  const fetchCybercrimeUsers = async () => {
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, role, created_at')
        .eq('role', 'cybercrime')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      if (!rolesData || rolesData.length === 0) {
        setUsers([]);
        return;
      }

      const userIds = rolesData.map(r => r.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, badge_number')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const combined = rolesData.map(role => {
        const profile = profilesData?.find(p => p.user_id === role.user_id);
        return {
          ...role,
          profiles: profile || { full_name: '', email: '', badge_number: '' }
        };
      }).filter(u => u.profiles.full_name);

      setUsers(combined as any);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المستخدمين',
        variant: 'destructive',
      });
    }
  };

  const fetchAllProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, badge_number')
        .eq('is_active', true);

      if (error) throw error;
      setAllProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserId) {
      toast({
        title: 'تنبيه',
        description: 'الرجاء اختيار مستخدم',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUserId,
          role: 'cybercrime',
        });

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم إضافة المستخدم للجرائم الإلكترونية',
      });

      setSelectedUserId('');
      fetchCybercrimeUsers();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إضافة المستخدم',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (roleId: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذا المستخدم؟')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم إزالة المستخدم',
      });

      fetchCybercrimeUsers();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل في إزالة المستخدم',
        variant: 'destructive',
      });
    }
  };

  const availableProfiles = allProfiles.filter(
    profile => !users.some(u => u.user_id === profile.user_id)
  );

  const filteredUsers = users.filter(user =>
    user.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
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
            <Eye className="h-6 md:h-8 w-6 md:w-8 text-red-600" />
            <h1 className="text-xl md:text-3xl font-bold">مستخدمي الجرائم الإلكترونية</h1>
          </div>
          <div />
        </div>

        {isAdmin && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                إضافة مستخدم جديد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اختر المستخدم</Label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-background"
                >
                  <option value="">-- اختر مستخدم --</option>
                  {availableProfiles.map((profile) => (
                    <option key={profile.user_id} value={profile.user_id}>
                      {profile.full_name} ({profile.email})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleAddUser}
                disabled={loading || !selectedUserId}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <UserPlus className="h-4 w-4 ml-2" />
                إضافة للجرائم الإلكترونية
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>المستخدمون ({filteredUsers.length})</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{user.profiles.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.profiles.email}</p>
                    {user.profiles.badge_number && (
                      <Badge variant="outline" className="mt-1">
                        رقم الشارة: {user.profiles.badge_number}
                      </Badge>
                    )}
                  </div>
                  {isAdmin && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
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

export default CybercrimeUsers;
