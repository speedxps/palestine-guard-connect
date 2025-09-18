import React, { useState } from 'react';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  Plus,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location?: string;
  participants: string[];
  type: 'meeting' | 'patrol' | 'training' | 'operation';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

const SchedulingPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<ScheduleEvent[]>([
    {
      id: '1',
      title: 'اجتماع الطابور الصباحي',
      description: 'اجتماع يومي لتوزيع المهام ومراجعة الخطة الأمنية',
      date: '2024-01-15',
      time: '08:00',
      duration: '30 دقيقة',
      location: 'قاعة الاجتماعات',
      participants: ['جميع الضباط', 'رؤساء الأقسام'],
      type: 'meeting',
      status: 'scheduled'
    },
    {
      id: '2',
      title: 'دورية أمنية - البلدة القديمة',
      description: 'دورية أمنية روتينية في منطقة البلدة القديمة',
      date: '2024-01-15',
      time: '10:00',
      duration: '4 ساعات',
      location: 'البلدة القديمة',
      participants: ['فريق الدورية الأولى'],
      type: 'patrol',
      status: 'in_progress'
    },
    {
      id: '3',
      title: 'تدريب على الإسعافات الأولية',
      description: 'تدريب الضباط على تقنيات الإسعافات الأولية الحديثة',
      date: '2024-01-15',
      time: '14:00',
      duration: '2 ساعة',
      location: 'قاعة التدريب',
      participants: ['الضباط الجدد'],
      type: 'training',
      status: 'scheduled'
    },
    {
      id: '4',
      title: 'عملية أمنية خاصة',
      description: 'عملية أمنية مخططة في منطقة وسط المدينة',
      date: '2024-01-15',
      time: '20:00',
      duration: '3 ساعات',
      location: 'وسط المدينة',
      participants: ['الوحدة الخاصة', 'فريق الدعم'],
      type: 'operation',
      status: 'scheduled'
    }
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'patrol': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-purple-100 text-purple-800';
      case 'operation': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'meeting': return 'اجتماع';
      case 'patrol': return 'دورية';
      case 'training': return 'تدريب';
      case 'operation': return 'عملية';
      default: return 'غير محدد';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'مجدول';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return 'غير محدد';
    }
  };

  const todayEvents = events.filter(event => event.date === selectedDate);
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date(selectedDate));

  const isEventSoon = (date: string, time: string) => {
    const eventDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const diffInMinutes = (eventDateTime.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes > 0 && diffInMinutes <= 60;
  };

  return (
    <ProfessionalLayout
      title="الجدولة والمواعيد"
      description="إدارة مواعيد وأنشطة اليوم"
      showBackButton={true}
      backTo="/dashboard"
      showPrint={true}
      printContent="جدول المواعيد والأنشطة"
    >
      <div className="p-6 space-y-6">
        {/* Date Selector and Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-arabic flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  التاريخ المحدد
                </CardTitle>
                <Button size="sm" className="font-arabic">
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة موعد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                />
                <div className="text-sm text-muted-foreground">
                  {todayEvents.length} موعد مجدول
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-arabic text-base">
                ملخص اليوم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-arabic">إجمالي الأنشطة</span>
                <Badge>{todayEvents.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-arabic">قيد التنفيذ</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {todayEvents.filter(e => e.status === 'in_progress').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-arabic">مكتمل</span>
                <Badge className="bg-green-100 text-green-800">
                  {todayEvents.filter(e => e.status === 'completed').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Events */}
        <Card>
          <CardHeader>
            <CardTitle className="font-arabic">
              أنشطة اليوم - {new Date(selectedDate).toLocaleDateString('ar-PS')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-arabic">
                  لا توجد أنشطة مجدولة لهذا اليوم
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayEvents
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((event) => (
                    <Card 
                      key={event.id}
                      className={`${
                        isEventSoon(event.date, event.time) 
                          ? 'border-orange-200 bg-orange-50/30' 
                          : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold font-arabic">
                                {event.title}
                              </h3>
                              {isEventSoon(event.date, event.time) && (
                                <Badge className="bg-orange-100 text-orange-800 font-arabic">
                                  <AlertCircle className="h-3 w-3 ml-1" />
                                  قريباً
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground font-arabic mb-3">
                              {event.description}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{event.time} ({event.duration})</span>
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-arabic">{event.location}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-arabic">
                                  {event.participants.join(', ')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge className={`font-arabic ${getTypeColor(event.type)}`}>
                              {getTypeText(event.type)}
                            </Badge>
                            <Badge className={`font-arabic ${getStatusColor(event.status)}`}>
                              {getStatusText(event.status)}
                            </Badge>
                            
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic">
                الأنشطة القادمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('ar-PS', { month: 'short' })}
                        </div>
                        <div className="font-bold">
                          {new Date(event.date).getDate()}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium font-arabic">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.time} - {event.location}
                        </p>
                      </div>
                    </div>
                    <Badge className={`font-arabic ${getTypeColor(event.type)}`}>
                      {getTypeText(event.type)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProfessionalLayout>
  );
};

export default SchedulingPage;