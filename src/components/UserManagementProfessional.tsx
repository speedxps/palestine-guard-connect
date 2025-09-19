import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Users, 
  Eye, 
  Edit, 
  Trash2,
  Crown,
  Car,
  ShieldCheck,
  Shield,
  Computer,
  User
} from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  role: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

const UserManagementProfessional = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const departments = [
    { value: 'all', label: 'جميع الأقسام', icon: Users },
    { value: 'admin', label: 'الإدارة العامة', icon: Crown },
    { value: 'traffic_police', label: 'شرطة المرور', icon: Car },
    { value: 'cid', label: 'المباحث الجنائية', icon: ShieldCheck },
    { value: 'special_police', label: 'الشرطة الخاصة', icon: Shield },
    { value: 'cybercrime', label: 'الجرائم الإلكترونية', icon: Computer }
  ];

  const getDepartmentName = (role: string) => {
    const dept = departments.find(d => d.value === role);
    return dept?.label || 'غير محدد';
  };

  const getDepartmentIcon = (role: string) => {
    const dept = departments.find(d => d.value === role);
    return dept?.icon || User;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedDepartment]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          username,
          full_name,
          role,
          is_active,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('فشل في جلب بيانات المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // تصفية حسب القسم
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(user => user.role === selectedDepartment);
    }

    // تصفية حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success(isActive ? 'تم تفعيل المستخدم' : 'تم إلغاء تفعيل المستخدم');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('فشل في تحديث حالة المستخدم');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'traffic_police' | 'cid' | 'special_police' | 'cybercrime') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success('تم تحديث قسم المستخدم بنجاح');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('فشل في تحديث قسم المستخدم');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-12 bg-muted rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-arabic">
            إدارة المستخدمين
          </h1>
          <p className="text-muted-foreground font-arabic">
            إدارة وتنظيم مستخدمي النظام
          </p>
        </div>
        <Badge variant="secondary" className="font-arabic">
          {filteredUsers.length} مستخدم
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث بالاسم أو اسم المستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-arabic"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="font-arabic">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => {
                    const Icon = dept.icon;
                    return (
                      <SelectItem key={dept.value} value={dept.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{dept.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredUsers.map((user) => {
          const DepartmentIcon = getDepartmentIcon(user.role);
          return (
            <Card key={user.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <DepartmentIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-arabic">
                        {user.full_name || user.username}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-arabic">
                        {getDepartmentName(user.role)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={user.is_active ? "default" : "secondary"}>
                    {user.is_active ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-arabic">اسم المستخدم:</span>
                    <span className="font-medium">{user.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-arabic">تاريخ الإنشاء:</span>
                    <span className="font-medium">
                      {new Date(user.created_at).toLocaleDateString('ar-PS')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 font-arabic"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        عرض
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-arabic">تفاصيل المستخدم</DialogTitle>
                      </DialogHeader>
                      {selectedUser && (
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                              <DepartmentIcon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg font-arabic">
                              {selectedUser.full_name || selectedUser.username}
                            </h3>
                            <p className="text-muted-foreground font-arabic">
                              {getDepartmentName(selectedUser.role)}
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="font-medium font-arabic">الحالة:</span>
                              <Badge variant={selectedUser.is_active ? "default" : "secondary"}>
                                {selectedUser.is_active ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium font-arabic">تاريخ التسجيل:</span>
                              <span>{new Date(selectedUser.created_at).toLocaleDateString('ar-PS')}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Select
              value={selectedUser.role}
              onValueChange={(newRole: 'admin' | 'traffic_police' | 'cid' | 'special_police' | 'cybercrime') => updateUserRole(selectedUser.user_id, newRole)}
                            >
                              <SelectTrigger className="font-arabic">
                                <SelectValue placeholder="تغيير القسم" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.slice(1).map((dept) => {
                                  const Icon = dept.icon;
                                  return (
                                    <SelectItem key={dept.value} value={dept.value}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        <span>{dept.label}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant={selectedUser.is_active ? "destructive" : "default"}
                              className="w-full font-arabic"
                              onClick={() => updateUserStatus(selectedUser.user_id, !selectedUser.is_active)}
                            >
                              {selectedUser.is_active ? 'إلغاء التفعيل' : 'تفعيل المستخدم'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold font-arabic mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground font-arabic">
              {searchTerm || selectedDepartment !== 'all' 
                ? 'لم يتم العثور على مستخدمين مطابقين لمعايير البحث'
                : 'لا توجد مستخدمين في النظام'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagementProfessional;