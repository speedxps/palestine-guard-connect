import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BackButton } from '@/components/BackButton';
import { 
  Clock, 
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTickets } from '@/hooks/useTickets';

interface TeamMember {
  name: string;
  rank: string;
  phone: string;
  role: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high';
  assignedOfficer: string;
  teamMembers: TeamMember[];
}

const demoTasks: Task[] = [
  {
    id: '1',
    title: 'دورية أمنية في منطقة باب الزاوية',
    description: 'تنفيذ دورية أمنية روتينية في منطقة باب الزاوية وسط الخليل',
    location: 'الخليل، باب الزاوية',
    deadline: '2024-01-15 18:00',
    status: 'in-progress',
    priority: 'medium',
    assignedOfficer: 'الرائد أحمد قاسم',
    teamMembers: [
      { name: 'الرائد أحمد قاسم', rank: 'رائد', phone: '0599123456', role: 'قائد المهمة' },
      { name: 'الملازم محمد الطيطي', rank: 'ملازم', phone: '0599234567', role: 'ضابط ميداني' },
      { name: 'العريف يوسف أبو سنينة', rank: 'عريف', phone: '0599345678', role: 'أمن وحماية' }
    ]
  },
  {
    id: '2',
    title: 'التحقيق في قضية احتيال إلكتروني',
    description: 'متابعة التحقيق في قضية احتيال إلكتروني في منطقة دورا',
    location: 'دورا، المركز التجاري',
    deadline: '2024-01-16 10:00',
    status: 'pending',
    priority: 'high',
    assignedOfficer: 'المقدم خالد الجعبري',
    teamMembers: [
      { name: 'المقدم خالد الجعبري', rank: 'مقدم', phone: '0599987654', role: 'محقق رئيسي' },
      { name: 'النقيب سامر العويوي', rank: 'نقيب', phone: '0599876543', role: 'ضابط جرائم إلكترونية' },
      { name: 'الملازم عمر النتشة', rank: 'ملازم', phone: '0599765432', role: 'محقق مساعد' }
    ]
  },
  {
    id: '3',
    title: 'تأمين فعالية ثقافية في جامعة الخليل',
    description: 'تأمين الحماية للفعالية الثقافية في جامعة الخليل',
    location: 'الخليل، جامعة الخليل',
    deadline: '2024-01-14 16:00',
    status: 'completed',
    priority: 'medium',
    assignedOfficer: 'النقيب محمود العمور',
    teamMembers: [
      { name: 'النقيب محمود العمور', rank: 'نقيب', phone: '0599654321', role: 'قائد العملية' },
      { name: 'الملازم أول رائد الحروب', rank: 'ملازم أول', phone: '0599543210', role: 'تنسيق أمني' },
      { name: 'الرقيب فادي زيدان', rank: 'رقيب', phone: '0599432109', role: 'مراقبة' }
    ]
  },
  {
    id: '4',
    title: 'مراقبة حركة المرور في شارع عين سارة',
    description: 'مراقبة وتنظيم حركة المرور في شارع عين سارة الرئيسي',
    location: 'الخليل، شارع عين سارة',
    deadline: '2024-01-13 14:00',
    status: 'delayed',
    priority: 'low',
    assignedOfficer: 'الملازم أول هاني أبو هيكل',
    teamMembers: [
      { name: 'الملازم أول هاني أبو هيكل', rank: 'ملازم أول', phone: '0599321098', role: 'ضابط مرور' },
      { name: 'العريف وليد العجلوني', rank: 'عريف', phone: '0599210987', role: 'تنظيم مرور' }
    ]
  },
  {
    id: '5',
    title: 'حماية قافلة إنسانية في بني نعيم',
    description: 'تأمين حماية قافلة مساعدات إنسانية في منطقة بني نعيم',
    location: 'بني نعيم، مركز القرية',
    deadline: '2024-01-17 09:00',
    status: 'pending',
    priority: 'high',
    assignedOfficer: 'الرائد عماد شاهين',
    teamMembers: [
      { name: 'الرائد عماد شاهين', rank: 'رائد', phone: '0599109876', role: 'قائد الحماية' },
      { name: 'النقيب أحمد دويك', rank: 'نقيب', phone: '0599098765', role: 'تنسيق ميداني' },
      { name: 'الملازم محمد عدوان', rank: 'ملازم', phone: '0599987650', role: 'أمن محيطي' },
      { name: 'العريف سالم الشاروني', rank: 'عريف', phone: '0599876540', role: 'دعم لوجستي' }
    ]
  }
];

const Tasks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logTicket } = useTickets();
  const [tasks, setTasks] = useState(demoTasks);
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in-progress':
        return Clock;
      case 'delayed':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'delayed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
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

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
    ));
    
    toast({
      title: "تم تحديث حالة المهمة",
      description: "تم تحديث حالة المهمة بنجاح",
    });
    
    // Log ticket
    await logTicket({
      section: 'special_police',
      action_type: 'update',
      description: `تحديث حالة المهمة: ${task?.title}`,
      metadata: { taskId, oldStatus: task?.status, newStatus }
    });
  };

  const filteredTasks = tasks.filter(task => 
    filterStatus === 'all' || task.status === filterStatus
  );

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'in-progress':
        return 'قيد التنفيذ';
      case 'completed':
        return 'مكتملة';
      case 'delayed':
        return 'متأخرة';
      default:
        return status;
    }
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4 mb-4">
          <BackButton to="/dashboard" />
          <div>
            <h1 className="text-xl font-bold font-arabic">المهام والدوريات</h1>
            <p className="text-sm text-muted-foreground">Tasks & Patrols</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-4">
        {/* Filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المهام</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
            <SelectItem value="completed">مكتملة</SelectItem>
            <SelectItem value="delayed">متأخرة</SelectItem>
          </SelectContent>
        </Select>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            
            return (
              <Card key={task.id} className="glass-card p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold font-arabic text-foreground">
                      {task.title}
                    </h3>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{task.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{task.deadline}</span>
                    </div>
                  </div>
                  
                  {/* Team Members */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Users className="h-4 w-4" />
                      <span>الفريق المكلف ({task.teamMembers.length} أعضاء)</span>
                    </div>
                    <div className="grid gap-2">
                      {task.teamMembers.map((member, index) => (
                        <div key={index} className="bg-muted/50 rounded-lg p-3 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-medium text-foreground">{member.name}</div>
                              <div className="text-muted-foreground">{member.rank} - {member.role}</div>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span className="font-mono">{member.phone}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${
                        task.status === 'completed' ? 'text-green-400' :
                        task.status === 'delayed' ? 'text-red-400' :
                        task.status === 'in-progress' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} />
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusText(task.status)}
                      </Badge>
                    </div>
                    
                    {task.status !== 'completed' && (
                      <Select
                        value={task.status}
                        onValueChange={(value) => updateTaskStatus(task.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                          <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                          <SelectItem value="completed">مكتملة</SelectItem>
                          <SelectItem value="delayed">متأخرة</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد مهام مطابقة للتصفية</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;