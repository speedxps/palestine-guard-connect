import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
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
import { 
  Users, 
  Smartphone, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw,
  Loader2,
  Trash2,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { MaxDevicesSelector } from '@/components/MaxDevicesSelector';
import { DeviceCard } from '@/components/DeviceCard';
import { DeviceDetailsModal } from '@/components/DeviceDetailsModal';
import { BlockedAttemptCard } from '@/components/BlockedAttemptCard';
import { ApproveDeviceDialog } from '@/components/ApproveDeviceDialog';
import { BlacklistDeviceDialog } from '@/components/BlacklistDeviceDialog';

interface Device {
  id: string;
  device_fingerprint: string;
  device_info: any;
  device_name?: string;
  is_active: boolean;
  is_primary: boolean;
  first_seen_at: string;
  last_seen_at: string;
  login_count: number;
  notes?: string;
  user_id: string;
}

interface UserWithDevices {
  id: string;
  email: string;
  full_name: string;
  max_devices_allowed: number;
  devices: Device[];
}

interface BlockedAttempt {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  device_fingerprint: string;
  device_info: any;
  geolocation: {
    latitude: number;
    longitude: number;
  } | null;
  ip_address: string | null;
  user_agent: string | null;
  reason: string;
  created_at: string;
}

const DeviceManagement = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserWithDevices[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithDevices | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState<string | null>(null);
  const [resettingUser, setResettingUser] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDevices: 0,
    blockedAttempts: 0,
  });

  // Blocked attempts state
  const [blockedAttempts, setBlockedAttempts] = useState<BlockedAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<BlockedAttempt | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false);

  const loadUsersAndDevices = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('list-users-with-devices');

      if (error) {
        console.error('Error loading data:', error);
        throw error;
      }

      if (data?.success) {
        setUsers(data.users || []);
        setStats(data.stats || { totalUsers: 0, totalDevices: 0, blockedAttempts: 0 });
      } else {
        throw new Error(data?.error || 'فشل في تحميل البيانات');
      }
    } catch (error: any) {
      console.error('Error in loadUsersAndDevices:', error);
      toast.error(error.message || 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadBlockedAttempts = async () => {
    try {
      setLoadingAttempts(true);
      
      const { data, error } = await supabase.functions.invoke('get-blocked-attempts');

      if (error) {
        console.error('Error loading blocked attempts:', error);
        throw error;
      }

      if (data?.success) {
        setBlockedAttempts(data.attempts || []);
      } else {
        throw new Error(data?.error || 'فشل في تحميل محاولات الدخول المحظورة');
      }
    } catch (error: any) {
      console.error('Error in loadBlockedAttempts:', error);
      toast.error(error.message || 'فشل في تحميل محاولات الدخول المحظورة');
    } finally {
      setLoadingAttempts(false);
    }
  };

  useEffect(() => {
    loadUsersAndDevices();
    loadBlockedAttempts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsersAndDevices();
    loadBlockedAttempts();
  };

  const handleApproveAttempt = (attempt: BlockedAttempt) => {
    setSelectedAttempt(attempt);
    setShowApproveDialog(true);
  };

  const handleBlacklistAttempt = (attempt: BlockedAttempt) => {
    setSelectedAttempt(attempt);
    setShowBlacklistDialog(true);
  };

  const handleApproveSuccess = () => {
    // Remove the attempt from the list immediately
    setBlockedAttempts(prev => prev.filter(a => a.id !== selectedAttempt?.id));
    setShowApproveDialog(false);
    setSelectedAttempt(null);
    loadBlockedAttempts();
    loadUsersAndDevices();
  };

  const handleBlacklistSuccess = () => {
    // Remove the attempt from the list immediately
    setBlockedAttempts(prev => prev.filter(a => a.id !== selectedAttempt?.id));
    setShowBlacklistDialog(false);
    setSelectedAttempt(null);
    loadBlockedAttempts();
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!selectedUser) return;
    
    setDeletingDevice(deviceId);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-device', {
        body: {
          action: 'remove',
          userId: selectedUser.id,
          deviceId: deviceId,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('تم حذف الجهاز بنجاح');
        await loadUsersAndDevices();
        
        const updatedUser = users.find(u => u.id === selectedUser.id);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      } else {
        throw new Error(data?.error || 'فشل في حذف الجهاز');
      }
    } catch (error: any) {
      console.error('Error deleting device:', error);
      toast.error(error.message || 'فشل في حذف الجهاز');
    } finally {
      setDeletingDevice(null);
      setShowDeleteDialog(false);
    }
  };

  const handleResetUser = async (userId: string) => {
    setResettingUser(userId);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-device', {
        body: {
          action: 'reset',
          userId: userId,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('تم إعادة ضبط جميع الأجهزة بنجاح');
        await loadUsersAndDevices();
        setSelectedUser(null);
      } else {
        throw new Error(data?.error || 'فشل في إعادة ضبط الأجهزة');
      }
    } catch (error: any) {
      console.error('Error resetting user devices:', error);
      toast.error(error.message || 'فشل في إعادة ضبط الأجهزة');
    } finally {
      setResettingUser(null);
      setShowResetDialog(false);
    }
  };

  const handleMaxDevicesUpdate = (newMax: number) => {
    if (selectedUser) {
      // Update the local state immediately
      const updatedUser = { ...selectedUser, max_devices_allowed: newMax };
      setSelectedUser(updatedUser);
      
      // Update in the users array
      setUsers(users.map(u => 
        u.id === selectedUser.id ? updatedUser : u
      ));
      
      // Reload to ensure sync with server
      loadUsersAndDevices();
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold">إدارة الأجهزة</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              تحكم في أجهزة المستخدمين وعدد الأجهزة المسموح بها
            </p>
          </div>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          size="sm"
          variant="outline"
          className="w-full sm:w-auto"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <RefreshCw className="h-4 w-4 ml-2" />
          )}
          {refreshing ? 'جاري التحديث...' : 'تحديث'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {loading ? (
          <>
            <Skeleton className="h-24 sm:h-28" />
            <Skeleton className="h-24 sm:h-28" />
            <Skeleton className="h-24 sm:h-28" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الأجهزة</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDevices}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">محاولات محظورة (اليوم)</CardTitle>
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.blockedAttempts}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">البحث عن مستخدم</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="ابحث بالبريد الإلكتروني أو الاسم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Tabs for Registered Devices and Blocked Attempts */}
      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devices">
            <Smartphone className="h-4 w-4 ml-2" />
            الأجهزة المسجلة
          </TabsTrigger>
          <TabsTrigger value="blocked">
            <ShieldAlert className="h-4 w-4 ml-2" />
            محاولات الدخول المحظورة
            {blockedAttempts.length > 0 && (
              <Badge variant="destructive" className="mr-2">
                {blockedAttempts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Registered Devices */}
        <TabsContent value="devices" className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : selectedUser ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                    className="p-0 h-auto"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <CardTitle className="text-lg sm:text-xl">{selectedUser.full_name}</CardTitle>
                </div>
                <CardDescription className="text-sm">{selectedUser.email}</CardDescription>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    الأجهزة: {selectedUser.devices.length}/{selectedUser.max_devices_allowed}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">عدد الأجهزة المسموح بها:</p>
              <MaxDevicesSelector
                userId={selectedUser.id}
                currentMax={selectedUser.max_devices_allowed}
                onUpdate={handleMaxDevicesUpdate}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowResetDialog(true)}
                disabled={resettingUser === selectedUser.id || selectedUser.devices.length === 0}
                className="w-full sm:w-auto"
              >
                {resettingUser === selectedUser.id ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <RotateCcw className="h-4 w-4 ml-2" />
                )}
                إعادة ضبط جميع الأجهزة
              </Button>
            </div>

            <div className="space-y-3 mt-4">
              <h3 className="font-semibold text-base">الأجهزة المسجلة:</h3>
              {selectedUser.devices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  لا توجد أجهزة مسجلة لهذا المستخدم
                </p>
              ) : (
                <div className="grid gap-3">
                  {selectedUser.devices.map(device => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      userId={selectedUser.id}
                      onViewDetails={(device) => {
                        setSelectedDevice(device);
                        setShowDetailsModal(true);
                      }}
                      onDelete={(device) => {
                        setSelectedDevice(device);
                        setShowDeleteDialog(true);
                      }}
                      onToggle={loadUsersAndDevices}
                      isDeleting={deletingDevice === device.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">لا توجد نتائج</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map(user => (
              <Card 
                key={user.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedUser(user)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{user.full_name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <Badge variant={user.devices.length >= user.max_devices_allowed ? 'destructive' : 'outline'}>
                        الأجهزة: {user.devices.length}/{user.max_devices_allowed}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        عرض الأجهزة
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
        </TabsContent>

        {/* Tab 2: Blocked Login Attempts */}
        <TabsContent value="blocked" className="space-y-4">
          {loadingAttempts ? (
            <div className="space-y-3">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          ) : blockedAttempts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">لا توجد محاولات دخول محظورة</p>
                <p className="text-sm text-muted-foreground">
                  جميع محاولات تسجيل الدخول تمت بنجاح
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {blockedAttempts.map(attempt => (
                <BlockedAttemptCard
                  key={attempt.id}
                  attempt={attempt}
                  onApprove={handleApproveAttempt}
                  onBlacklist={handleBlacklistAttempt}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Device Details Modal */}
      {selectedDevice && (
        <DeviceDetailsModal
          device={selectedDevice}
          open={showDetailsModal}
          onOpenChange={(open) => {
            setShowDetailsModal(open);
            if (!open) setSelectedDevice(null);
          }}
        />
      )}

      {/* Delete Device Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الجهاز</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا الجهاز؟ لن يتمكن المستخدم من تسجيل الدخول من هذا الجهاز بعد الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedDevice && handleDeleteDevice(selectedDevice.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف الجهاز
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset User Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إعادة ضبط جميع الأجهزة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف جميع الأجهزة لهذا المستخدم؟ سيحتاج المستخدم إلى تسجيل الدخول من جديد لتسجيل جهاز جديد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleResetUser(selectedUser.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              <RotateCcw className="h-4 w-4 ml-2" />
              إعادة ضبط الكل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Device Dialog */}
      <ApproveDeviceDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        attempt={selectedAttempt}
        onSuccess={handleApproveSuccess}
      />

      {/* Blacklist Device Dialog */}
      <BlacklistDeviceDialog
        open={showBlacklistDialog}
        onOpenChange={setShowBlacklistDialog}
        attempt={selectedAttempt}
        onSuccess={handleBlacklistSuccess}
      />
    </div>
  );
};

export default DeviceManagement;
