import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { BackButton } from '@/components/BackButton';
import { Scale, Search, Plus, Eye, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const JudicialCaseSearch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    case_number: '',
    title: '',
    case_type: '',
    description: '',
    notes: '',
    national_id: '',
    parties: { plaintiff: '', defendant: '' }
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('يرجى إدخال رقم القضية أو رقم الهوية للبحث');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('judicial_cases')
        .select('*')
        .or(`case_number.ilike.%${searchQuery}%,national_id.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        toast.info('لم يتم العثور على نتائج');
      } else {
        toast.success(`تم العثور على ${data.length} نتيجة`);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate national ID
      if (!formData.national_id || formData.national_id.trim().length === 0) {
        toast.error('يرجى إدخال رقم الهوية الوطنية');
        setLoading(false);
        return;
      }

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
        metadata: { 
          case_number: formData.case_number,
          national_id: formData.national_id
        }
      });

      toast.success('تم إنشاء القضية بنجاح');
      setDialogOpen(false);
      setFormData({
        case_number: '',
        title: '',
        case_type: '',
        description: '',
        notes: '',
        national_id: '',
        parties: { plaintiff: '', defendant: '' }
      });
      
      // Refresh search if there's a query
      if (searchQuery) {
        handleSearch();
      }
    } catch (error: any) {
      console.error('Create case error:', error);
      toast.error('حدث خطأ أثناء إنشاء القضية');
    } finally {
      setLoading(false);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <BackButton to="/department/judicial-police" />
            
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-primary" />
              <h1 className="text-xl md:text-2xl font-bold">البحث عن القضايا القضائية</h1>
            </div>

            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Search Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-6 w-6" />
              بحث عن قضية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">رقم القضية أو رقم الهوية الوطنية</Label>
                <Input
                  id="search"
                  placeholder="ابحث برقم القضية أو رقم الهوية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} disabled={loading} size="lg">
                  <Search className="h-5 w-5 ml-2" />
                  بحث
                </Button>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg">
                      <Plus className="h-5 w-5 ml-2" />
                      قضية جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Scale className="h-6 w-6" />
                        إنشاء قضية قضائية جديدة
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="case_number">رقم القضية *</Label>
                          <Input
                            id="case_number"
                            value={formData.case_number}
                            onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="national_id">رقم الهوية الوطنية *</Label>
                          <Input
                            id="national_id"
                            value={formData.national_id}
                            onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                            placeholder="رقم الهوية الوطنية"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="case_type">نوع القضية *</Label>
                          <Input
                            id="case_type"
                            value={formData.case_type}
                            onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="title">عنوان القضية *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="plaintiff">المدعي *</Label>
                          <Input
                            id="plaintiff"
                            value={formData.parties.plaintiff}
                            onChange={(e) => setFormData({
                              ...formData,
                              parties: { ...formData.parties, plaintiff: e.target.value }
                            })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="defendant">المدعى عليه *</Label>
                          <Input
                            id="defendant"
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
                        <Label htmlFor="description">الوصف *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes">ملاحظات</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                          إلغاء
                        </Button>
                        <Button type="submit" disabled={loading}>
                          <FileText className="h-4 w-4 ml-2" />
                          حفظ القضية
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {searchResults.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>
                نتائج البحث ({searchResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResults.map((caseItem) => (
                  <Card
                    key={caseItem.id}
                    className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/50"
                    onClick={() => navigate(`/department/judicial-police/case-record/${caseItem.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-primary">
                              القضية رقم: {caseItem.case_number}
                            </h3>
                            {getStatusBadge(caseItem.status)}
                          </div>
                          <p className="text-lg font-semibold">{caseItem.title}</p>
                          {caseItem.national_id && (
                            <p className="text-sm text-muted-foreground">
                              رقم الهوية: {caseItem.national_id}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 ml-2" />
                          عرض التفاصيل
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">نوع القضية:</span>
                          <p className="font-semibold">{caseItem.case_type}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">المدعي:</span>
                          <p className="font-semibold">{caseItem.parties?.plaintiff || 'غير محدد'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">المدعى عليه:</span>
                          <p className="font-semibold">{caseItem.parties?.defendant || 'غير محدد'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                          <p className="font-semibold">
                            {new Date(caseItem.created_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>

                      {caseItem.description && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {caseItem.description}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && searchResults.length === 0 && searchQuery && (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد نتائج</h3>
              <p className="text-muted-foreground">
                لم يتم العثور على قضايا تطابق البحث "{searchQuery}"
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JudicialCaseSearch;
