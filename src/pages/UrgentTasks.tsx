import React, { useState } from 'react';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  AlertTriangle, 
  MapPin, 
  User,
  CheckCircle,
  XCircle,
  Pause,
  Play
} from 'lucide-react';

interface UrgentTask {
  id: string;
  title: string;
  description: string;
  priority: 'عالية' | 'متوسطة' | 'منخفضة';
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  assignedTo: string;
  location?: string;
  deadline: string;
  createdAt: string;
}

const UrgentTasks = () => {
  const [tasks, setTasks] = useState<UrgentTask[]>([
    {
      id: '1',
      title: 'دورية عاجلة - منطقة المنارة',
      description: 'تنفيذ دورية أمنية عاجلة في منطقة المنارة بناءً على بلاغات مواطنين',
      priority: 'عالية',
      status: 'pending',
      assignedTo: 'فريق الدورية الأولى',
      location: 'منطقة المنارة',
      deadline: '2024-01-15 18:00',
      createdAt: '2024-01-15 15:30'
    },
    {
      id: '2',
      title: 'التحقيق في بلاغ سطو',
      description: 'التحقيق في بلاغ سطو على محل تجاري في وسط المدينة',
      priority: 'عالية',
      status: 'in_progress',
      assignedTo: 'المحقق أحمد سالم',
      location: 'وسط المدينة',
      deadline: '2024-01-16 10:00',
      createdAt: '2024-01-15 14:00'
    },
    {
      id: '3',
      title: 'فحص تقرير جريمة إلكترونية',
      description: 'مراجعة وفحص تقرير جريمة إلكترونية والتنسيق مع الوحدة المختصة',
      priority: 'متوسطة',
      status: 'pending',
      assignedTo: 'وحدة الجرائم الإلكترونية',
      deadline: '2024-01-16 14:00',
      createdAt: '2024-01-15 16:15'
    },
    {
      id: '4',
      title: 'متابعة قضية مخالفات مرورية',
      description: 'متابعة ملف المخالفات المرورية المتراكمة وإصدار الإنذارات اللازمة',
      priority: 'منخفضة',
      status: 'paused',
      assignedTo: 'قسم المرور',
      deadline: '2024-01-17 12:00',
      createdAt: '2024-01-15 10:00'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عالية': return 'bg-red-100 text-red-800';
      case 'متوسطة': return 'bg-yellow-100 text-yellow-800';
      case 'منخفضة': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'paused': return 'متوقف';
      default: return 'غير محدد';
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: UrgentTask['status']) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const target = new Date(deadline);
    const diff = target.getTime() - now.getTime();
    
    if (diff < 0) return 'متأخر';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  return (
    <ProfessionalLayout
      title="المهام العاجلة"
      description="المهام المطلوب إنجازها بأولوية عالية"
      showBackButton={true}
      backTo="/dashboard"
      showPrint={true}
      printContent="قائمة المهام العاجلة"
    >
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-arabic">عالية الأولوية</p>
                  <p className="text-2xl font-bold">
                    {tasks.filter(t => t.priority === 'عالية').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Play className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-arabic">قيد التنفيذ</p>
                  <p className="text-2xl font-bold">
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-arabic">معلق</p>
                  <p className="text-2xl font-bold">
                    {tasks.filter(t => t.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-arabic">متأخر</p>
                  <p className="text-2xl font-bold">
                    {tasks.filter(t => isOverdue(t.deadline)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className={`${isOverdue(task.deadline) ? 'border-red-200 bg-red-50/30' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold font-arabic text-lg">
                        {task.title}
                      </h3>
                      {isOverdue(task.deadline) && (
                        <Badge className="bg-red-100 text-red-800 font-arabic">
                          متأخر
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground font-arabic text-sm mb-3">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-arabic">{task.assignedTo}</span>
                      </div>
                      
                      {task.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-arabic">{task.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-arabic">
                          {isOverdue(task.deadline) ? 'متأخر' : `متبقي ${getTimeRemaining(task.deadline)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={`font-arabic ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                    <Badge className={`font-arabic ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    تاريخ الإنشاء: {new Date(task.createdAt).toLocaleString('ar-PS')}
                  </div>
                  
                  <div className="flex gap-2">
                    {task.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        className="font-arabic"
                      >
                        <Play className="h-4 w-4 ml-1" />
                        بدء التنفيذ
                      </Button>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateTaskStatus(task.id, 'paused')}
                          className="font-arabic"
                        >
                          <Pause className="h-4 w-4 ml-1" />
                          إيقاف مؤقت
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="font-arabic"
                        >
                          <CheckCircle className="h-4 w-4 ml-1" />
                          إكمال
                        </Button>
                      </>
                    )}
                    
                    {task.status === 'paused' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        className="font-arabic"
                      >
                        <Play className="h-4 w-4 ml-1" />
                        استئناف
                      </Button>
                    )}
                    
                    {task.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-800 font-arabic">
                        <CheckCircle className="h-3 w-3 ml-1" />
                        مكتمل
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-arabic">
                لا توجد مهام عاجلة في الوقت الحالي
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ProfessionalLayout>
  );
};

export default UrgentTasks;