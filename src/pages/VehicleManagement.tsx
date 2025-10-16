import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Car, Users, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { useTickets } from '@/hooks/useTickets';

interface VehicleData {
  id: string;
  plate_number: string;
  vehicle_type: string;
  color: string;
  model: string;
  year: number;
  engine_number: string;
  chassis_number: string;
  registration_date: string;
  status: string;
  owner_national_id?: string;
}

interface OwnerData {
  id: string;
  vehicle_id: string;
  owner_name: string;
  national_id: string;
  phone: string;
  address: string;
  ownership_start_date: string;
  ownership_end_date?: string;
  is_current_owner: boolean;
}

interface ViolationData {
  id: string;
  vehicle_id: string;
  violation_type: string;
  violation_date: string;
  location: string;
  fine_amount: number;
  status: string;
  notes?: string;
}

export default function VehicleManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logTicket } = useTickets();
  
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [owners, setOwners] = useState<OwnerData[]>([]);
  const [violations, setViolations] = useState<ViolationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showOwnerDialog, setShowOwnerDialog] = useState(false);
  const [showViolationDialog, setShowViolationDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [vehicleForm, setVehicleForm] = useState({
    plate_number: '',
    vehicle_type: 'سيارة',
    color: '',
    model: '',
    year: new Date().getFullYear(),
    engine_number: '',
    chassis_number: '',
    status: 'active',
    owner_national_id: ''
  });
  
  const [ownerForm, setOwnerForm] = useState({
    vehicle_id: '',
    owner_name: '',
    national_id: '',
    phone: '',
    address: '',
    ownership_start_date: new Date().toISOString().split('T')[0],
    is_current_owner: true
  });

  const [isLoadingCitizen, setIsLoadingCitizen] = useState(false);
  
  const [violationForm, setViolationForm] = useState({
    vehicle_id: '',
    violation_type: '',
    violation_date: new Date().toISOString().split('T')[0],
    location: '',
    fine_amount: 0,
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, ownersRes, violationsRes] = await Promise.all([
        supabase.from('vehicle_registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('vehicle_owners').select('*').order('created_at', { ascending: false }),
        supabase.from('vehicle_violations').select('*').order('created_at', { ascending: false })
      ]);

      if (vehiclesRes.error) throw vehiclesRes.error;
      if (ownersRes.error) throw ownersRes.error;
      if (violationsRes.error) throw violationsRes.error;

      setVehicles(vehiclesRes.data || []);
      setOwners(ownersRes.data || []);
      setViolations(violationsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCitizenData = async (nationalId: string) => {
    if (!nationalId || nationalId.length < 9) return;
    
    setIsLoadingCitizen(true);
    try {
      const { data, error } = await supabase
        .from('citizens')
        .select('full_name, phone, address, national_id')
        .eq('national_id', nationalId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setOwnerForm(prev => ({
          ...prev,
          national_id: data.national_id,
          owner_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || ''
        }));
        toast({
          title: "تم العثور على المواطن",
          description: `تم جلب بيانات ${data.full_name} من السجل المدني`,
        });
      } else {
        toast({
          title: "تنبيه",
          description: "رقم الهوية غير موجود في السجل المدني",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error fetching citizen:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات المواطن",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCitizen(false);
    }
  };

  const handleSaveVehicle = async () => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('vehicle_registrations')
          .update(vehicleForm)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: "تم التحديث", description: "تم تحديث بيانات المركبة بنجاح" });
      } else {
        const { error } = await supabase
          .from('vehicle_registrations')
          .insert([vehicleForm]);
        if (error) throw error;
        toast({ title: "تم الإنشاء", description: "تم إنشاء المركبة بنجاح" });
        
        // Log ticket
        await logTicket({
          section: 'traffic_police',
          action_type: 'create',
          description: `إنشاء مركبة جديدة: ${vehicleForm.plate_number}`,
          metadata: { plateNumber: vehicleForm.plate_number, vehicleType: vehicleForm.vehicle_type }
        });
      }
      
      setShowVehicleDialog(false);
      setEditingItem(null);
      resetVehicleForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "خطأ",
        description: error.message.includes('duplicate') ? "رقم المركبة موجود مسبقاً" : "فشل في حفظ بيانات المركبة",
        variant: "destructive",
      });
    }
  };

  const handleSaveOwner = async () => {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('vehicle_owners')
          .update(ownerForm)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: "تم التحديث", description: "تم تحديث بيانات المالك بنجاح" });
      } else {
        // If setting as current owner, update other owners for this vehicle
        if (ownerForm.is_current_owner) {
          await supabase
            .from('vehicle_owners')
            .update({ is_current_owner: false, ownership_end_date: new Date().toISOString().split('T')[0] })
            .eq('vehicle_id', ownerForm.vehicle_id)
            .eq('is_current_owner', true);
        }
        
        const { error } = await supabase
          .from('vehicle_owners')
          .insert([ownerForm]);
        if (error) throw error;
        toast({ title: "تم الإنشاء", description: "تم إنشاء المالك بنجاح" });
        
        // Log ticket
        await logTicket({
          section: 'traffic_police',
          action_type: 'create',
          description: `إضافة مالك جديد: ${ownerForm.owner_name}`,
          metadata: { ownerName: ownerForm.owner_name, nationalId: ownerForm.national_id }
        });
      }
      
      setShowOwnerDialog(false);
      setEditingItem(null);
      resetOwnerForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving owner:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ بيانات المالك",
        variant: "destructive",
      });
    }
  };

  const handleSaveViolation = async () => {
    try {
      // Get owner national_id from vehicle_owners table
      let ownerNationalId = '';
      if (violationForm.vehicle_id) {
        const { data: ownerData } = await supabase
          .from('vehicle_owners')
          .select('national_id')
          .eq('vehicle_id', violationForm.vehicle_id)
          .eq('is_current_owner', true)
          .maybeSingle();
        
        if (ownerData) {
          ownerNationalId = ownerData.national_id;
        }
      }

      if (editingItem) {
        const { error } = await supabase
          .from('vehicle_violations')
          .update(violationForm)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: "تم التحديث", description: "تم تحديث بيانات المخالفة بنجاح" });
      } else {
        const { error } = await supabase
          .from('vehicle_violations')
          .insert([violationForm]);
        if (error) throw error;

        // Create traffic_records entry for the violation
        if (ownerNationalId) {
          const owner = owners.find(o => o.national_id === ownerNationalId);
          await supabase.from('traffic_records').insert({
            national_id: ownerNationalId,
            citizen_name: owner?.owner_name || 'غير معروف',
            record_type: 'violation',
            record_date: violationForm.violation_date,
            details: `${violationForm.violation_type} - مبلغ الغرامة: ${violationForm.fine_amount}`
          });
        }
        
        toast({ title: "تم الإنشاء", description: "تم إنشاء المخالفة وربطها بسجل المالك بنجاح" });
        
        // Log ticket
        await logTicket({
          section: 'traffic_police',
          action_type: 'create',
          description: `تسجيل مخالفة جديدة: ${violationForm.violation_type}`,
          metadata: { violationType: violationForm.violation_type, fineAmount: violationForm.fine_amount, ownerNationalId }
        });
      }
      
      setShowViolationDialog(false);
      setEditingItem(null);
      resetViolationForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving violation:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ بيانات المخالفة",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    
    try {
      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({ title: "تم الحذف", description: "تم حذف العنصر بنجاح" });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف العنصر",
        variant: "destructive",
      });
    }
  };

  const resetVehicleForm = () => {
    setVehicleForm({
      plate_number: '',
      vehicle_type: 'سيارة',
      color: '',
      model: '',
      year: new Date().getFullYear(),
      engine_number: '',
      chassis_number: '',
      status: 'active',
      owner_national_id: ''
    });
  };

  const resetOwnerForm = () => {
    setOwnerForm({
      vehicle_id: '',
      owner_name: '',
      national_id: '',
      phone: '',
      address: '',
      ownership_start_date: new Date().toISOString().split('T')[0],
      is_current_owner: true
    });
  };

  const resetViolationForm = () => {
    setViolationForm({
      vehicle_id: '',
      violation_type: '',
      violation_date: new Date().toISOString().split('T')[0],
      location: '',
      fine_amount: 0,
      status: 'pending',
      notes: ''
    });
  };

  const getVehicleOptions = () => {
    return vehicles.map(v => ({ value: v.id, label: `${v.plate_number} - ${v.model}` }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-3xl font-bold text-foreground">إدارة المركبات</h1>
        </div>
      </div>

      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vehicles">المركبات</TabsTrigger>
          <TabsTrigger value="owners">الملاك</TabsTrigger>
          <TabsTrigger value="violations">المخالفات</TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  المركبات ({vehicles.length})
                </CardTitle>
                <Button onClick={() => setShowVehicleDialog(true)} className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="h-4 w-4 ml-2" />
                  إضافة مركبة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{vehicle.plate_number}</h4>
                          <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
                            {vehicle.status === 'active' ? 'نشط' : vehicle.status}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <Label className="text-muted-foreground">النوع</Label>
                            <p>{vehicle.vehicle_type}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">الطراز</Label>
                            <p>{vehicle.model}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">السنة</Label>
                            <p>{vehicle.year}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">اللون</Label>
                            <p>{vehicle.color}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                          setEditingItem(vehicle);
                          setVehicleForm({
                            ...vehicle,
                            owner_national_id: vehicle.owner_national_id || ''
                          });
                          setShowVehicleDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete('vehicle_registrations', vehicle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Owners Tab */}
        <TabsContent value="owners">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  ملاك المركبات ({owners.length})
                </CardTitle>
                <Button onClick={() => setShowOwnerDialog(true)} className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="h-4 w-4 ml-2" />
                  إضافة مالك
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {owners.map((owner) => {
                  const vehicle = vehicles.find(v => v.id === owner.vehicle_id);
                  return (
                    <div key={owner.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-lg">{owner.owner_name}</h4>
                            {owner.is_current_owner && <Badge>مالك حالي</Badge>}
                          </div>
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <Label className="text-muted-foreground">رقم الهوية</Label>
                              <p>{owner.national_id}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">المركبة</Label>
                              <p>{vehicle?.plate_number} - {vehicle?.model}</p>
                            </div>
                            {owner.phone && (
                              <div>
                                <Label className="text-muted-foreground">الهاتف</Label>
                                <p>{owner.phone}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-muted-foreground">تاريخ الملكية</Label>
                              <p>{new Date(owner.ownership_start_date).toLocaleDateString('ar-SA')}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(owner);
                              setOwnerForm(owner);
                              setShowOwnerDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete('vehicle_owners', owner.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  المخالفات ({violations.length})
                </CardTitle>
                <Button onClick={() => setShowViolationDialog(true)} className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="h-4 w-4 ml-2" />
                  إضافة مخالفة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {violations.map((violation) => {
                  const vehicle = vehicles.find(v => v.id === violation.vehicle_id);
                  return (
                    <div key={violation.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-lg">{violation.violation_type}</h4>
                            <Badge variant={violation.status === 'pending' ? 'destructive' : 'default'}>
                              {violation.status === 'pending' ? 'معلقة' : violation.status}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <Label className="text-muted-foreground">المركبة</Label>
                              <p>{vehicle?.plate_number} - {vehicle?.model}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">التاريخ</Label>
                              <p>{new Date(violation.violation_date).toLocaleDateString('ar-SA')}</p>
                            </div>
                            {violation.location && (
                              <div>
                                <Label className="text-muted-foreground">المكان</Label>
                                <p>{violation.location}</p>
                              </div>
                            )}
                            <div>
                              <Label className="text-muted-foreground">الغرامة</Label>
                              <p className="font-semibold">{violation.fine_amount} ش.ج</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                        onClick={() => {
                          setEditingItem(violation);
                          setViolationForm({
                            ...violation,
                            notes: violation.notes || ''
                          });
                          setShowViolationDialog(true);
                        }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete('vehicle_violations', violation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vehicle Dialog */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'تعديل المركبة' : 'إضافة مركبة جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plate_number">رقم اللوحة *</Label>
                <Input
                  id="plate_number"
                  value={vehicleForm.plate_number}
                  onChange={(e) => setVehicleForm({...vehicleForm, plate_number: e.target.value})}
                />
              </div>
              <div>
                <Label>نوع المركبة</Label>
                <Select value={vehicleForm.vehicle_type} onValueChange={(value) => setVehicleForm({...vehicleForm, vehicle_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="سيارة">سيارة</SelectItem>
                    <SelectItem value="شاحنة">شاحنة</SelectItem>
                    <SelectItem value="دراجة نارية">دراجة نارية</SelectItem>
                    <SelectItem value="حافلة">حافلة</SelectItem>
                    <SelectItem value="أخرى">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">الطراز *</Label>
                <Input
                  id="model"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="color">اللون *</Label>
                <Input
                  id="color"
                  value={vehicleForm.color}
                  onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">السنة *</Label>
                <Input
                  id="year"
                  type="number"
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm({...vehicleForm, year: parseInt(e.target.value) || new Date().getFullYear()})}
                />
              </div>
              <div>
                <Label>الحالة</Label>
                <Select value={vehicleForm.status} onValueChange={(value) => setVehicleForm({...vehicleForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="stolen">مسروق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="engine_number">رقم المحرك</Label>
                <Input
                  id="engine_number"
                  value={vehicleForm.engine_number}
                  onChange={(e) => setVehicleForm({...vehicleForm, engine_number: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="chassis_number">رقم الشاصي</Label>
                <Input
                  id="chassis_number"
                  value={vehicleForm.chassis_number}
                  onChange={(e) => setVehicleForm({...vehicleForm, chassis_number: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveVehicle} className="bg-primary hover:bg-primary/90">
              {editingItem ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Owner Dialog */}
      <Dialog open={showOwnerDialog} onOpenChange={setShowOwnerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'تعديل المالك' : 'إضافة مالك جديد'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>المركبة *</Label>
              <Select value={ownerForm.vehicle_id} onValueChange={(value) => setOwnerForm({...ownerForm, vehicle_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المركبة" />
                </SelectTrigger>
                <SelectContent>
                  {getVehicleOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex-1">
                <Label htmlFor="national_id">رقم الهوية *</Label>
                <div className="flex gap-2">
                  <Input
                    id="national_id"
                    value={ownerForm.national_id}
                    onChange={(e) => setOwnerForm({...ownerForm, national_id: e.target.value})}
                    placeholder="أدخل رقم الهوية"
                  />
                  <Button
                    type="button"
                    onClick={() => fetchCitizenData(ownerForm.national_id)}
                    disabled={isLoadingCitizen || !ownerForm.national_id}
                    variant="outline"
                  >
                    {isLoadingCitizen ? 'جاري...' : 'جلب البيانات'}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="owner_name">اسم المالك *</Label>
                <Input
                  id="owner_name"
                  value={ownerForm.owner_name}
                  onChange={(e) => setOwnerForm({...ownerForm, owner_name: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">الهاتف</Label>
                <Input
                  id="phone"
                  value={ownerForm.phone}
                  onChange={(e) => setOwnerForm({...ownerForm, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="ownership_start_date">تاريخ بداية الملكية</Label>
                <Input
                  id="ownership_start_date"
                  type="date"
                  value={ownerForm.ownership_start_date}
                  onChange={(e) => setOwnerForm({...ownerForm, ownership_start_date: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">العنوان</Label>
              <Textarea
                id="address"
                value={ownerForm.address}
                onChange={(e) => setOwnerForm({...ownerForm, address: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveOwner} className="bg-primary hover:bg-primary/90">
              {editingItem ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Violation Dialog */}
      <Dialog open={showViolationDialog} onOpenChange={setShowViolationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'تعديل المخالفة' : 'إضافة مخالفة جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>المركبة *</Label>
              <Select value={violationForm.vehicle_id} onValueChange={(value) => setViolationForm({...violationForm, vehicle_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المركبة" />
                </SelectTrigger>
                <SelectContent>
                  {getVehicleOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="violation_type">نوع المخالفة *</Label>
                <Input
                  id="violation_type"
                  value={violationForm.violation_type}
                  onChange={(e) => setViolationForm({...violationForm, violation_type: e.target.value})}
                  placeholder="مثال: تجاوز السرعة المقررة"
                />
              </div>
              <div>
                <Label htmlFor="violation_date">تاريخ المخالفة</Label>
                <Input
                  id="violation_date"
                  type="date"
                  value={violationForm.violation_date}
                  onChange={(e) => setViolationForm({...violationForm, violation_date: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">المكان</Label>
                <Input
                  id="location"
                  value={violationForm.location}
                  onChange={(e) => setViolationForm({...violationForm, location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="fine_amount">مبلغ الغرامة (شيكل)</Label>
                <Input
                  id="fine_amount"
                  type="number"
                  min="0"
                  value={violationForm.fine_amount}
                  onChange={(e) => setViolationForm({...violationForm, fine_amount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div>
              <Label>حالة المخالفة</Label>
              <Select value={violationForm.status} onValueChange={(value) => setViolationForm({...violationForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">معلقة</SelectItem>
                  <SelectItem value="مدفوع">مدفوعة</SelectItem>
                  <SelectItem value="منتهي">منتهية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={violationForm.notes}
                onChange={(e) => setViolationForm({...violationForm, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveViolation} className="bg-primary hover:bg-primary/90">
              {editingItem ? 'تحديث' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}