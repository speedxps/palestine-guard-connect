import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Shield, 
  ShieldCheck, 
  Search,
  Crown,
  User,
  Eye,
  EyeOff,
  UserCheck,
  UserX
} from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  badge_number?: string;
  is_active: boolean;
  created_at: string;
  email?: string;
  cybercrime_access?: {
    id: string;
    user_id: string;
    granted_by: string;
    created_at: string;
    is_active: boolean;
  } | null;
}

export const UserManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
    phone: '',
    badge_number: '',
    role: 'officer' as UserRole,
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      // Fetch profiles with cybercrime access data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          cybercrime_access (
            id,
            user_id,
            granted_by,
            created_at,
            is_active
          )
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get auth users to retrieve email addresses
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.warn('Could not fetch auth users:', authError);
      }

      // Combine profile and auth data
      const enrichedProfiles = profilesData?.map((profile: any) => {
        const authUser = authUsers?.users?.find((u: any) => u.id === profile.user_id);
        return {
          ...profile,
          email: authUser?.email || 'غير متوفر',
          cybercrime_access: profile.cybercrime_access?.find((access: any) => access.is_active) || null
        };
      }) || [];
      
      setProfiles(enrichedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "❌ خطأ في تحميل المستخدمين",
        description: "فشل في تحميل قائمة المستخدمين",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.username || !formData.full_name) {
      toast({
        title: "❌ بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use regular signup instead of admin API for now
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: formData.username,
            full_name: formData.full_name,
            role: formData.role,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile manually
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            username: formData.username,
            full_name: formData.full_name,
            phone: formData.phone || null,
            badge_number: formData.badge_number || null,
            role: formData.role,
            is_active: true
          });

        if (profileError) {
          console.warn('Profile might already exist from trigger:', profileError);
        }
      }

      toast({
        title: "✅ تم إنشاء المستخدم بنجاح",
        description: `تم إنشاء حساب ${formData.full_name}`,
      });

      setIsCreateModalOpen(false);
      setFormData({
        email: '',
        password: '',
        username: '',
        full_name: '',
        phone: '',
        badge_number: '',
        role: 'officer',
      });
      fetchProfiles();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "❌ فشل في إنشاء المستخدم",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          phone: formData.phone || null,
          badge_number: formData.badge_number || null,
          role: formData.role,
        })
        .eq('id', editingProfile.id);

      if (error) throw error;

      toast({
        title: "✅ تم تحديث المستخدم",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });

      setEditingProfile(null);
      fetchProfiles();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "❌ خطأ في التحديث",
        description: error.message || "فشل في تحديث المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateUser = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "✅ تم إلغاء تفعيل المستخدم",
        description: "تم إلغاء تفعيل المستخدم بنجاح",
      });

      fetchProfiles();
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast({
        title: "❌ خطأ",
        description: error.message || "فشل في إلغاء تفعيل المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleGrantCybercrimeAccess = async (profile: Profile) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('غير مسموح');

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', currentUser.user.id)
        .single();

      if (!adminProfile) throw new Error('لم يتم العثور على ملف المدير');

      const { error } = await supabase
        .from('cybercrime_access')
        .insert({
          user_id: profile.user_id,
          granted_by: adminProfile.id,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "✅ تم منح صلاحية الجرائم الإلكترونية",
        description: `تم منح ${profile.full_name} الوصول إلى قسم الجرائم الإلكترونية`,
      });

      fetchProfiles();
    } catch (error: any) {
      console.error('Error granting cybercrime access:', error);
      toast({
        title: "❌ خطأ في منح الصلاحية",
        description: error.message || "فشل في منح الوصول للجرائم الإلكترونية",
        variant: "destructive",
      });
    }
  };

  const handleRevokeCybercrimeAccess = async (profile: Profile) => {
    try {
      const { error } = await supabase
        .from('cybercrime_access')
        .update({ is_active: false })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: "✅ تم إلغاء صلاحية الجرائم الإلكترونية",
        description: `تم إلغاء وصول ${profile.full_name} إلى قسم الجرائم الإلكترونية`,
      });

      fetchProfiles();
    } catch (error: any) {
      console.error('Error revoking cybercrime access:', error);
      toast({
        title: "❌ خطأ في إلغاء الصلاحية",
        description: error.message || "فشل في إلغاء الوصول للجرائم الإلكترونية",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'officer':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const badges = {
      admin: { label: 'مدير', variant: 'destructive' as const },
      officer: { label: 'ضابط', variant: 'default' as const },
      user: { label: 'مستخدم', variant: 'secondary' as const }
    };
    
    const badge = badges[role] || badges.user;
    
    return (
      <Badge variant={badge.variant} className="flex items-center gap-1">
        {getRoleIcon(role)}
        {badge.label}
      </Badge>
    );
  };

  const openEditModal = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      email: '',
      password: '',
      username: profile.username,
      full_name: profile.full_name,
      phone: profile.phone || '',
      badge_number: profile.badge_number || '',
      role: profile.role,
    });
  };

  // Filter users based on search term
  const filteredProfiles = profiles.filter(profile =>
    profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold font-arabic">إدارة المستخدمين</h2>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              إضافة مستخدم
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء مستخدم جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input
                placeholder="البريد الإلكتروني"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                required
              />
              <Input
                placeholder="كلمة المرور"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                required
              />
              <Input
                placeholder="اسم المستخدم"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                required
              />
              <Input
                placeholder="الاسم الكامل"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                required
              />
              <Input
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
              />
              <Input
                placeholder="رقم الشارة"
                value={formData.badge_number}
                onChange={(e) => setFormData(prev => ({...prev, badge_number: e.target.value}))}
              />
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({...prev, role: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="officer">ضابط</SelectItem>
                  <SelectItem value="user">مستخدم</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" variant="default" className="w-full" disabled={isLoading}>
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="البحث في المستخدمين..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Grid */}
      <div className="grid gap-4">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{profile.full_name}</h3>
                  {getRoleBadge(profile.role)}
                </div>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                <p className="text-xs text-muted-foreground">البريد: {profile.email}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {profile.badge_number && <span>الشارة: {profile.badge_number}</span>}
                  {profile.phone && <span>الهاتف: {profile.phone}</span>}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={profile.is_active ? "default" : "secondary"}>
                    {profile.is_active ? (
                      <>
                        <UserCheck className="w-3 h-3 mr-1" />
                        نشط
                      </>
                    ) : (
                      <>
                        <UserX className="w-3 h-3 mr-1" />
                        غير نشط
                      </>
                    )}
                  </Badge>
                  <Badge variant={profile.cybercrime_access ? "default" : "secondary"} className="text-xs">
                    {profile.cybercrime_access ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        له صلاحية الجرائم الإلكترونية
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        بدون صلاحية الجرائم الإلكترونية
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Cybercrime Access Button */}
                {profile.cybercrime_access ? (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleRevokeCybercrimeAccess(profile)}
                    className="flex items-center gap-1"
                  >
                    <EyeOff className="h-4 w-4" />
                    إلغاء صلاحية الجرائم الإلكترونية
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleGrantCybercrimeAccess(profile)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    منح صلاحية الجرائم الإلكترونية
                  </Button>
                )}

                <Dialog open={editingProfile?.id === profile.id} onOpenChange={(open) => !open && setEditingProfile(null)}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditModal(profile)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>تعديل المستخدم</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <Input
                        placeholder="اسم المستخدم"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                        required
                      />
                      <Input
                        placeholder="الاسم الكامل"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                        required
                      />
                      <Input
                        placeholder="رقم الهاتف"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                      />
                      <Input
                        placeholder="رقم الشارة"
                        value={formData.badge_number}
                        onChange={(e) => setFormData(prev => ({...prev, badge_number: e.target.value}))}
                      />
                      <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({...prev, role: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">مدير</SelectItem>
                          <SelectItem value="officer">ضابط</SelectItem>
                          <SelectItem value="user">مستخدم</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="submit" variant="default" className="w-full" disabled={isLoading}>
                        {isLoading ? 'جاري التحديث...' : 'تحديث المستخدم'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                
                {profile.is_active && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeactivateUser(profile.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {filteredProfiles.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'لا توجد نتائج بحث' : 'لا توجد مستخدمين حتى الآن'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};