import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
import { Shield, Check, X, UserCog, Trash2, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


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
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);

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

  const availableRoles = Object.keys(roleLabels);

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

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

  const openEditDialog = (user: UserWithRoles) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles);
    setEditDialogOpen(true);
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const updateUserRoles = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);

      // حذف جميع الأدوار الحالية
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id);

      if (deleteError) throw deleteError;

      // إضافة الأدوار الجديدة
      if (selectedRoles.length > 0) {
        const rolesToInsert = selectedRoles.map(role => ({
          user_id: selectedUser.user_id,
          role: role as any,
        }));

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(rolesToInsert);

        if (insertError) throw insertError;
      }

      toast({
        title: 'نجح',
        description: 'تم تحديث صلاحيات المستخدم بنجاح',
      });

      setEditDialogOpen(false);
      fetchUsersWithRoles();
    } catch (error: any) {
      console.error('Error updating roles:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الصلاحيات: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteDialog = (user: UserWithRoles) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const deleteUser = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);

      // استدعاء edge function لحذف المستخدم من auth
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: selectedUser.user_id },
      });

      if (error) throw error;

      toast({
        title: 'نجح',
        description: 'تم حذف المستخدم بنجاح',
      });

      setDeleteDialogOpen(false);
      fetchUsersWithRoles();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف المستخدم: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
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
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4 ml-2" />
                        تعديل الصلاحيات
                      </Button>
                      <Button
                        variant={user.is_active ? 'destructive' : 'default'}
                        size="sm"
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(user)}
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف
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

      {/* Dialog تعديل الصلاحيات */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل صلاحيات المستخدم</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name} - {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {availableRoles.map((role) => (
              <div key={role} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={role}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => handleRoleToggle(role)}
                />
                <Label
                  htmlFor={role}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {roleLabels[role]}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={updating}
            >
              إلغاء
            </Button>
            <Button onClick={updateUserRoles} disabled={updating}>
              {updating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog تأكيد الحذف */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المستخدم؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المستخدم <strong>{selectedUser?.full_name}</strong> ({selectedUser?.email}) 
              بشكل نهائي من قاعدة البيانات. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteUser}
              disabled={updating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updating ? 'جاري الحذف...' : 'حذف المستخدم'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserPermissions;
