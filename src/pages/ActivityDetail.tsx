import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckSquare, 
  Car, 
  Shield, 
  User, 
  Clock,
  MapPin,
  Phone,
  FileText
} from 'lucide-react';

const ActivityDetail = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();

  const getActivityData = () => {
    // Mock data based on activity type
    switch (type) {
      case 'incident':
        return {
          title: 'حادث مروري - تقاطع رام الله',
          description: 'حادث تصادم بين مركبتين في تقاطع رام الله الرئيسي، تم إرسال دورية لموقع الحادث',
          status: 'in_progress',
          priority: 'عالية',
          location: 'تقاطع رام الله الرئيسي',
          reportedBy: 'أحمد محمد',
          phone: '0591234567',
          timestamp: '2024-01-15 14:30',
          details: 'تصادم بين سيارة نوع تويوتا وسيارة نوع هوندا، إصابات طفيفة، الحاجة لسيارة إسعاف وفريق المرور'
        };
      case 'task':
        return {
          title: 'مهمة دورية أمنية - البلدة القديمة',
          description: 'تنفيذ دورية أمنية في منطقة البلدة القديمة ضمن الخطة الأمنية اليومية',
          status: 'pending',
          priority: 'متوسطة',
          assignedTo: 'فريق الدورية الأولى',
          location: 'البلدة القديمة',
          timestamp: '2024-01-15 16:00',
          details: 'دورية أمنية روتينية تشمل المناطق التجارية والأسواق الشعبية'
        };
      case 'cybercrime':
        return {
          title: 'بلاغ جريمة إلكترونية - احتيال مالي',
          description: 'بلاغ حول عملية احتيال إلكتروني عبر مواقع التواصل الاجتماعي',
          status: 'new',
          priority: 'عالية',
          reportedBy: 'سارة أحمد',
          phone: '0597654321',
          timestamp: '2024-01-15 13:45',
          details: 'محاولة احتيال عبر رسائل وهمية تطلب معلومات بنكية شخصية'
        };
      default:
        return {
          title: 'نشاط غير محدد',
          description: 'لا توجد تفاصيل متاحة',
          status: 'unknown',
          timestamp: '2024-01-15'
        };
    }
  };

  const data = getActivityData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'in_progress': return 'قيد المعالجة';
      case 'completed': return 'مكتمل';
      case 'pending': return 'معلق';
      default: return 'غير محدد';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'incident': return AlertTriangle;
      case 'task': return CheckSquare;
      case 'cybercrime': return Shield;
      case 'violation': return Car;
      default: return FileText;
    }
  };

  const Icon = getIcon();

  return (
    <ProfessionalLayout
      title="تفاصيل النشاط"
      description="عرض تفاصيل النشاط والإجراءات المتخذة"
      showBackButton={true}
      backTo="/dashboard"
    >
      <div className="p-6 space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-arabic text-lg">
                    {data.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-arabic mt-1">
                    {data.description}
                  </p>
                </div>
              </div>
              <Badge className={`font-arabic ${getStatusColor(data.status)}`}>
                {getStatusText(data.status)}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic text-base flex items-center gap-2">
                <FileText className="h-5 w-5" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium font-arabic">تاريخ الإبلاغ</p>
                  <p className="text-sm text-muted-foreground">{data.timestamp}</p>
                </div>
              </div>
              
              {data.priority && (
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium font-arabic">الأولوية</p>
                    <p className="text-sm text-muted-foreground">{data.priority}</p>
                  </div>
                </div>
              )}

              {data.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium font-arabic">الموقع</p>
                    <p className="text-sm text-muted-foreground">{data.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          {(data.reportedBy || data.assignedTo) && (
            <Card>
              <CardHeader>
                <CardTitle className="font-arabic text-base flex items-center gap-2">
                  <User className="h-5 w-5" />
                  معلومات الاتصال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.reportedBy && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium font-arabic">المبلغ</p>
                      <p className="text-sm text-muted-foreground">{data.reportedBy}</p>
                    </div>
                  </div>
                )}

                {data.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium font-arabic">رقم الهاتف</p>
                      <p className="text-sm text-muted-foreground" dir="ltr">{data.phone}</p>
                    </div>
                  </div>
                )}

                {data.assignedTo && (
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium font-arabic">المُكلف</p>
                      <p className="text-sm text-muted-foreground">{data.assignedTo}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Details */}
        {data.details && (
          <Card>
            <CardHeader>
              <CardTitle className="font-arabic text-base">
                التفاصيل الكاملة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground font-arabic leading-relaxed">
                {data.details}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-arabic text-base">
              الإجراءات المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button className="font-arabic">
                تحديث الحالة
              </Button>
              <Button variant="outline" className="font-arabic">
                إضافة ملاحظة
              </Button>
              <Button variant="outline" className="font-arabic">
                طباعة التقرير
              </Button>
              {type === 'incident' && (
                <Button variant="outline" className="font-arabic">
                  إرسال دورية
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfessionalLayout>
  );
};

export default ActivityDetail;