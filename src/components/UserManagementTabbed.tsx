import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  UserX,
  Trash,
  Car,
  Computer,
  FileUser
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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

export const UserManagementTabbed = () => {
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
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      let authUsers = null;
      try {
        const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();
        if (!authError) {
          authUsers = authUsersData;
        }
      } catch (error) {
        console.warn('Could not fetch auth users (non-critical):', error);
      }

      const { data: cybercrimeData } = await supabase
        .from('cybercrime_access')
        .select('user_id, is_active')
        .eq('is_active', true);

      const enrichedProfiles = profilesData?.map((profile: any) => {
        const authUser = authUsers?.users?.find((u: any) => u.id === profile.user_id);
        const cybercrimeAccess = cybercrimeData?.find(ca => ca.user_id === profile.user_id);
        
        return {
          ...profile,
          email: authUser?.email || 'غير متوفر',
          cybercrime_access: cybercrimeAccess ? {
            id: 'temp',
            user_id: profile.user_id,
            granted_by: 'admin',
            created_at: new Date().toISOString(),
            is_active: true
          } : null
        };
      }) || [];

      setProfiles(enrichedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "❌ خطأ في تحميل المستخدمين",
        description: `فشل في تحميل قائمة المستخدمين`,
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

      const { data: existingAccess } = await supabase
        .from('cybercrime_access')
        .select('*')
        .eq('user_id', profile.user_id)
        .maybeSingle();

      if (existingAccess) {
        if (existingAccess.is_active) {
          toast({
            title: "⚠️ تحذير",
            description: "المستخدم يملك صلاحية وصول فعالة بالفعل",
            variant: "destructive",
          });
          return;
        } else {
          const { error } = await supabase
            .from('cybercrime_access')
            .update({ is_active: true })
            .eq('user_id', profile.user_id);

          if (error) throw error;
        }
      } else {
        const { error } = await supabase
          .from('cybercrime_access')
          .insert({
            user_id: profile.user_id,
            granted_by: currentUser.user.id,
            is_active: true
          });

        if (error) throw error;
      }

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

  const handlePermanentDeleteUser = async (profile: Profile) => {
    try {
      const { error: deactivateError } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', profile.id);

      if (deactivateError) throw deactivateError;

      const { error: cybercrimeError } = await supabase
        .from('cybercrime_access')
        .delete()
        .eq('user_id', profile.user_id);

      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(profile.user_id);
        if (authError) {
          console.warn('Could not delete auth user:', authError);
        }
      } catch (authError) {
        console.warn('Could not delete auth user:', authError);
      }

      toast({
        title: "✅ تم حذف المستخدم نهائياً",
        description: `تم حذف ${profile.full_name} نهائياً من النظام`,
      });

      fetchProfiles();
    } catch (error: any) {
      console.error('Error permanently deleting user:', error);
      toast({
        title: "❌ خطأ في الحذف",
        description: error.message || "فشل في حذف المستخدم نهائياً",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'traffic_police':
        return <Car className="w-4 h-4" />;
      case 'cid':
        return <ShieldCheck className="w-4 h-4" />;
      case 'special_police':
        return <Users className="w-4 h-4" />;
      case 'cybercrime':
        return <Computer className="w-4 h-4" />;
      case 'officer':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const badges = {
      admin: { label: 'الإدارة العامة', variant: 'destructive' as const },
      traffic_police: { label: 'شرطة المرور', variant: 'default' as const },
      cid: { label: 'المباحث الجنائية', variant: 'secondary' as const },
      special_police: { label: 'الشرطة الخاصة', variant: 'outline' as const },
      cybercrime: { label: 'الجرائم الإلكترونية', variant: 'default' as const },
      officer: { label: 'ضابط عام', variant: 'default' as const },
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

  // Group users by department
  const groupedProfiles = {
    admin: profiles.filter(p => p.role === 'admin'),
    traffic_police: profiles.filter(p => p.role === 'traffic_police'),
    cid: profiles.filter(p => p.role === 'cid'),
    special_police: profiles.filter(p => p.role === 'special_police'),
    cybercrime: profiles.filter(p => p.role === 'cybercrime'),
    officer: profiles.filter(p => p.role === 'officer'),
    user: profiles.filter(p => p.role === 'user')
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

  const renderUsersList = (userList: Profile[], sectionTitle: string) => {
    const filteredUsers = userList.filter(profile =>
      profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-arabic">{sectionTitle} ({filteredUsers.length})</h3>
        
        {filteredUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-arabic">
              {searchTerm ? 'لا توجد نتائج بحث في هذا القسم' : 'لا توجد مستخدمين في هذا القسم'}
            </p>
          </Card>
        ) : (
          filteredUsers.map((profile) => (
            <Card key={profile.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold font-arabic">{profile.full_name}</h3>
                      {getRoleBadge(profile.role)}
                      {!profile.is_active && (
                        <Badge variant="outline" className="text-red-500 border-red-200">
                          غير مفعل
                        </Badge>
                      )}
                      {profile.cybercrime_access && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          وصول للجرائم الإلكترونية
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>@{profile.username}</span>
                      <span>{profile.email}</span>
                      {profile.phone && <span>{profile.phone}</span>}
                      {profile.badge_number && <span>شارة: {profile.badge_number}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Edit Button */}
                  <Dialog open={editingProfile?.id === profile.id} onOpenChange={(open) => {
                    if (!open) setEditingProfile(null);
                  }}>
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
                        <DialogTitle className="font-arabic">تعديل بيانات المستخدم</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium font-arabic">اسم المستخدم</label>
                          <Input
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            placeholder="username"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium font-arabic">الاسم الكامل</label>
                          <Input
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            placeholder="الاسم الكامل"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium font-arabic">القسم</label>
                          <Select 
                            value={formData.role} 
                            onValueChange={(value: UserRole) => setFormData({...formData, role: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">الإدارة العامة</SelectItem>
                              <SelectItem value="traffic_police">شرطة المرور</SelectItem>
                              <SelectItem value="cid">المباحث الجنائية</SelectItem>
                              <SelectItem value="special_police">الشرطة الخاصة</SelectItem>
                              <SelectItem value="cybercrime">الجرائم الإلكترونية</SelectItem>
                              <SelectItem value="officer">ضابط عام</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium font-arabic">رقم الهاتف</label>
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="رقم الهاتف"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium font-arabic">رقم الشارة</label>
                          <Input
                            value={formData.badge_number}
                            onChange={(e) => setFormData({...formData, badge_number: e.target.value})}
                            placeholder="رقم الشارة"
                          />
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button type="submit" disabled={isLoading} className="font-arabic">
                            حفظ التغييرات
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setEditingProfile(null)}
                            className="font-arabic"
                          >
                            إلغاء
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Cybercrime Access Button */}
                  {profile.role !== 'admin' && (
                    <>
                      {profile.cybercrime_access ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeCybercrimeAccess(profile)}
                          title="إلغاء وصول الجرائم الإلكترونية"
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGrantCybercrimeAccess(profile)}
                          title="منح وصول للجرائم الإلكترونية"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}

                  {/* Deactivate/Delete Button */}
                  {profile.is_active ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivateUser(profile.id)}
                      title="إلغاء تفعيل المستخدم"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-arabic">حذف نهائي للمستخدم</AlertDialogTitle>
                          <AlertDialogDescription className="font-arabic">
                            هل أنت متأكد من حذف {profile.full_name} نهائياً من النظام؟ هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="font-arabic">إلغاء</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handlePermanentDeleteUser(profile)}
                            className="bg-destructive hover:bg-destructive/90 font-arabic"
                          >
                            حذف نهائي
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    );
  };

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
              <div className="space-y-2">
                <label className="text-sm font-medium font-arabic">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="example@police.ps"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium font-arabic">كلمة المرور</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="كلمة المرور"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium font-arabic">اسم المستخدم</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="username"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium font-arabic">الاسم الكامل</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="الاسم الكامل"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium font-arabic">القسم</label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: UserRole) => setFormData({...formData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">الإدارة العامة</SelectItem>
                    <SelectItem value="traffic_police">شرطة المرور</SelectItem>
                    <SelectItem value="cid">المباحث الجنائية</SelectItem>
                    <SelectItem value="special_police">الشرطة الخاصة</SelectItem>
                    <SelectItem value="cybercrime">الجرائم الإلكترونية</SelectItem>
                    <SelectItem value="officer">ضابط عام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium font-arabic">رقم الهاتف</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="رقم الهاتف"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium font-arabic">رقم الشارة</label>
                <Input
                  value={formData.badge_number}
                  onChange={(e) => setFormData({...formData, badge_number: e.target.value})}
                  placeholder="رقم الشارة"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading} className="font-arabic">
                  إنشاء الحساب
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="font-arabic"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="البحث عن مستخدم..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 font-arabic"
        />
      </div>

      {/* Department Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 gap-2 h-auto p-1 bg-muted/50">
          <TabsTrigger value="all" className="flex items-center gap-2 p-2 font-arabic">
            <FileUser className="h-4 w-4" />
            الكل ({profiles.length})
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2 p-2 font-arabic">
            <Crown className="h-4 w-4" />
            الإدارة ({groupedProfiles.admin.length})
          </TabsTrigger>
          <TabsTrigger value="traffic_police" className="flex items-center gap-2 p-2 font-arabic">
            <Car className="h-4 w-4" />
            المرور ({groupedProfiles.traffic_police.length})
          </TabsTrigger>
          <TabsTrigger value="cid" className="flex items-center gap-2 p-2 font-arabic">
            <ShieldCheck className="h-4 w-4" />
            المباحث ({groupedProfiles.cid.length})
          </TabsTrigger>
          <TabsTrigger value="special_police" className="flex items-center gap-2 p-2 font-arabic">
            <Shield className="h-4 w-4" />
            الخاصة ({groupedProfiles.special_police.length})
          </TabsTrigger>
          <TabsTrigger value="cybercrime" className="flex items-center gap-2 p-2 font-arabic">
            <Computer className="h-4 w-4" />
            الإلكترونية ({groupedProfiles.cybercrime.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderUsersList(filteredProfiles, "جميع المستخدمين")}
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          {renderUsersList(groupedProfiles.admin, "الإدارة العامة")}
        </TabsContent>

        <TabsContent value="traffic_police" className="space-y-4">
          {renderUsersList(groupedProfiles.traffic_police, "شرطة المرور")}
        </TabsContent>

        <TabsContent value="cid" className="space-y-4">
          {renderUsersList(groupedProfiles.cid, "المباحث الجنائية")}
        </TabsContent>

        <TabsContent value="special_police" className="space-y-4">
          {renderUsersList(groupedProfiles.special_police, "الشرطة الخاصة")}
        </TabsContent>

        <TabsContent value="cybercrime" className="space-y-4">
          {renderUsersList(groupedProfiles.cybercrime, "الجرائم الإلكترونية")}
        </TabsContent>
      </Tabs>
    </div>
  );
};