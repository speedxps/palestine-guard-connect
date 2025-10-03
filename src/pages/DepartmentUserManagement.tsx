import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Users, Shield, Car, Eye } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
}

interface DepartmentUserManagementProps {
  department: 'traffic' | 'cid' | 'special' | 'cybercrime';
}

const DEPARTMENT_CONFIG = {
  traffic: {
    title: 'إدارة موظفي شرطة المرور',
    icon: Car,
    roles: ['traffic_police', 'traffic_manager'] as UserRole[],
    color: 'from-blue-500 to-blue-600'
  },
  cid: {
    title: 'إدارة موظفي المباحث الجنائية',
    icon: Shield,
    roles: ['cid', 'cid_manager'] as UserRole[],
    color: 'from-purple-500 to-purple-600'
  },
  special: {
    title: 'إدارة موظفي الشرطة الخاصة',
    icon: Users,
    roles: ['special_police', 'special_manager'] as UserRole[],
    color: 'from-green-500 to-green-600'
  },
  cybercrime: {
    title: 'إدارة موظفي الجرائم الإلكترونية',
    icon: Eye,
    roles: ['cybercrime', 'cybercrime_manager'] as UserRole[],
    color: 'from-red-500 to-red-600'
  }
};

export default function DepartmentUserManagement({ department }: DepartmentUserManagementProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  
  const config = DEPARTMENT_CONFIG[department];
  const Icon = config.icon;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
    phone: '',
    badge_number: '',
    role: config.roles[0] as UserRole
  });

  useEffect(() => {
    fetchProfiles();
    
    const channel = supabase
      .channel('profiles-dept-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchProfiles)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [department]);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles and filter by role in JavaScript
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by department roles and set profiles directly
      const filteredData = data?.filter(profile => 
        config.roles.includes(profile.role as UserRole)
      ) || [];

      setProfiles(filteredData as Profile[]);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "خطأ في تحميل المستخدمين",
        description: error.message || "فشل في تحميل قائمة المستخدمين",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.username || !formData.full_name) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
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
            role: formData.role
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
            email: formData.email,
            phone: formData.phone || null,
            badge_number: formData.badge_number || null,
            role: formData.role as any,
            is_active: true
          });

        if (profileError) {
          console.warn('Profile might already exist:', profileError);
        }
        
        // Log user creation activity
        await supabase.from('activity_logs').insert({
          user_id: null,
          activity_type: 'user_created',
          activity_description: `إنشاء مستخدم جديد: ${formData.full_name} (${formData.email})`,
          metadata: { 
            email: formData.email,
            role: formData.role,
            department 
          }
        });
      }

      toast({
        title: "تم إنشاء المستخدم بنجاح",
        description: `تم إنشاء حساب ${formData.full_name}`
      });

      setIsCreateModalOpen(false);
      setFormData({
        email: '',
        password: '',
        username: '',
        full_name: '',
        phone: '',
        badge_number: '',
        role: config.roles[0]
      });
      fetchProfiles();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "فشل في إنشاء المستخدم",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive"
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
          role: formData.role as any
        })
        .eq('id', editingProfile.id);

      if (error) throw error;

      toast({
        title: "تم تحديث المستخدم",
        description: "تم تحديث بيانات المستخدم بنجاح"
      });

      setEditingProfile(null);
      fetchProfiles();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطأ في التحديث",
        description: error.message || "فشل في تحديث المستخدم",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (profileId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "تم إلغاء تفعيل المستخدم",
        description: "تم إلغاء تفعيل المستخدم بنجاح"
      });

      fetchProfiles();
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في إلغاء تفعيل المستخدم",
        variant: "destructive"
      });
    }
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      traffic_police: 'شرطة المرور',
      traffic_manager: 'مدير شرطة المرور',
      cid: 'مباحث جنائية',
      cid_manager: 'مدير المباحث الجنائية',
      special_police: 'شرطة خاصة',
      special_manager: 'مدير الشرطة الخاصة',
      cybercrime: 'جرائم إلكترونية',
      cybercrime_manager: 'مدير الجرائم الإلكترونية',
      officer: 'ضابط',
      admin: 'مدير النظام',
      user: 'مستخدم'
    };
    return labels[role] || role;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6" dir="rtl">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className={`p-3 rounded-lg bg-gradient-to-r ${config.color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">{config.title}</h1>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">إدارة وإضافة وتعديل موظفي القسم</p>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة موظف جديد
          </Button>
        </div>

        <div className="grid gap-4">
          {isLoading && profiles.length === 0 ? (
            <Card><CardContent className="p-8 text-center">جاري التحميل...</CardContent></Card>
          ) : profiles.length === 0 ? (
            <Card><CardContent className="p-8 text-center">لا يوجد موظفين في هذا القسم</CardContent></Card>
          ) : (
            profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${config.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{profile.full_name}</h3>
                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={profile.is_active ? "default" : "destructive"}>
                            {profile.is_active ? 'نشط' : 'غير نشط'}
                          </Badge>
                          <Badge variant="outline">{getRoleLabel(profile.role)}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingProfile(profile);
                          setFormData({
                            email: '',
                            password: '',
                            username: profile.username,
                            full_name: profile.full_name,
                            phone: profile.phone || '',
                            badge_number: profile.badge_number || '',
                            role: profile.role
                          });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteUser(profile.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        <Dialog open={isCreateModalOpen || !!editingProfile} onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setEditingProfile(null);
          }
        }}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={editingProfile ? handleUpdateProfile : handleCreateUser} className="space-y-4">
              {!editingProfile && (
                <>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">كلمة المرور *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="username">اسم المستخدم *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="full_name">الاسم الكامل *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">الدور *</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleLabel(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="badge_number">رقم الشارة</Label>
                <Input
                  id="badge_number"
                  value={formData.badge_number}
                  onChange={(e) => setFormData({ ...formData, badge_number: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'جاري الحفظ...' : editingProfile ? 'تحديث' : 'إضافة'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingProfile(null);
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
