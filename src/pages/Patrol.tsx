import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, MapPin, Users, Phone, Edit, Trash2, Search, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import MapComponent from '@/components/MapComponent';

interface PatrolMember {
  officer_name: string;
  officer_phone: string;
  role: string;
}

interface Patrol {
  id: string;
  name: string;
  area: string;
  location_address: string;
  location_lat: number | null;
  location_lng: number | null;
  status: string;
  created_by: string;
  patrol_members: PatrolMember[];
}

const PatrolUpdated = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [patrols, setPatrols] = useState<Patrol[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPatrol, setSelectedPatrol] = useState<Patrol | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    location_address: '',
    location_lat: null as number | null,
    location_lng: null as number | null,
    status: 'active',
    members: [] as PatrolMember[]
  });

  const [newMember, setNewMember] = useState({
    officer_name: '',
    officer_phone: '',
    role: 'member'
  });

  useEffect(() => {
    fetchPatrols();
  }, []);

  const fetchPatrols = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patrols')
        .select(`
          *,
          patrol_members(officer_name, officer_phone, role)
        `)
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
    } finally {
      setLoading(false);
    }
  };

  const createPatrol = async () => {
    if (!user || !formData.name || !formData.area) return;

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('User profile not found');

      // Create patrol
      const { data: patrol, error: patrolError } = await supabase
        .from('patrols')
        .insert({
          name: formData.name,
          area: formData.area,
          location_address: formData.location_address,
          location_lat: formData.location_lat,
          location_lng: formData.location_lng,
          status: formData.status,
          created_by: profile.id
        })
        .select()
        .single();

      if (patrolError) throw patrolError;

      // Add members if any
      if (formData.members.length > 0) {
        const memberInserts = formData.members.map(member => ({
          patrol_id: patrol.id,
          officer_id: profile.id,
          officer_name: member.officer_name,
          officer_phone: member.officer_phone,
          role: member.role
        }));

        await supabase
          .from('patrol_members')
          .insert(memberInserts);
      }

      toast({
        title: "تم إنشاء الدورية بنجاح",
        description: "تم إضافة الدورية الجديدة",
      });

      setCreateDialogOpen(false);
      resetForm();
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

  const updatePatrol = async () => {
    if (!selectedPatrol || !formData.name || !formData.area) return;

    try {
      const { error } = await supabase
        .from('patrols')
        .update({
          name: formData.name,
          area: formData.area,
          location_address: formData.location_address,
          location_lat: formData.location_lat,
          location_lng: formData.location_lng,
          status: formData.status
        })
        .eq('id', selectedPatrol.id);

      if (error) throw error;

      // Update members - delete existing and add new
      await supabase
        .from('patrol_members')
        .delete()
        .eq('patrol_id', selectedPatrol.id);

      if (formData.members.length > 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user?.id)
          .single();

        if (profile) {
          const memberInserts = formData.members.map(member => ({
            patrol_id: selectedPatrol.id,
            officer_id: profile.id,
            officer_name: member.officer_name,
            officer_phone: member.officer_phone,
            role: member.role
          }));

          await supabase
            .from('patrol_members')
            .insert(memberInserts);
        }
      }

      toast({
        title: "تم تحديث الدورية",
        description: "تم حفظ التغييرات بنجاح",
      });

      setEditDialogOpen(false);
      setSelectedPatrol(null);
      resetForm();
      fetchPatrols();
    } catch (error) {
      console.error('Error updating patrol:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الدورية",
        variant: "destructive",
      });
    }
  };

  const deletePatrol = async (patrolId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدورية؟')) return;

    try {
      const { error } = await supabase
        .from('patrols')
        .delete()
        .eq('id', patrolId);

      if (error) throw error;

      toast({
        title: "تم حذف الدورية",
        description: "تم حذف الدورية بنجاح",
      });

      fetchPatrols();
    } catch (error) {
      console.error('Error deleting patrol:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الدورية",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      area: '',
      location_address: '',
      location_lat: null,
      location_lng: null,
      status: 'active',
      members: []
    });
    setNewMember({
      officer_name: '',
      officer_phone: '',
      role: 'member'
    });
  };

  const addMember = () => {
    if (!newMember.officer_name) return;
    
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
    
    setNewMember({
      officer_name: '',
      officer_phone: '',
      role: 'member'
    });
  };

  const removeMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const openEditDialog = (patrol: Patrol) => {
    setSelectedPatrol(patrol);
    setFormData({
      name: patrol.name,
      area: patrol.area,
      location_address: patrol.location_address || '',
      location_lat: patrol.location_lat,
      location_lng: patrol.location_lng,
      status: patrol.status,
      members: patrol.patrol_members || []
    });
    setEditDialogOpen(true);
  };

  const filteredPatrols = patrols.filter(patrol =>
    patrol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patrol.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold font-arabic">الدوريات</h1>
              <p className="text-sm text-muted-foreground">Patrols Management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في الدوريات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 font-arabic"
            />
          </div>
          <div className="flex gap-2 mr-4">
            <Button 
              variant={showMap ? "default" : "outline"}
              onClick={() => setShowMap(!showMap)}
            >
              <Map className="h-4 w-4 ml-2" />
              {showMap ? "إخفاء الخريطة" : "عرض الخريطة"}
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  دورية جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-arabic">إنشاء دورية جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">اسم الدورية</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="دورية الخليل الشمالية"
                        className="font-arabic"
                      />
                    </div>
                    <div>
                      <Label htmlFor="area">المنطقة</Label>
                      <Input
                        id="area"
                        value={formData.area}
                        onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                        placeholder="اسم المنطقة"
                        className="font-arabic"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">العنوان (اختياري)</Label>
                    <Input
                      id="location"
                      value={formData.location_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, location_address: e.target.value }))}
                      placeholder="العنوان التفصيلي"
                      className="font-arabic"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lat">خط العرض</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={formData.location_lat || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, location_lat: parseFloat(e.target.value) || null }))}
                        placeholder="31.5326"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng">خط الطول</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={formData.location_lng || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, location_lng: parseFloat(e.target.value) || null }))}
                        placeholder="35.0998"
                      />
                    </div>
                  </div>

                  {/* Members Section */}
                  <div className="space-y-3">
                    <Label>أعضاء الدورية</Label>
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="اسم الضابط"
                          value={newMember.officer_name}
                          onChange={(e) => setNewMember(prev => ({ ...prev, officer_name: e.target.value }))}
                          className="font-arabic"
                        />
                        <Input
                          placeholder="رقم الهاتف"
                          value={newMember.officer_phone}
                          onChange={(e) => setNewMember(prev => ({ ...prev, officer_phone: e.target.value }))}
                        />
                        <div className="flex gap-1">
                          <Select value={newMember.role} onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="leader">قائد</SelectItem>
                              <SelectItem value="member">عضو</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button type="button" onClick={addMember} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {formData.members.length > 0 && (
                        <div className="space-y-2">
                          {formData.members.map((member, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{member.officer_name}</span>
                                <Badge variant="outline">
                                  {member.role === 'leader' ? 'قائد' : 'عضو'}
                                </Badge>
                                {member.officer_phone && (
                                  <span className="text-sm text-muted-foreground">{member.officer_phone}</span>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMember(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={createPatrol}>
                      إنشاء الدورية
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Map View */}
        {showMap && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-arabic">خريطة الدوريات</CardTitle>
              </CardHeader>
              <CardContent>
                <MapComponent 
                  patrols={filteredPatrols.filter(p => p.location_lat && p.location_lng)} 
                  height="500px"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Patrols List */}
        <div className="grid gap-4">
          {filteredPatrols.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد دوريات</h3>
                <p className="text-muted-foreground">لم يتم العثور على أي دوريات تطابق البحث</p>
              </CardContent>
            </Card>
          ) : (
            filteredPatrols.map((patrol) => (
              <Card key={patrol.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold font-arabic mb-2">{patrol.name}</h3>
                      <Badge 
                        className={patrol.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {patrol.status === 'active' ? 'نشطة' : 'غير نشطة'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(patrol)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {(user?.role === 'admin' || patrol.created_by === user?.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePatrol(patrol.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>المنطقة: {patrol.area}</span>
                    </div>
                    {patrol.location_address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>العنوان: {patrol.location_address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>عدد الأعضاء: {patrol.patrol_members?.length || 0}</span>
                    </div>
                    {patrol.location_lat && patrol.location_lng && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>الإحداثيات: {patrol.location_lat.toFixed(4)}, {patrol.location_lng.toFixed(4)}</span>
                      </div>
                    )}
                  </div>

                  {/* Patrol Members */}
                  {patrol.patrol_members && patrol.patrol_members.length > 0 && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        أعضاء الدورية
                      </h4>
                      <div className="space-y-2">
                        {patrol.patrol_members.map((member, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-background rounded">
                            <div>
                              <span className="font-medium">{member.officer_name}</span>
                              <Badge variant="outline" className="mr-2 text-xs">
                                {member.role === 'leader' ? 'قائد' : 'عضو'}
                              </Badge>
                            </div>
                            {member.officer_phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{member.officer_phone}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-arabic">تعديل الدورية</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">اسم الدورية</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="font-arabic"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-area">المنطقة</Label>
                  <Input
                    id="edit-area"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    className="font-arabic"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-location">العنوان</Label>
                <Input
                  id="edit-location"
                  value={formData.location_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_address: e.target.value }))}
                  className="font-arabic"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-lat">خط العرض</Label>
                  <Input
                    id="edit-lat"
                    type="number"
                    step="any"
                    value={formData.location_lat || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_lat: parseFloat(e.target.value) || null }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lng">خط الطول</Label>
                  <Input
                    id="edit-lng"
                    type="number"
                    step="any"
                    value={formData.location_lng || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_lng: parseFloat(e.target.value) || null }))}
                  />
                </div>
              </div>
              
              {/* Members Section */}
              <div className="space-y-3">
                <Label>أعضاء الدورية</Label>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="اسم الضابط"
                      value={newMember.officer_name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, officer_name: e.target.value }))}
                      className="font-arabic"
                    />
                    <Input
                      placeholder="رقم الهاتف"
                      value={newMember.officer_phone}
                      onChange={(e) => setNewMember(prev => ({ ...prev, officer_phone: e.target.value }))}
                    />
                    <div className="flex gap-1">
                      <Select value={newMember.role} onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="leader">قائد</SelectItem>
                          <SelectItem value="member">عضو</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={addMember} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {formData.members.length > 0 && (
                    <div className="space-y-2">
                      {formData.members.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.officer_name}</span>
                            <Badge variant="outline">
                              {member.role === 'leader' ? 'قائد' : 'عضو'}
                            </Badge>
                            {member.officer_phone && (
                              <span className="text-sm text-muted-foreground">{member.officer_phone}</span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={updatePatrol}>
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PatrolUpdated;