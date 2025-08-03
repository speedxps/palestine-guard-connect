import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, UserPlus, UserMinus, Search, Mail, User, Edit, Trash2, Star, UserCheck } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/contexts/AuthContext';

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
  cybercrime_access?: CybercrimeAccess;
  has_verification_badge?: boolean;
}

interface CybercrimeAccess {
  id: string;
  user_id: string;
  granted_by: string;
  created_at: string;
  is_active: boolean;
}

interface EditUserData {
  username: string;
  full_name: string;
  role: UserRole;
  phone: string;
  badge_number: string;
}

export const CybercrimeAccessManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editUserData, setEditUserData] = useState<EditUserData>({
    username: '',
    full_name: '',
    role: 'user',
    phone: '',
    badge_number: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [profiles, searchQuery]);

  const fetchAllUsers = async () => {
    try {
      // Get all profiles with cybercrime access info
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
        `);

      if (profilesError) throw profilesError;

      const enrichedProfiles = profilesData?.map((profile: any) => ({
        ...profile,
        cybercrime_access: profile.cybercrime_access?.[0] || null,
        has_verification_badge: profile.role === 'cyber_officer' || profile.role === 'admin'
      })) || [];

      setProfiles(enrichedProfiles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل قائمة المستخدمين",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
      return;
    }

    const filtered = profiles.filter(profile => 
      profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.badge_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredProfiles(filtered);
  };

  const grantCybercrimeAccess = async (userId: string, username: string) => {
    setIsGranting(true);
    try {
      // Check if access already exists
      const { data: existingAccess, error: checkError } = await supabase
        .from('cybercrime_access')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingAccess) {
        if (existingAccess.is_active) {
          toast({
            title: "تحذير",
            description: "المستخدم يملك صلاحية وصول فعالة بالفعل",
            variant: "destructive",
          });
          return;
        } else {
          // Reactivate existing access
          const { error: updateError } = await supabase
            .from('cybercrime_access')
            .update({ is_active: true })
            .eq('user_id', userId);

          if (updateError) throw updateError;
        }
      } else {
        // Grant new access
        const { data: currentUser } = await supabase.auth.getUser();
        
        const { error: insertError } = await supabase
          .from('cybercrime_access')
          .insert({
            user_id: userId,
            granted_by: currentUser.user?.id || '',
            is_active: true
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "تم منح الصلاحية",
        description: `تم منح صلاحية الوصول لدائرة الجرائم الإلكترونية للمستخدم ${username}`,
      });

      fetchAllUsers();
    } catch (error: any) {
      console.error('Error granting access:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في منح صلاحية الوصول",
        variant: "destructive",
      });
    } finally {
      setIsGranting(false);
    }
  };

  const revokeCybercrimeAccess = async (userId: string, username: string) => {
    try {
      const { error } = await supabase
        .from('cybercrime_access')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم إلغاء الصلاحية",
        description: `تم إلغاء صلاحية الوصول للمستخدم ${username}`,
      });

      fetchAllUsers();
    } catch (error: any) {
      console.error('Error revoking access:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في إلغاء صلاحية الوصول",
        variant: "destructive",
      });
    }
  };

  const assignVerificationBadge = async (userId: string, username: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'cyber_officer' })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم منح الشارة",
        description: `تم منح شارة التحقق الزرقاء للمستخدم ${username}`,
      });

      fetchAllUsers();
    } catch (error: any) {
      console.error('Error assigning verification badge:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في منح شارة التحقق",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (user: Profile) => {
    setEditingUser(user);
    setEditUserData({
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone || '',
      badge_number: user.badge_number || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editUserData.username,
          full_name: editUserData.full_name,
          role: editUserData.role,
          phone: editUserData.phone || null,
          badge_number: editUserData.badge_number || null
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });

      setShowEditDialog(false);
      setEditingUser(null);
      fetchAllUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث بيانات المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateUser = async (userId: string, username: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم إلغاء التفعيل",
        description: `تم إلغاء تفعيل المستخدم ${username}`,
      });

      fetchAllUsers();
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في إلغاء تفعيل المستخدم",
        variant: "destructive",
      });
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'مدير النظام',
      'officer': 'ضابط',
      'cyber_officer': 'ضابط جرائم إلكترونية',
      'user': 'مستخدم'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'cyber_officer': return 'default';
      case 'officer': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-arabic">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-arabic text-foreground">إدارة صلاحيات الجرائم الإلكترونية</h1>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 shadow-card">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 font-arabic text-base"
              placeholder="البحث عن مستخدم (الاسم، اسم المستخدم، الرتبة...)"
            />
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary font-arabic">
              {profiles.length}
            </div>
            <div className="text-sm text-muted-foreground font-arabic">إجمالي المستخدمين</div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-success/10 to-success/5 border-success/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-success font-arabic">
              {profiles.filter(p => p.cybercrime_access?.is_active).length}
            </div>
            <div className="text-sm text-muted-foreground font-arabic">صلاحيات نشطة</div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-warning font-arabic">
              {profiles.filter(p => p.has_verification_badge).length}
            </div>
            <div className="text-sm text-muted-foreground font-arabic">شارات التحقق</div>
          </div>
        </Card>
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="p-6 shadow-card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="relative">
                  <User className="h-12 w-12 text-muted-foreground" />
                  {profile.has_verification_badge && (
                    <Star className="h-4 w-4 text-warning absolute -top-1 -right-1 fill-current" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <h3 className="text-lg font-semibold font-arabic text-card-foreground">{profile.full_name}</h3>
                    {profile.has_verification_badge && (
                      <Badge variant="default" className="bg-warning text-warning-foreground">
                        ⭐ موثق
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Badge variant={getRoleBadgeVariant(profile.role)} className="font-arabic">
                      {getRoleDisplayName(profile.role)}
                    </Badge>
                    {profile.cybercrime_access?.is_active && (
                      <Badge variant="default" className="bg-success text-success-foreground font-arabic">
                        صلاحية إلكترونية
                      </Badge>
                    )}
                    {!profile.is_active && (
                      <Badge variant="destructive" className="font-arabic">
                        معطل
                      </Badge>
                    )}
                  </div>
                  {profile.badge_number && (
                    <p className="text-xs text-muted-foreground font-arabic">رقم الشارة: {profile.badge_number}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Cybercrime Access Actions */}
                {profile.cybercrime_access?.is_active ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="font-arabic">
                        <UserMinus className="h-4 w-4 mr-1" />
                        إلغاء الصلاحية
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-arabic">تأكيد إلغاء الصلاحية</AlertDialogTitle>
                        <AlertDialogDescription className="font-arabic">
                          هل أنت متأكد من إلغاء صلاحية الجرائم الإلكترونية للمستخدم {profile.full_name}؟
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="font-arabic">إلغاء</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => revokeCybercrimeAccess(profile.user_id, profile.username)}
                          className="bg-destructive hover:bg-destructive/90 font-arabic"
                        >
                          تأكيد الإلغاء
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => grantCybercrimeAccess(profile.user_id, profile.username)}
                    disabled={isGranting}
                    className="bg-primary hover:bg-primary/90 font-arabic"
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    منح صلاحية
                  </Button>
                )}

                {/* Verification Badge */}
                {!profile.has_verification_badge && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => assignVerificationBadge(profile.user_id, profile.username)}
                    className="border-warning text-warning hover:bg-warning/10 font-arabic"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    شارة التحقق
                  </Button>
                )}

                {/* Edit User */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openEditModal(profile)}
                  className="font-arabic"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  تعديل
                </Button>

                {/* Deactivate User */}
                {profile.is_active && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10 font-arabic">
                        <Trash2 className="h-4 w-4 mr-1" />
                        إلغاء التفعيل
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-arabic">تأكيد إلغاء التفعيل</AlertDialogTitle>
                        <AlertDialogDescription className="font-arabic">
                          هل أنت متأكد من إلغاء تفعيل المستخدم {profile.full_name}؟ سيتم منع المستخدم من الوصول للنظام.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="font-arabic">إلغاء</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeactivateUser(profile.user_id, profile.username)}
                          className="bg-destructive hover:bg-destructive/90 font-arabic"
                        >
                          تأكيد الإلغاء
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {filteredProfiles.length === 0 && (
          <Card className="p-8 text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold font-arabic text-muted-foreground mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground font-arabic">
              {searchQuery ? 'لم يتم العثور على مستخدمين يطابقون البحث' : 'لا توجد مستخدمين في النظام'}
            </p>
          </Card>
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-arabic">تعديل بيانات المستخدم</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium font-arabic">اسم المستخدم</label>
              <Input
                value={editUserData.username}
                onChange={(e) => setEditUserData({...editUserData, username: e.target.value})}
                className="font-arabic"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium font-arabic">الاسم الكامل</label>
              <Input
                value={editUserData.full_name}
                onChange={(e) => setEditUserData({...editUserData, full_name: e.target.value})}
                className="font-arabic"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium font-arabic">الرتبة</label>
              <Select value={editUserData.role} onValueChange={(value: UserRole) => setEditUserData({...editUserData, role: value})}>
                <SelectTrigger className="font-arabic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user" className="font-arabic">مستخدم</SelectItem>
                  <SelectItem value="officer" className="font-arabic">ضابط</SelectItem>
                  <SelectItem value="cyber_officer" className="font-arabic">ضابط جرائم إلكترونية</SelectItem>
                  <SelectItem value="admin" className="font-arabic">مدير النظام</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium font-arabic">رقم الهاتف</label>
              <Input
                value={editUserData.phone}
                onChange={(e) => setEditUserData({...editUserData, phone: e.target.value})}
                className="font-arabic"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium font-arabic">رقم الشارة</label>
              <Input
                value={editUserData.badge_number}
                onChange={(e) => setEditUserData({...editUserData, badge_number: e.target.value})}
                className="font-arabic"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="font-arabic">
              إلغاء
            </Button>
            <Button onClick={handleUpdateUser} className="font-arabic">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};