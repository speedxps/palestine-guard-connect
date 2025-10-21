import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Eye, Download } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface Permit {
  id: string;
  person_name: string;
  permit_number: string;
  permit_type: string;
  status: string;
  issue_date: string;
  expiry_date: string;
}

export default function BordersPermits() {
  const [permits] = useState<Permit[]>([
    { id: '1', person_name: 'سعيد أحمد', permit_number: 'PRM-2024-001', permit_type: 'عمل', status: 'active', issue_date: '2024-01-15', expiry_date: '2024-12-31' },
    { id: '2', person_name: 'ليلى محمود', permit_number: 'PRM-2024-002', permit_type: 'دراسة', status: 'active', issue_date: '2024-01-10', expiry_date: '2024-06-30' },
    { id: '3', person_name: 'خالد حسن', permit_number: 'PRM-2024-003', permit_type: 'علاج', status: 'expired', issue_date: '2023-12-01', expiry_date: '2024-01-15' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              إدارة التصاريح
            </h1>
            <p className="text-muted-foreground">إصدار ومتابعة تصاريح العبور</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            تصريح جديد
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {permits.map((permit) => (
            <Card key={permit.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{permit.person_name}</h3>
                    <p className="text-sm text-muted-foreground">رقم التصريح: {permit.permit_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">نوع التصريح</p>
                    <p className="font-semibold">{permit.permit_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">تاريخ الإصدار</p>
                    <p className="font-semibold">{permit.issue_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
                    <p className="font-semibold">{permit.expiry_date}</p>
                  </div>
                  <Badge variant={permit.status === 'active' ? 'default' : 'secondary'}>
                    {permit.status === 'active' ? 'ساري' : 'منتهي'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
