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
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Users, MapPin, Clock, Plus, Edit, Eye, Navigation, CheckCircle, AlertCircle, Pause } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface Patrol {
  id: string;
  name: string;
  area: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface PatrolMember {
  id: string;
  patrol_id: string;
  officer_id: string;
  officer_name: string;
  officer_phone?: string;
  role: string;
  created_at: string;
}

export default function PatrolsManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patrols, setPatrols] = useState<Patrol[]>([]);
  const [patrolMembers, setPatrolMembers] = useState<PatrolMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPatrol, setSelectedPatrol] = useState<Patrol | null>(null);
  
  const [patrolForm, setPatrolForm] = useState({
    name: '',
    area: '',
    department: '',
    location_address: '',
    location_lat: '',
    location_lng: ''
  });

  useEffect(() => {
    fetchPatrols();
    fetchPatrolMembers();
  }, []);

  const fetchPatrols = async () => {
    try {
      const { data, error } = await supabase
        .from('patrols')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatrols(data || []);
    } catch (error) {
      console.error('Error fetching patrols:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الدوريات",
        variant: "destructive",
      });
    }
  };

  const fetchPatrolMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('patrol_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatrolMembers(data || []);
    } catch (error) {
      console.error('Error fetching patrol members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPatrol = async () => {
    try {
      if (!user) return;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const patrolData: any = {
        name: patrolForm.name,
        area: patrolForm.area,
        department: patrolForm.department || null,
        location_address: patrolForm.location_address,
        created_by: profile.id,
        location_lat: patrolForm.location_lat ? parseFloat(patrolForm.location_lat) : null,
        location_lng: patrolForm.location_lng ? parseFloat(patrolForm.location_lng) : null,
      };

      const { error } = await supabase
        .from('patrols')
        .insert([patrolData]);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الدورية بنجاح",
      });

      setShowCreateDialog(false);
      setPatrolForm({
        name: '',
        area: '',
        department: '',
        location_address: '',
        location_lat: '',
        location_lng: ''
      });
      fetchPatrols();
    } catch (error) {
      console.error('Error creating patrol:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الدورية",
        variant: "destructive",
      });
    }
  };

  const updatePatrolStatus = async (patrolId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('patrols')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', patrolId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الدورية بنجاح",
      });

      fetchPatrols();
    } catch (error) {
      console.error('Error updating patrol status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الدورية",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة';
      case 'completed': return 'مكتملة';
      case 'paused': return 'متوقفة';
      default: return status;
    }
  };

  const getPatrolMembers = (patrolId: string) => {
    return patrolMembers.filter(member => member.patrol_id === patrolId);
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
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              إدارة الدوريات
            </h1>
            <p className="text-muted-foreground mt-1">
              متابعة وإدارة الدوريات الأمنية والجدول الزمني
            </p>
          </div>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 ml-2" />
              دورية جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء دورية جديدة</DialogTitle>
              <DialogDescription>
                املأ البيانات التالية لإنشاء دورية أمنية جديدة
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">اسم الدورية *</Label>
                <Input
                  id="name"
                  value={patrolForm.name}
                  onChange={(e) => setPatrolForm({...patrolForm, name: e.target.value})}
                  placeholder="مثال: دورية الحي الشرقي"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="area">المنطقة *</Label>
                <Input
                  id="area"
                  value={patrolForm.area}
                  onChange={(e) => setPatrolForm({...patrolForm, area: e.target.value})}
                  placeholder="مثال: المنطقة الشرقية - غزة"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="department">القسم المسؤول (اختياري)</Label>
                <Select
                  value={patrolForm.department}
                  onValueChange={(value) => setPatrolForm({...patrolForm, department: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم أو اتركه فارغاً" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون قسم محدد</SelectItem>
                    <SelectItem value="traffic_police">شرطة المرور</SelectItem>
                    <SelectItem value="cid">المباحث الجنائية</SelectItem>
                    <SelectItem value="special_police">الشرطة الخاصة</SelectItem>
                    <SelectItem value="cybercrime">مكافحة الجرائم الإلكترونية</SelectItem>
                    <SelectItem value="judicial_police">الشرطة القضائية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">عنوان الموقع</Label>
                <Textarea
                  id="address"
                  value={patrolForm.location_address}
                  onChange={(e) => setPatrolForm({...patrolForm, location_address: e.target.value})}
                  placeholder="العنوان التفصيلي للمنطقة"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lat">خط العرض (اختياري)</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={patrolForm.location_lat}
                    onChange={(e) => setPatrolForm({...patrolForm, location_lat: e.target.value})}
                    placeholder="31.5017"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="lng">خط الطول (اختياري)</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={patrolForm.location_lng}
                    onChange={(e) => setPatrolForm({...patrolForm, location_lng: e.target.value})}
                    placeholder="34.4668"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={createPatrol}
                disabled={!patrolForm.name || !patrolForm.area}
                className="bg-primary hover:bg-primary/90"
              >
                إنشاء الدورية
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">الدوريات النشطة</p>
                <p className="text-2xl font-bold text-green-700">
                  {patrols.filter(p => p.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">الدوريات المكتملة</p>
                <p className="text-2xl font-bold text-blue-700">
                  {patrols.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">الدوريات المتوقفة</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {patrols.filter(p => p.status === 'paused').length}
                </p>
              </div>
              <Pause className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">إجمالي الدوريات</p>
                <p className="text-2xl font-bold text-purple-700">{patrols.length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patrols List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">الدوريات الحالية</h2>
        
        {patrols.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد دوريات</h3>
              <p className="text-muted-foreground">لم يتم إنشاء أي دوريات حتى الآن</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {patrols.map((patrol) => {
              const members = getPatrolMembers(patrol.id);
              return (
                <Card key={patrol.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl text-foreground">{patrol.name}</CardTitle>
                          <Badge className={`${getStatusColor(patrol.status)} flex items-center gap-1`}>
                            {getStatusIcon(patrol.status)}
                            {getStatusText(patrol.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{patrol.area}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{members.length} أفراد</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(patrol.created_at).toLocaleDateString('en-US')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {patrol.status === 'active' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePatrolStatus(patrol.id, 'paused')}
                            >
                              <Pause className="h-4 w-4 ml-1" />
                              إيقاف مؤقت
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updatePatrolStatus(patrol.id, 'completed')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="h-4 w-4 ml-1" />
                              إنهاء الدورية
                            </Button>
                          </>
                        )}
                        
                        {patrol.status === 'paused' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updatePatrolStatus(patrol.id, 'active')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 ml-1" />
                              استئناف
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePatrolStatus(patrol.id, 'completed')}
                            >
                              إنهاء
                            </Button>
                          </>
                        )}
                        
                        {patrol.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePatrolStatus(patrol.id, 'active')}
                          >
                            <CheckCircle className="h-4 w-4 ml-1" />
                            إعادة تفعيل
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {patrol.location_address && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">العنوان</Label>
                          <p className="text-foreground">{patrol.location_address}</p>
                        </div>
                      )}
                      
                      {(patrol.location_lat && patrol.location_lng) && (
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            الموقع: {patrol.location_lat}, {patrol.location_lng}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://maps.google.com/?q=${patrol.location_lat},${patrol.location_lng}`, '_blank')}
                          >
                            عرض على الخريطة
                          </Button>
                        </div>
                      )}
                      
                      {members.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">أفراد الدورية</Label>
                          <div className="grid md:grid-cols-2 gap-2">
                            {members.map((member) => (
                              <div key={member.id} className="flex items-center justify-between bg-muted/50 rounded p-2">
                                <div>
                                  <p className="font-medium text-sm">{member.officer_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {member.role === 'leader' ? 'قائد الدورية' : member.role === 'member' ? 'عضو' : member.role}
                                  </p>
                                </div>
                                {member.officer_phone && (
                                  <Badge variant="outline" className="text-xs">
                                    {member.officer_phone}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                        <span>تم إنشاؤها: {new Date(patrol.created_at).toLocaleString('en-US')}</span>
                        <span>آخر تحديث: {new Date(patrol.updated_at).toLocaleString('en-US')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}