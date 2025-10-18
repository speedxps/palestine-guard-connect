import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Printer, Shield, Users } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { BackButton } from '@/components/BackButton';

type UserRole = Database['public']['Enums']['user_role'];

interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  role: string;
  email: string | null;
  phone: string | null;
  badge_number: string | null;
  is_active: boolean;
  created_at: string;
}

interface PagePermission {
  id: string;
  page_path: string;
  is_allowed: boolean;
}

interface DepartmentConfig {
  title: string;
  role: UserRole;
  color: string;
  pages: { path: string; title: string }[];
}

const DEPARTMENT_CONFIGS: Record<string, DepartmentConfig> = {
  traffic: {
    title: 'شرطة المرور',
    role: 'traffic_police',
    color: 'blue',
    pages: [
      { path: '/department/traffic', title: 'لوحة التحكم الرئيسية' },
      { path: '/violations', title: 'المخالفات المرورية' },
      { path: '/vehicle-management', title: 'إدارة المركبات' },
    ]
  },
  cid: {
    title: 'المباحث الجنائية',
    role: 'cid',
    color: 'red',
    pages: [
      { path: '/department/cid', title: 'لوحة التحكم الرئيسية' },
      { path: '/incidents', title: 'إدارة الحوادث' },
      { path: '/face-recognition', title: 'التعرف على الوجوه' },
    ]
  },
  special: {
    title: 'الشرطة الخاصة',
    role: 'special_police',
    color: 'green',
    pages: [
      { path: '/department/special', title: 'لوحة التحكم الرئيسية' },
      { path: '/patrol', title: 'الدوريات' },
      { path: '/tasks', title: 'المهام' },
    ]
  },
  cybercrime: {
    title: 'الجرائم الإلكترونية',
    role: 'cybercrime',
    color: 'purple',
    pages: [
      { path: '/department/cybercrime', title: 'لوحة التحكم الرئيسية' },
      { path: '/cybercrime', title: 'البلاغات الإلكترونية' },
      { path: '/cybercrime-advanced', title: 'إدارة القضايا المتقدمة' },
    ]
  }
};

interface DepartmentUsersManagementProps {
  department: keyof typeof DEPARTMENT_CONFIGS;
}

const DepartmentUsersManagement: React.FC<DepartmentUsersManagementProps> = ({ department }) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userPermissions, setUserPermissions] = useState<PagePermission[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    badge_number: '',
    password: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const config = DEPARTMENT_CONFIGS[department];

  useEffect(() => {
    fetchUsers();
  }, [department]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', config.role)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المستخدمين',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_page_permissions')
        .select('id, page_path, is_allowed')
        .eq('user_id', userId)
        .eq('department', department);

      if (error) throw error;
      
      // Create permissions map with all pages
      const permissionsMap = new Map(data?.map(p => [p.page_path, p]) || []);
      const permissions = config.pages.map(page => {
        const existing = permissionsMap.get(page.path);
        return {
          id: existing?.id || '',
          page_path: page.path,
          is_allowed: existing?.is_allowed ?? true
        };
      });
      
      setUserPermissions(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الصلاحيات',
        variant: 'destructive',
      });
    }
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.full_name,
            role: config.role
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Profile should be created by trigger, just wait and verify
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the profile with additional details
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: formData.phone,
            badge_number: formData.badge_number
          })
          .eq('user_id', authData.user.id);

        if (profileError) console.error('Profile update error:', profileError);

        toast({
          title: 'نجح',
          description: 'تم إضافة المستخدم بنجاح',
        });

        setIsDialogOpen(false);
        setFormData({ username: '', full_name: '', email: '', phone: '', badge_number: '', password: '' });
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إضافة المستخدم',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم حذف المستخدم بنجاح',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف المستخدم',
        variant: 'destructive',
      });
    }
  };

  const handleOpenPermissions = (userProfile: Profile) => {
    setSelectedUser(userProfile);
    fetchUserPermissions(userProfile.id);
    setIsPermissionsDialogOpen(true);
  };

  const handleTogglePermission = async (permission: PagePermission) => {
    if (!selectedUser) return;

    try {
      if (permission.id) {
        // Update existing permission
        const { error } = await supabase
          .from('user_page_permissions')
          .update({ is_allowed: !permission.is_allowed })
          .eq('id', permission.id);

        if (error) throw error;
      } else {
        // Create new permission
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user?.id)
          .single();

        const { error } = await supabase
          .from('user_page_permissions')
          .insert({
            user_id: selectedUser.id,
            page_path: permission.page_path,
            department: department,
            is_allowed: !permission.is_allowed,
            granted_by: profile?.id
          });

        if (error) throw error;
      }

      toast({
        title: 'نجح',
        description: 'تم تحديث الصلاحيات بنجاح',
      });

      fetchUserPermissions(selectedUser.id);
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الصلاحيات',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container p-6">
      <div className="mb-6">
        <BackButton className="mb-4" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold font-arabic">مستخدمي {config.title}</h1>
              <p className="text-sm text-muted-foreground">إدارة المستخدمين والصلاحيات</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة مستخدم
                </Button>
              </DialogTrigger>
              <DialogContent className="font-arabic">
                <DialogHeader>
                  <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">الاسم الكامل</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
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
                  <Button onClick={handleCreateUser} className="w-full">
                    إضافة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {users.map((userProfile) => (
          <Card key={userProfile.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{userProfile.full_name}</h3>
                  <Badge variant={userProfile.is_active ? 'default' : 'secondary'}>
                    {userProfile.is_active ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>اسم المستخدم: {userProfile.username}</p>
                  {userProfile.email && <p>البريد: {userProfile.email}</p>}
                  {userProfile.phone && <p>الهاتف: {userProfile.phone}</p>}
                  {userProfile.badge_number && <p>رقم الشارة: {userProfile.badge_number}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenPermissions(userProfile)}
                >
                  <Shield className="h-4 w-4 ml-2" />
                  الصلاحيات
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUser(userProfile.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="font-arabic max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              إدارة صلاحيات الوصول - {selectedUser?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {userPermissions.map((permission) => {
              const page = config.pages.find(p => p.path === permission.page_path);
              return (
                <div
                  key={permission.page_path}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={permission.is_allowed}
                      onCheckedChange={() => handleTogglePermission(permission)}
                    />
                    <div>
                      <p className="font-medium">{page?.title}</p>
                      <p className="text-sm text-muted-foreground">{permission.page_path}</p>
                    </div>
                  </div>
                  <Badge variant={permission.is_allowed ? 'default' : 'secondary'}>
                    {permission.is_allowed ? 'مسموح' : 'محظور'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentUsersManagement;