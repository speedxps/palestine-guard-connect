import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, Search, UserCheck, UserX, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  role: string;
  badge_number: string;
  phone: string;
  is_active: boolean;
}

interface CybercrimeAccess {
  id: string;
  user_id: string;
  is_active: boolean;
  granted_by: string;
  created_at: string;
}

const CybercrimeAccessManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [cybercrimeAccess, setCybercrimeAccess] = useState<CybercrimeAccess[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Check if current user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="mobile-container">
        <div className="page-header">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/cybercrime')}
              className="text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold font-arabic">غير مصرح</h1>
              <p className="text-sm text-muted-foreground">Access Denied</p>
            </div>
          </div>
        </div>
        <div className="px-4 text-center py-8">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">هذه الصفحة مخصصة للمديرين فقط</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (profilesError) throw profilesError;

      // Fetch cybercrime access
      const { data: accessData, error: accessError } = await supabase
        .from('cybercrime_access')
        .select('*');

      if (accessError) throw accessError;

      setProfiles(profilesData || []);
      setCybercrimeAccess(accessData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCybercrimeAccess = async (userId: string, hasAccess: boolean) => {
    try {
      if (hasAccess) {
        // Remove access
        const { error } = await supabase
          .from('cybercrime_access')
          .update({ is_active: false })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Grant access - get current user's profile to get user_id
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('id', user?.id)
          .single();

        const { error } = await supabase
          .from('cybercrime_access')
          .upsert({
            user_id: userId,
            granted_by: currentProfile?.user_id,
            is_active: true
          });

        if (error) throw error;
      }

      toast({
        title: "تم التحديث",
        description: hasAccess ? "تم إلغاء الصلاحية" : "تم منح الصلاحية",
      });

      fetchData();
    } catch (error) {
      console.error('Error updating access:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الصلاحية",
        variant: "destructive",
      });
    }
  };

  const hasAccess = (userId: string) => {
    return cybercrimeAccess.some(access => 
      access.user_id === userId && access.is_active
    );
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.badge_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
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
            onClick={() => navigate('/cybercrime')}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-arabic">إدارة صلاحيات الجرائم الإلكترونية</h1>
            <p className="text-sm text-muted-foreground">Cybercrime Access Management</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث عن موظف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-foreground">{profiles.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">لديهم صلاحية</p>
                <p className="text-2xl font-bold text-green-400">
                  {cybercrimeAccess.filter(access => access.is_active).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-400" />
            </div>
          </Card>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredProfiles.map((profile) => {
            const userHasAccess = hasAccess(profile.user_id);
            
            return (
              <Card key={profile.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      userHasAccess ? 'bg-green-500/20' : 'bg-gray-500/20'
                    }`}>
                      {userHasAccess ? (
                        <UserCheck className="h-5 w-5 text-green-400" />
                      ) : (
                        <UserX className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{profile.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.username} • {profile.badge_number}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {profile.role}
                        </Badge>
                        {profile.phone && (
                          <span className="text-xs text-muted-foreground">{profile.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Switch
                    checked={userHasAccess}
                    onCheckedChange={() => toggleCybercrimeAccess(profile.user_id, userHasAccess)}
                  />
                </div>
              </Card>
            );
          })}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد نتائج للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CybercrimeAccessManagement;