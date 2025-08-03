import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Search, 
  Filter,
  AlertTriangle,
  Car,
  Users,
  Shield
} from 'lucide-react';

interface Incident {
  id: string;
  type: 'theft' | 'riot' | 'accident' | 'emergency';
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  status: 'new' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
}

const demoIncidents: Incident[] = [
  {
    id: '1',
    type: 'emergency',
    title: 'حالة طوارئ في غزة',
    description: 'تم الإبلاغ عن اضطرابات كبيرة تتطلب دعماً إضافياً',
    location: 'غزة، حي الرمال',
    date: '2024-01-15',
    time: '14:30',
    status: 'in-progress',
    priority: 'high'
  },
  {
    id: '2',
    type: 'theft',
    title: 'سرقة مركبة',
    description: 'تم الإبلاغ عن سرقة سيارة في منطقة البيرة',
    location: 'البيرة، شارع الإرسال',
    date: '2024-01-15',
    time: '10:15',
    status: 'new',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'accident',
    title: 'حادث مروري',
    description: 'حادث تصادم بين مركبتين على الطريق الرئيسي',
    location: 'رام الله، شارع الإذاعة',
    date: '2024-01-14',
    time: '16:45',
    status: 'resolved',
    priority: 'medium'
  },
  {
    id: '4',
    type: 'riot',
    title: 'اضطرابات',
    description: 'مظاهرات في المنطقة تتطلب تدخل الأمن',
    location: 'نابلس، وسط المدينة',
    date: '2024-01-14',
    time: '12:00',
    status: 'resolved',
    priority: 'high'
  }
];

const Incidents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return AlertTriangle;
      case 'theft':
        return Shield;
      case 'accident':
        return Car;
      case 'riot':
        return Users;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

  const filteredIncidents = demoIncidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || incident.type === filterType;
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="new">جديد</SelectItem>
                <SelectItem value="in-progress">قيد المعالجة</SelectItem>
                <SelectItem value="resolved">محلول</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Incidents List */}
        <div className="space-y-3">
          {filteredIncidents.map((incident) => {
            const Icon = getIncidentIcon(incident.type);
            
            return (
              <Card key={incident.id} className="glass-card p-4 hover:bg-card/90 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    incident.priority === 'high' ? 'bg-red-500/20' :
                    incident.priority === 'medium' ? 'bg-yellow-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      incident.priority === 'high' ? 'text-red-400' :
                      incident.priority === 'medium' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold font-arabic text-foreground">
                        {incident.title}
                      </h3>
                      <Badge className={getPriorityColor(incident.priority)}>
                        {incident.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {incident.description}
                    </p>
                    
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
                        {incident.status === 'new' ? 'جديد' :
                         incident.status === 'in-progress' ? 'قيد المعالجة' :
                         'محلول'}
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