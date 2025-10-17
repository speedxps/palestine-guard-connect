import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Clock, 
  Search, 
  AlertTriangle,
  Car,
  Users,
  Shield,
  CheckSquare,
  Phone,
  FileText,
  Filter as FilterIcon
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
  reporter_phone?: string;
}

const Incidents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      
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

      const formattedIncidents: IncidentItem[] = (incidentsData || []).map(item => ({
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
      }));

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
      case 'riot':
      case 'violence':
        return 'high';
      case 'fire':
      case 'accident':
      case 'theft':
        return 'medium';
      default:
        return 'low';
    }
  };

  const getIncidentIcon = (type: string) => {
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
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
      case 'pending':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'in_progress':
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'resolved':
      case 'completed':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'delayed':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'pending': return 'قيد الانتظار';
      case 'in_progress':
      case 'in-progress': return 'قيد المعالجة';
      case 'resolved': return 'محلول';
      case 'completed': return 'مكتمل';
      case 'delayed': return 'متأخر';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'emergency': return 'طوارئ';
      case 'theft': return 'سرقة';
      case 'accident': return 'حادث';
      case 'riot': return 'اضطرابات';
      case 'violence': return 'عنف';
      case 'fire': return 'حريق';
      case 'medical': return 'طوارئ طبية';
      default: return type;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (incident.reporter_name && incident.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || incident.type === filterType;
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || incident.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const stats = {
    total: incidents.length,
    new: incidents.filter(i => i.status === 'new').length,
    inProgress: incidents.filter(i => i.status === 'in_progress' || i.status === 'in-progress').length,
    resolved: incidents.filter(i => i.status === 'resolved' || i.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3 bg-card px-4 md:px-6 py-3 rounded-full shadow-lg border">
            <AlertTriangle className="h-6 md:h-8 w-6 md:w-8 text-primary" />
            <h1 className="text-xl md:text-3xl font-bold">الأحداث والبلاغات</h1>
          </div>
          <Button 
            onClick={() => navigate('/incidents/new')}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            بلاغ جديد
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-lg border-t-4 border-primary">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.total}</p>
                <p className="text-sm text-muted-foreground mt-1">إجمالي البلاغات</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-t-4 border-blue-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
                <p className="text-sm text-muted-foreground mt-1">جديدة</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-t-4 border-yellow-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground mt-1">قيد المعالجة</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-t-4 border-green-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground mt-1">محلولة</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
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
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="new">جديد</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                  <SelectItem value="resolved">محلول</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأولويات</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="low">منخفضة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Incidents List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIncidents.map((incident) => {
            const Icon = getIncidentIcon(incident.type);
            
            return (
              <Card 
                key={incident.id} 
                className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-primary"
                onClick={() => navigate(`/incidents/${incident.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg ${
                      incident.priority === 'high' ? 'bg-red-500/20' :
                      incident.priority === 'medium' ? 'bg-yellow-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        incident.priority === 'high' ? 'text-red-600' :
                        incident.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(incident.type)}
                        </Badge>
                        <Badge className={getPriorityColor(incident.priority)}>
                          {incident.priority === 'high' ? 'عالي' :
                           incident.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{incident.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {incident.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{incident.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{incident.date} - {incident.time}</span>
                    </div>
                    {incident.reporter_name && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{incident.reporter_name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <Badge className={getStatusColor(incident.status)}>
                      {getStatusText(incident.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredIncidents.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <FilterIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">لا توجد بلاغات مطابقة للبحث</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Incidents;
