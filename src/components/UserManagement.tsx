import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
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
}

export const UserManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المستخدمين",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create user in Supabase Auth
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
        // Create profile manually if needed - only include role if it's admin or officer
        const profileData: any = {
          user_id: authData.user.id,
          username: formData.username,
          full_name: formData.full_name,
          phone: formData.phone || null,
          badge_number: formData.badge_number || null,
        };

        // Only add role if it's valid for the database enum
        if (formData.role === 'admin' || formData.role === 'officer') {
          profileData.role = formData.role;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (profileError) {
          console.warn('Profile creation error (might already exist):', profileError);
        }
      }

      toast({
        title: "تم إنشاء المستخدم",
        description: "تم إنشاء المستخدم الجديد بنجاح",
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
        title: "خطأ",
        description: error.message || "فشل في إنشاء المستخدم",
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
      // Only include role if it's valid for the database enum
      const updateData: any = {
        username: formData.username,
        full_name: formData.full_name,
        phone: formData.phone || null,
        badge_number: formData.badge_number || null,
      };

      if (formData.role === 'admin' || formData.role === 'officer') {
        updateData.role = formData.role;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', editingProfile.id);

      if (error) throw error;

      toast({
        title: "تم تحديث المستخدم",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });

      setEditingProfile(null);
      fetchProfiles();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطأ",
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
        title: "تم إلغاء تفعيل المستخدم",
        description: "تم إلغاء تفعيل المستخدم بنجاح",
      });

      fetchProfiles();
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في إلغاء تفعيل المستخدم",
        variant: "destructive",
      });
    }
  };

  const getRoleText = (role: UserRole) => {
    const roleMap = {
      admin: 'مدير',
      officer: 'ضابط',
      user: 'مستخدم'
    };
    return roleMap[role] || role;
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold font-arabic">إدارة المستخدمين</h2>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button variant="police" size="sm">
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
              <Button type="submit" variant="police" className="w-full" disabled={isLoading}>
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">{profile.full_name}</h3>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>الدور: {getRoleText(profile.role)}</span>
                  {profile.badge_number && <span>الشارة: {profile.badge_number}</span>}
                  <span className={profile.is_active ? 'text-success' : 'text-destructive'}>
                    {profile.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
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
                      <Button type="submit" variant="police" className="w-full" disabled={isLoading}>
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
        
        {profiles.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد مستخدمين حتى الآن</p>
          </Card>
        )}
      </div>
    </div>
  );
};