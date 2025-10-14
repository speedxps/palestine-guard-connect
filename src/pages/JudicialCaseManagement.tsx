import React, { useState, useEffect } from 'react';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Scale, Plus, Send, FileText } from 'lucide-react';

const JudicialCaseManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    case_number: '',
    title: '',
    case_type: '',
    description: '',
    notes: '',
    parties: { plaintiff: '', defendant: '' }
  });

  const loadCases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('judicial_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
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
    loadCases();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const { error } = await supabase
        .from('judicial_cases')
        .insert({
          ...formData,
          created_by: profile?.id
        });

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        activity_type: 'judicial_case_created',
        activity_description: `تم إنشاء قضية جديدة: ${formData.case_number}`,
        metadata: { case_number: formData.case_number }
      });

      toast({
        title: 'تم الحفظ',
        description: 'تم إنشاء القضية بنجاح'
      });

      setDialogOpen(false);
      setFormData({
        case_number: '',
        title: '',
        case_type: '',
        description: '',
        notes: '',
        parties: { plaintiff: '', defendant: '' }
      });
      loadCases();
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

  const sendToCourt = async (caseId: string, caseNumber: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      // Update case status
      await supabase
        .from('judicial_cases')
        .update({ status: 'sent_to_court' })
        .eq('id', caseId);

      // Create transfer record
      await supabase
        .from('judicial_transfers')
        .insert({
          case_id: caseId,
          from_department: 'judicial_police',
          to_department: 'court',
          transfer_type: 'case_referral',
          transferred_by: profile?.id,
          digital_signature: `sig_${Date.now()}`
        });

      // Log activity
      await supabase.from('activity_logs').insert({
        activity_type: 'case_sent_to_court',
        activity_description: `تم إرسال القضية ${caseNumber} إلى المحكمة`,
        metadata: { case_id: caseId }
      });

      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال القضية إلى المحكمة بنجاح'
      });

      loadCases();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const sendToProsecution = async (caseId: string, caseNumber: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      await supabase
        .from('judicial_cases')
        .update({ status: 'sent_to_prosecution' })
        .eq('id', caseId);

      await supabase
        .from('judicial_transfers')
        .insert({
          case_id: caseId,
          from_department: 'judicial_police',
          to_department: 'prosecution',
          transfer_type: 'case_referral',
          transferred_by: profile?.id,
          digital_signature: `sig_${Date.now()}`
        });

      await supabase.from('activity_logs').insert({
        activity_type: 'case_sent_to_prosecution',
        activity_description: `تم إرسال القضية ${caseNumber} إلى النيابة`,
        metadata: { case_id: caseId }
      });

      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال القضية إلى النيابة العامة بنجاح'
      });

      loadCases();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: any = {
      open: 'bg-blue-500',
      under_investigation: 'bg-yellow-500',
      sent_to_court: 'bg-purple-500',
      sent_to_prosecution: 'bg-orange-500',
      closed: 'bg-gray-500'
    };

    const statusLabels: any = {
      open: 'مفتوحة',
      under_investigation: 'قيد التحقيق',
      sent_to_court: 'محالة للمحكمة',
      sent_to_prosecution: 'محالة للنيابة',
      closed: 'مغلقة'
    };

    return (
      <Badge className={statusColors[status]}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">إدارة القضايا القضائية</h1>
          </div>
          <div />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>القضايا القضائية</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة قضية جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إنشاء قضية قضائية جديدة</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>رقم القضية</Label>
                      <Input
                        value={formData.case_number}
                        onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>نوع القضية</Label>
                      <Input
                        value={formData.case_type}
                        onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>عنوان القضية</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>المدعي</Label>
                      <Input
                        value={formData.parties.plaintiff}
                        onChange={(e) => setFormData({
                          ...formData,
                          parties: { ...formData.parties, plaintiff: e.target.value }
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label>المدعى عليه</Label>
                      <Input
                        value={formData.parties.defendant}
                        onChange={(e) => setFormData({
                          ...formData,
                          parties: { ...formData.parties, defendant: e.target.value }
                        })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>الوصف</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label>ملاحظات</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={loading}>
                      حفظ
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم القضية</TableHead>
                  <TableHead>العنوان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">{caseItem.case_number}</TableCell>
                    <TableCell>{caseItem.title}</TableCell>
                    <TableCell>{caseItem.case_type}</TableCell>
                    <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                    <TableCell>{new Date(caseItem.created_at).toLocaleDateString('ar')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {caseItem.status === 'open' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendToCourt(caseItem.id, caseItem.case_number)}
                            >
                              <Send className="h-4 w-4 ml-2" />
                              إرسال للمحكمة
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendToProsecution(caseItem.id, caseItem.case_number)}
                            >
                              <Send className="h-4 w-4 ml-2" />
                              إرسال للنيابة
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JudicialCaseManagement;