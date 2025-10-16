import React, { useState } from 'react';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Microscope, Plus, Search, FileText, Upload } from 'lucide-react';

const ForensicLabs = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [evidence, setEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    case_id: '',
    evidence_type: '',
    description: '',
    file_url: '',
    analysis_report: ''
  });

  const loadEvidence = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const { data, error } = await supabase
        .from('forensic_evidence')
        .select('*, incidents(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvidence(data || []);
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

  React.useEffect(() => {
    loadEvidence();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.evidence_type || !formData.description) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.id) throw new Error('Profile not found');

      const { error } = await supabase
        .from('forensic_evidence')
        .insert({
          case_id: formData.case_id || null,
          evidence_type: formData.evidence_type as any,
          description: formData.description,
          file_url: formData.file_url || null,
          analysis_report: formData.analysis_report || null,
          collected_by: profile.id,
          collection_date: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'تم الحفظ',
        description: 'تم إضافة الأدلة الجنائية بنجاح'
      });

      setDialogOpen(false);
      setFormData({
        case_id: '',
        evidence_type: '',
        description: '',
        file_url: '',
        analysis_report: ''
      });
      loadEvidence();
    } catch (error: any) {
      console.error('Error submitting evidence:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إضافة الأدلة الجنائية',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEvidence = evidence.filter(item =>
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.evidence_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3">
            <Microscope className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">المختبرات والأدلة الجنائية</h1>
          </div>
          <div />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>إدارة الأدلة الجنائية</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة دليل جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إضافة دليل جنائي جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>نوع الدليل</Label>
                    <Select
                      value={formData.evidence_type}
                      onValueChange={(value) => setFormData({ ...formData, evidence_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الدليل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dna">DNA</SelectItem>
                        <SelectItem value="fingerprint">بصمة</SelectItem>
                        <SelectItem value="photo">صورة</SelectItem>
                        <SelectItem value="document">مستند</SelectItem>
                        <SelectItem value="video">فيديو</SelectItem>
                        <SelectItem value="audio">صوت</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>الوصف</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>رابط الملف</Label>
                    <Input
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label>تقرير التحليل</Label>
                    <Textarea
                      value={formData.analysis_report}
                      onChange={(e) => setFormData({ ...formData, analysis_report: e.target.value })}
                      rows={4}
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
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الأدلة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نوع الدليل</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>تاريخ الجمع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvidence.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.evidence_type}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{new Date(item.collection_date).toLocaleDateString('ar')}</TableCell>
                    <TableCell>
                      {item.is_verified ? (
                        <span className="text-green-600">موثق</span>
                      ) : (
                        <span className="text-yellow-600">قيد المراجعة</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 ml-2" />
                        عرض التفاصيل
                      </Button>
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

export default ForensicLabs;