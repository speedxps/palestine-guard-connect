import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Shield, Monitor, AlertTriangle, RefreshCcw, Plus } from "lucide-react";
import { DeviceCard } from "@/components/DeviceCard";
import { DeviceDetailsModal } from "@/components/DeviceDetailsModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface UserWithDevices {
  id: string;
  email: string;
  raw_user_meta_data: any;
  devices: any[];
}

export default function DeviceManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserWithDevices[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithDevices | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [userToReset, setUserToReset] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalDevices: 0, blockedAttempts: 0 });

  // Load users and their devices
  const loadUsersAndDevices = async () => {
    try {
      setLoading(true);

      // Fetch all users
      const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      // Fetch all devices
      const { data: devices, error: devicesError } = await supabase
        .from('user_devices')
        .select('*')
        .order('last_seen_at', { ascending: false });

      if (devicesError) throw devicesError;

      // Fetch blocked attempts count (today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: blockedCount } = await supabase
        .from('device_access_log')
        .select('*', { count: 'exact', head: true })
        .eq('was_allowed', false)
        .gte('created_at', today.toISOString());

      // Combine users with their devices
      const usersWithDevices = authUsers.users.map(user => ({
        id: user.id,
        email: user.email || '',
        raw_user_meta_data: user.user_metadata,
        devices: devices?.filter(d => d.user_id === user.id) || [],
      }));

      setUsers(usersWithDevices);
      setStats({
        totalUsers: usersWithDevices.length,
        totalDevices: devices?.length || 0,
        blockedAttempts: blockedCount || 0,
      });
    } catch (error: any) {
      console.error('Error loading users and devices:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات المستخدمين والأجهزة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersAndDevices();
  }, []);

  // Handle device deletion
  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الجهاز بنجاح",
      });

      loadUsersAndDevices();
      if (selectedUser) {
        const updatedUser = users.find(u => u.id === selectedUser.id);
        if (updatedUser) {
          setSelectedUser({
            ...updatedUser,
            devices: updatedUser.devices.filter(d => d.id !== deviceId),
          });
        }
      }
    } catch (error: any) {
      console.error('Error deleting device:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الجهاز",
        variant: "destructive",
      });
    }
  };

  // Handle user reset (delete all devices)
  const handleResetUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم إعادة الضبط",
        description: "تم حذف جميع أجهزة المستخدم بنجاح",
      });

      loadUsersAndDevices();
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error resetting user devices:', error);
      toast({
        title: "خطأ",
        description: "فشل في إعادة ضبط أجهزة المستخدم",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.raw_user_meta_data?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">إدارة أمان الأجهزة</h1>
            <p className="text-muted-foreground">التحكم في الأجهزة المصرح بها للمستخدمين</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المستخدمون</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Monitor className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الأجهزة المسجلة</p>
                <p className="text-2xl font-bold">{stats.totalDevices}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">محاولات محظورة (اليوم)</p>
                <p className="text-2xl font-bold text-destructive">{stats.blockedAttempts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن مستخدم بالبريد الإلكتروني أو الاسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List or Selected User Devices */}
      {!selectedUser ? (
        <Card>
          <CardHeader>
            <CardTitle>قائمة المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد نتائج
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {user.raw_user_meta_data?.full_name || user.email}
                          </h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">
                              {user.devices.length} جهاز
                            </Badge>
                            {user.devices.length > 0 && (
                              <Badge
                                variant={user.devices.some(d => d.is_active) ? "default" : "secondary"}
                              >
                                {user.devices.some(d => d.is_active) ? "نشط" : "غير نشط"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const userWithDevices = users.find(u => u.id === user.id);
                              setSelectedUser(userWithDevices || null);
                            }}
                          >
                            عرض الأجهزة
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              setUserToReset(user.id);
                              setResetDialogOpen(true);
                            }}
                            disabled={user.devices.length === 0}
                          >
                            <RefreshCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  أجهزة المستخدم: {selectedUser.raw_user_meta_data?.full_name || selectedUser.email}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{selectedUser.email}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                >
                  رجوع
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setUserToReset(selectedUser.id);
                    setResetDialogOpen(true);
                  }}
                  disabled={selectedUser.devices.length === 0}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  إعادة ضبط الحساب
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedUser.devices.length === 0 ? (
              <div className="text-center py-12">
                <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">لا توجد أجهزة مسجلة لهذا المستخدم</p>
                <p className="text-sm text-muted-foreground">
                  سيتم تسجيل الجهاز تلقائياً عند أول محاولة دخول
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedUser.devices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onViewDetails={() => {
                      setSelectedDevice(device);
                      setShowDeviceDetails(true);
                    }}
                    onDelete={() => {
                      setDeviceToDelete(device.id);
                      setDeleteDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Device Details Modal */}
      <DeviceDetailsModal
        device={selectedDevice}
        open={showDeviceDetails}
        onOpenChange={setShowDeviceDetails}
      />

      {/* Delete Device Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الجهاز</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الجهاز؟ لن يتمكن المستخدم من تسجيل الدخول من هذا الجهاز بعد الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deviceToDelete) {
                  handleDeleteDevice(deviceToDelete);
                  setDeleteDialogOpen(false);
                  setDeviceToDelete(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset User Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إعادة ضبط الحساب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف جميع الأجهزة المسجلة لهذا المستخدم؟
              <br />
              <strong>سيتمكن المستخدم من تسجيل الدخول من أي جهاز جديد بعد إعادة الضبط.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToReset) {
                  handleResetUser(userToReset);
                  setResetDialogOpen(false);
                  setUserToReset(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              إعادة ضبط
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
