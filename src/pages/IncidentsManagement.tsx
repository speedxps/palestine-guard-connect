import React, { useState, useEffect } from 'react';
import { ArrowRight, Search, Filter, FileText, Phone, User, MapPin, Calendar, Clock, AlertCircle, CheckCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Incident {
  id: string;
  incident_type: string;
  title: string;
  description: string;
  location_address: string;
  location_lat: number | null;
  location_lng: number | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    phone: string;
  };
  incident_files: Array<{
    file_name: string;
    file_url: string;
    file_type: string;
  }>;
}

const IncidentsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          profiles!incidents_reporter_id_fkey(full_name, phone),
          incident_files(file_name, file_url, file_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البلاغات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: 'new' | 'in_progress' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ status: newStatus })
        .eq('id', incidentId);

      if (error) throw error;

      await fetchIncidents();
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة البلاغ بنجاح",
      });
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة البلاغ",
        variant: "destructive",
      });
    }
  };

  const deleteIncident = async (incidentId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البلاغ؟')) return;

    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', incidentId);

      if (error) throw error;

      await fetchIncidents();
      toast({
        title: "تم الحذف",
        description: "تم حذف البلاغ بنجاح",
      });
    } catch (error) {
      console.error('Error deleting incident:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف البلاغ",
        variant: "destructive",
      });
    }
  };

  const publishAsTask = async (incident: Incident) => {
    try {
      // الحصول على معرف الأدمن الحالي
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      // إنشاء مهمة جديدة بناءً على البلاغ
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: `مهمة: ${incident.title}`,
          description: `${incident.description}\n\nهذه المهمة تم إنشاؤها من البلاغ رقم: ${incident.id}`,
          location_address: incident.location_address,
          location_lat: incident.location_lat,
          location_lng: incident.location_lng,
          assigned_to: null, // سيتم تعيينها لاحقاً
          assigned_by: profileData.id,
          status: 'pending',
          due_date: null
        });

      if (error) throw error;

      toast({
        title: "تم النشر",
        description: "تم نشر البلاغ كمهمة جديدة بنجاح",
      });
    } catch (error) {
      console.error('Error publishing as task:', error);
      toast({
        title: "خطأ",
        description: "فشل في نشر البلاغ كمهمة",
        variant: "destructive",
      });
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || incident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'in_progress': return 'قيد المعالجة';
      case 'resolved': return 'محلول';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

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
              onClick={() => window.history.back()}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold font-arabic">إدارة البلاغات</h1>
              <p className="text-sm text-muted-foreground">عرض وإدارة جميع البلاغات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في البلاغات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 font-arabic"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الحالات</SelectItem>
              <SelectItem value="new">جديد</SelectItem>
              <SelectItem value="in_progress">قيد المعالجة</SelectItem>
              <SelectItem value="resolved">محلول</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{incidents.length}</div>
                <div className="text-sm text-muted-foreground">إجمالي البلاغات</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {incidents.filter(i => i.status === 'resolved').length}
                </div>
                <div className="text-sm text-muted-foreground">البلاغات المحلولة</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Incidents List */}
        <div className="space-y-3">
          {filteredIncidents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد بلاغات</h3>
                <p className="text-muted-foreground">لم يتم العثور على أي بلاغات تطابق البحث</p>
              </CardContent>
            </Card>
          ) : (
            filteredIncidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1 font-arabic">
                        {incident.title}
                      </h3>
                      <Badge className={getStatusColor(incident.status)}>
                        {getStatusText(incident.status)}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedIncident(incident);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedIncident(incident);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteIncident(incident.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{incident.profiles?.full_name || 'غير محدد'}</span>
                      {incident.profiles?.phone && (
                        <>
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{incident.profiles.phone}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{incident.location_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(incident.created_at)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-arabic">
                    {incident.description}
                  </p>

                  {incident.incident_files && incident.incident_files.length > 0 && (
                    <div className="mt-2">
                      <Badge variant="secondary">
                        {incident.incident_files.length} ملف مرفق
                      </Badge>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant={incident.status === 'resolved' ? 'secondary' : 'default'}
                      onClick={() => updateIncidentStatus(incident.id, incident.status === 'resolved' ? 'in_progress' : 'resolved')}
                    >
                      {incident.status === 'resolved' ? 'إلغاء الحل' : 'وضع علامة كمحلول'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => publishAsTask(incident)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      نشر كمهمة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-arabic">تفاصيل البلاغ</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">العنوان</Label>
                <p className="mt-1 font-arabic">{selectedIncident.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">الوصف</Label>
                <p className="mt-1 text-sm font-arabic">{selectedIncident.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">المبلغ</Label>
                <p className="mt-1">{selectedIncident.profiles?.full_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">رقم الهاتف</Label>
                <p className="mt-1">{selectedIncident.profiles?.phone || 'غير محدد'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">الموقع</Label>
                <p className="mt-1 font-arabic">{selectedIncident.location_address}</p>
              </div>
              {selectedIncident.incident_files && selectedIncident.incident_files.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">الملفات المرفقة</Label>
                  <div className="mt-2 space-y-2">
                    {selectedIncident.incident_files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <a 
                          href={file.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {file.file_name}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-arabic">تعديل البلاغ</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">الحالة</Label>
                <Select 
                  value={selectedIncident.status} 
                  onValueChange={(value) => updateIncidentStatus(selectedIncident.id, value as 'new' | 'in_progress' | 'resolved')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">جديد</SelectItem>
                    <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                    <SelectItem value="resolved">محلول</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentsManagement;