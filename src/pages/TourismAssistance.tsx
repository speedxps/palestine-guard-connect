import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Phone, MessageSquare, Clock } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface AssistanceRequest {
  id: string;
  tourist_name: string;
  location: string;
  type: string;
  status: string;
  created_at: string;
}

export default function TourismAssistance() {
  const [requests] = useState<AssistanceRequest[]>([
    { id: '1', tourist_name: 'John Smith', location: 'كنيسة المهد', type: 'إرشاد', status: 'pending', created_at: '2024-01-20 10:30' },
    { id: '2', tourist_name: 'Maria Garcia', location: 'البلدة القديمة', type: 'طوارئ', status: 'in_progress', created_at: '2024-01-20 11:15' },
    { id: '3', tourist_name: 'David Chen', location: 'الحرم الإبراهيمي', type: 'معلومات', status: 'completed', created_at: '2024-01-20 09:45' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'in_progress': return 'جاري المعالجة';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              مساعدة الزوار
            </h1>
            <p className="text-muted-foreground">طلبات المساعدة والإرشاد للسياح</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold">{request.tourist_name}</h3>
                    <Badge variant={getStatusColor(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>النوع: {request.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>الموقع: {request.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{request.created_at}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    اتصال
                  </Button>
                  <Button size="sm">معالجة</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
