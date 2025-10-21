import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Filter, Database } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface CrossingRecord {
  id: string;
  person_name: string;
  passport_number: string;
  crossing: string;
  direction: string;
  timestamp: string;
  status: string;
}

export default function BordersDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [records] = useState<CrossingRecord[]>([
    { id: '1', person_name: 'أحمد محمد', passport_number: 'P123456', crossing: 'معبر رفح', direction: 'خروج', timestamp: '2024-01-20 10:30', status: 'approved' },
    { id: '2', person_name: 'فاطمة علي', passport_number: 'P789012', crossing: 'معبر الكرامة', direction: 'دخول', timestamp: '2024-01-20 11:15', status: 'approved' },
    { id: '3', person_name: 'محمود حسن', passport_number: 'P345678', crossing: 'معبر رفح', direction: 'خروج', timestamp: '2024-01-20 09:45', status: 'pending' },
  ]);

  const filteredRecords = records.filter(record =>
    record.person_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.passport_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              قاعدة بيانات العبور
            </h1>
            <p className="text-muted-foreground">سجلات الدخول والخروج والتصاريح</p>
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            تصفية
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث برقم الجواز أو الاسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{record.person_name}</h3>
                    <p className="text-sm text-muted-foreground">جواز: {record.passport_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">المعبر</p>
                    <p className="font-semibold">{record.crossing}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">الاتجاه</p>
                    <p className="font-semibold">{record.direction}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">التوقيت</p>
                    <p className="font-semibold">{record.timestamp}</p>
                  </div>
                  <Badge variant={record.status === 'approved' ? 'default' : 'secondary'}>
                    {record.status === 'approved' ? 'موافق عليه' : 'قيد المراجعة'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
