import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BackButton } from '@/components/BackButton';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Search, 
  Filter,
  AlertTriangle,
  Car,
  Users,
  Shield,
  CheckSquare
} from 'lucide-react';

interface IncidentItem {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  source: 'incident' | 'task';
  reporter_name?: string;
}

const Incidents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      
      // Fetch incidents
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidents')
        .select(`
          id,
          title,
          description,
          incident_type,
          location_address,
          status,
          created_at,
          profiles!incidents_reporter_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (incidentsError) throw incidentsError;

      // Fetch tasks created from incidents
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          location_address,
          status,
          created_at,
          profiles!tasks_assigned_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Combine and format data
      const formattedIncidents: IncidentItem[] = [
        ...(incidentsData || []).map(item => ({
          id: item.id,
          type: item.incident_type,
          title: item.title,
          description: item.description,
          location: item.location_address || 'غير محدد',
          date: new Date(item.created_at).toLocaleDateString('ar-EG'),
          time: new Date(item.created_at).toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: item.status,
          priority: getPriorityFromType(item.incident_type),
          source: 'incident' as const,
          reporter_name: item.profiles?.full_name
        })),
        ...(tasksData || []).map(item => ({
          id: item.id,
          type: 'task',
          title: item.title,
          description: item.description || 'مهمة منشأة من بلاغ',
          location: item.location_address || 'غير محدد',
          date: new Date(item.created_at).toLocaleDateString('ar-EG'),
          time: new Date(item.created_at).toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: item.status,
          priority: 'medium' as const,
          source: 'task' as const,
          reporter_name: item.profiles?.full_name
        }))
      ];

      // Sort by creation date (newest first)
      formattedIncidents.sort((a, b) => 
        new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
      );

      setIncidents(formattedIncidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الأحداث",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityFromType = (type: string): 'low' | 'medium' | 'high' => {
    switch (type) {
      case 'emergency':
        return 'high';
      case 'riot':
      case 'violence':
        return 'high';
      case 'fire':
      case 'accident':
        return 'medium';
      case 'theft':
        return 'medium';
      default:
        return 'low';
    }
  };

  const getIncidentIcon = (type: string, source: string) => {
    if (source === 'task') {
      return CheckSquare;
    }
    
    switch (type) {
      case 'emergency':
        return AlertTriangle;
      case 'theft':
        return Shield;
      case 'accident':
        return Car;
      case 'riot':
      case 'violence':
        return Users;
      case 'fire':
        return AlertTriangle;
      case 'medical':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
      case 'pending':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress':
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved':
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'delayed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'جديد';
      case 'pending':
        return 'قيد الانتظار';
      case 'in_progress':
      case 'in-progress':
        return 'قيد المعالجة';
      case 'resolved':
        return 'محلول';
      case 'completed':
        return 'مكتمل';
      case 'delayed':
        return 'متأخر';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (incident.reporter_name && incident.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || incident.type === filterType || 
                       (filterType === 'task' && incident.source === 'task');
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
      <div className="page-header">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-arabic">الأحداث والبلاغات</h1>
            <p className="text-sm text-muted-foreground">Incidents & Reports</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في البلاغات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-background/50 border-border/50"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="نوع البلاغ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="emergency">طوارئ</SelectItem>
                <SelectItem value="theft">سرقة</SelectItem>
                <SelectItem value="accident">حادث</SelectItem>
                <SelectItem value="riot">اضطرابات</SelectItem>
                <SelectItem value="violence">عنف</SelectItem>
                <SelectItem value="fire">حريق</SelectItem>
                <SelectItem value="medical">طوارئ طبية</SelectItem>
                <SelectItem value="task">مهام</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="new">جديد</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                <SelectItem value="resolved">محلول</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="delayed">متأخر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Incidents List */}
        <div className="space-y-3">
          {filteredIncidents.map((incident) => {
            const Icon = getIncidentIcon(incident.type, incident.source);
            
            return (
              <Card key={`${incident.source}-${incident.id}`} className="glass-card p-4 hover:bg-card/90 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    incident.source === 'task' ? 'bg-purple-500/20' :
                    incident.priority === 'high' ? 'bg-red-500/20' :
                    incident.priority === 'medium' ? 'bg-yellow-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      incident.source === 'task' ? 'text-purple-400' :
                      incident.priority === 'high' ? 'text-red-400' :
                      incident.priority === 'medium' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold font-arabic text-foreground">
                          {incident.title}
                        </h3>
                        {incident.source === 'task' && (
                          <Badge variant="outline" className="text-xs mt-1">
                            مهمة
                          </Badge>
                        )}
                      </div>
                      <Badge className={getPriorityColor(incident.priority)}>
                        {incident.priority === 'high' ? 'عالي' :
                         incident.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground font-arabic">
                      {incident.description}
                    </p>
                    
                    {incident.reporter_name && (
                      <p className="text-xs text-muted-foreground">
                        بواسطة: {incident.reporter_name}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{incident.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{incident.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(incident.status)}>
                        {getStatusText(incident.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {incident.date}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredIncidents.length === 0 && (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد بلاغات مطابقة للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Incidents;