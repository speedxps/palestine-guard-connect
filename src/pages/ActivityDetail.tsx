import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  ArrowLeft,
  Edit,
  MessageSquare,
  Printer,
  AlertTriangle,
  CheckSquare,
  Car,
  Shield,
  Clock,
  User
} from 'lucide-react';
import BackButton from '@/components/BackButton';

interface ActivityData {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  type: 'incident' | 'task' | 'violation' | 'cybercrime';
  reporter_id?: string;
  assigned_to?: string;
  citizen_name?: string;
  location?: string;
}

const ActivityDetail = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchActivity();
  }, [id, type]);

  const fetchActivity = async () => {
    if (!id || !type) return;
    
    setLoading(true);
    try {
      let query;
      let selectColumns = 'id, created_at, updated_at';
      
      switch (type) {
        case 'incident':
          query = supabase.from('incidents');
          selectColumns += ', title, description, status, reporter_id, assigned_to, location_address';
          break;
        case 'task':
          query = supabase.from('tasks');
          selectColumns += ', title, description, status, assigned_to, assigned_by, location_address';
          break;
        case 'violation':
          query = supabase.from('traffic_records');
          selectColumns += ', citizen_name, details, is_resolved';
          break;
        case 'cybercrime':
          query = supabase.from('cybercrime_reports');
          selectColumns += ', description, status, reporter_id, assigned_to, platform';
          break;
        default:
          toast.error('نوع النشاط غير صحيح');
          navigate('/dashboard');
          return;
      }

      const { data, error } = await query
        .select(selectColumns)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform data based on type
      let transformedData: ActivityData = {
        id: data.id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        type: type as 'incident' | 'task' | 'violation' | 'cybercrime',
        title: '',
        description: '',
        status: '',
      };

      switch (type) {
        case 'incident':
          transformedData.title = data.title;
          transformedData.description = data.description;
          transformedData.status = data.status;
          transformedData.reporter_id = data.reporter_id;
          transformedData.assigned_to = data.assigned_to;
          transformedData.location = data.location_address;
          break;
        case 'task':
          transformedData.title = data.title;
          transformedData.description = data.description;
          transformedData.status = data.status;
          transformedData.assigned_to = data.assigned_to;
          transformedData.location = data.location_address;
          break;
        case 'violation':
          transformedData.title = `مخالفة - ${data.citizen_name}`;
          transformedData.description = data.details || '';
          transformedData.status = data.is_resolved ? 'resolved' : 'open';
          transformedData.citizen_name = data.citizen_name;
          break;
        case 'cybercrime':
          transformedData.title = 'تقرير جريمة إلكترونية';
          transformedData.description = data.description;
          transformedData.status = data.status;
          transformedData.reporter_id = data.reporter_id;
          transformedData.assigned_to = data.assigned_to;
          break;
      }

      setActivity(transformedData);
      setNewStatus(transformedData.status);
    } catch (error) {
      console.error('Error fetching activity:', error);
      toast.error('فشل في تحميل تفاصيل النشاط');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!activity || !newStatus) return;

    setUpdating(true);
    try {
      let updateData: any = {};
      let query;

      switch (activity.type) {
        case 'incident':
          query = supabase.from('incidents');
          updateData = { status: newStatus, updated_at: new Date().toISOString() };
          break;
        case 'task':
          query = supabase.from('tasks');
          updateData = { status: newStatus, updated_at: new Date().toISOString() };
          break;
        case 'violation':
          query = supabase.from('traffic_records');
          updateData = { is_resolved: newStatus === 'resolved', updated_at: new Date().toISOString() };
          break;
        case 'cybercrime':
          query = supabase.from('cybercrime_reports');
          updateData = { status: newStatus, updated_at: new Date().toISOString() };
          break;
      }

      const { error } = await query
        .update(updateData)
        .eq('id', activity.id);

      if (error) throw error;

      toast.success('تم تحديث الحالة بنجاح');
      fetchActivity(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('فشل في تحديث الحالة');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('يرجى إدخال الملاحظة');
      return;
    }

    // For this demo, we'll just show a success message
    // In a real app, you'd add this to a notes table
    toast.success('تمت إضافة الملاحظة بنجاح');
    setNewNote('');
  };

  const handlePrint = () => {
    if (!activity) return;
    
    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>تقرير النشاط - ${activity.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #333; }
          .value { margin-right: 10px; }
          .status { padding: 5px 10px; border-radius: 5px; display: inline-block; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير النشاط</h1>
          <h2>${activity.title}</h2>
        </div>
        
        <div class="section">
          <span class="label">نوع النشاط:</span>
          <span class="value">${getTypeLabel(activity.type)}</span>
        </div>
        
        <div class="section">
          <span class="label">الوصف:</span>
          <div class="value">${activity.description}</div>
        </div>
        
        <div class="section">
          <span class="label">الحالة:</span>
          <span class="value status">${getStatusLabel(activity.status)}</span>
        </div>
        
        ${activity.location ? `
        <div class="section">
          <span class="label">الموقع:</span>
          <span class="value">${activity.location}</span>
        </div>
        ` : ''}
        
        <div class="section">
          <span class="label">تاريخ الإنشاء:</span>
          <span class="value">${new Date(activity.created_at).toLocaleString('en-US')}</span>
        </div>
        
        <div class="section">
          <span class="label">آخر تحديث:</span>
          <span class="value">${new Date(activity.updated_at).toLocaleString('en-US')}</span>
        </div>
        
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
          طُبع بتاريخ: ${new Date().toLocaleString('en-US')}
        </div>
      </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return AlertTriangle;
      case 'task':
        return CheckSquare;
      case 'violation':
        return Car;
      case 'cybercrime':
        return Shield;
      default:
        return AlertTriangle;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'incident':
        return 'بلاغ';
      case 'task':
        return 'مهمة';
      case 'violation':
        return 'مخالفة';
      case 'cybercrime':
        return 'جريمة إلكترونية';
      default:
        return 'غير محدد';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'new': 'جديد',
      'in_progress': 'قيد المعالجة',
      'resolved': 'محلول',
      'pending': 'معلق',
      'completed': 'مكتمل',
      'open': 'مفتوح',
      'closed': 'مغلق'
    };
    return statusMap[status] || status;
  };

  const getStatusOptions = (type: string) => {
    switch (type) {
      case 'incident':
        return [
          { value: 'new', label: 'جديد' },
          { value: 'in_progress', label: 'قيد المعالجة' },
          { value: 'resolved', label: 'محلول' }
        ];
      case 'task':
        return [
          { value: 'pending', label: 'معلق' },
          { value: 'in_progress', label: 'قيد التنفيذ' },
          { value: 'completed', label: 'مكتمل' }
        ];
      case 'violation':
        return [
          { value: 'open', label: 'مفتوح' },
          { value: 'resolved', label: 'محلول' }
        ];
      case 'cybercrime':
        return [
          { value: 'new', label: 'جديد' },
          { value: 'in_progress', label: 'قيد المعالجة' },
          { value: 'resolved', label: 'محلول' }
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-4">النشاط غير موجود</h1>
          <Button onClick={() => navigate('/dashboard')}>
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  const Icon = getActivityIcon(activity.type);

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{activity.title}</h1>
                <p className="text-muted-foreground">{getTypeLabel(activity.type)}</p>
              </div>
            </div>
          </div>
          <Badge variant={activity.status === 'resolved' || activity.status === 'completed' ? 'default' : 'secondary'}>
            {getStatusLabel(activity.status)}
          </Badge>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              تفاصيل النشاط
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="font-semibold text-sm">الوصف:</label>
              <p className="mt-1 text-muted-foreground">{activity.description}</p>
            </div>
            
            {activity.location && (
              <div>
                <label className="font-semibold text-sm">الموقع:</label>
                <p className="mt-1 text-muted-foreground">{activity.location}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                تاريخ الإنشاء: {formatDistanceToNow(new Date(activity.created_at), { 
                  addSuffix: true, 
                  locale: ar 
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                آخر تحديث: {formatDistanceToNow(new Date(activity.updated_at), { 
                  addSuffix: true, 
                  locale: ar 
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Edit className="h-5 w-5" />
                تحديث الحالة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة الجديدة" />
                </SelectTrigger>
                <SelectContent>
                  {getStatusOptions(activity.type).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleUpdateStatus} 
                disabled={updating || newStatus === activity.status}
                className="w-full"
              >
                {updating ? 'جاري التحديث...' : 'تحديث الحالة'}
              </Button>
            </CardContent>
          </Card>

          {/* Add Note */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                إضافة ملاحظة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="أدخل ملاحظة جديدة..."
                className="min-h-[80px]"
              />
              <Button onClick={handleAddNote} className="w-full">
                إضافة ملاحظة
              </Button>
            </CardContent>
          </Card>

          {/* Print Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Printer className="h-5 w-5" />
                طباعة التقرير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handlePrint} variant="outline" className="w-full">
                <Printer className="h-4 w-4 mr-2" />
                طباعة التقرير
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;