import React, { useState, useEffect } from 'react';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Search, Filter } from 'lucide-react';

const JudicialTracking = () => {
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('judicial_transfers')
        .select('*, judicial_cases(case_number, title)')
        .order('transferred_at', { ascending: false });

      if (error) throw error;
      setTransfers(data || []);
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = 
      transfer.judicial_cases?.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || 
      transfer.to_department === departmentFilter || 
      transfer.from_department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusBadge = (status: string) => {
    const statusColors: any = {
      pending: 'bg-yellow-500',
      received: 'bg-blue-500',
      reviewed: 'bg-purple-500',
      completed: 'bg-green-500'
    };

    const statusLabels: any = {
      pending: 'معلق',
      received: 'مستلم',
      reviewed: 'تمت المراجعة',
      completed: 'مكتمل'
    };

    return (
      <Badge className={statusColors[status]}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const getDepartmentLabel = (dept: string) => {
    const labels: any = {
      judicial_police: 'الشرطة القضائية',
      court: 'المحكمة',
      prosecution: 'النيابة العامة'
    };
    return labels[dept] || dept;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">تتبع القضايا</h1>
          </div>
          <div />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>جميع عمليات النقل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="received">مستلم</SelectItem>
                  <SelectItem value="reviewed">تمت المراجعة</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  <SelectItem value="judicial_police">الشرطة القضائية</SelectItem>
                  <SelectItem value="court">المحكمة</SelectItem>
                  <SelectItem value="prosecution">النيابة العامة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم القضية</TableHead>
                  <TableHead>من</TableHead>
                  <TableHead>إلى</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ النقل</TableHead>
                  <TableHead>تاريخ الاستلام</TableHead>
                  <TableHead>الملاحظات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-medium">
                      {transfer.judicial_cases?.case_number}
                    </TableCell>
                    <TableCell>{getDepartmentLabel(transfer.from_department)}</TableCell>
                    <TableCell>{getDepartmentLabel(transfer.to_department)}</TableCell>
                    <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                    <TableCell>
                      {new Date(transfer.transferred_at).toLocaleString('ar')}
                    </TableCell>
                    <TableCell>
                      {transfer.received_at 
                        ? new Date(transfer.received_at).toLocaleString('ar')
                        : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transfer.message || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredTransfers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد عمليات نقل
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JudicialTracking;