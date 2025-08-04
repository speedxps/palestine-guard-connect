import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Clock, 
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface CybercrimeReport {
  id: string;
  crime_type: string;
  description: string;
  status: string;
  platform: string;
  evidence_files: string[];
  created_at: string;
  updated_at: string;
  reporter_id: string;
  assigned_to?: string;
}

const CybercrimeReports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<CybercrimeReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<CybercrimeReport[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, filterStatus, searchQuery]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('cybercrime_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل التقارير",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(report => 
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.crime_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return CheckCircle;
      case 'in_progress':
        return Clock;
      case 'new':
        return AlertTriangle;
      default:
        return XCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCrimeTypeDisplayName = (crimeType: string) => {
    const crimeTypeMap: { [key: string]: string } = {
      'harassment': 'ابتزاز ومضايقة',
      'fraud': 'احتيال إلكتروني',
      'phishing': 'صيد إلكتروني',
      'identity_theft': 'سرقة هوية',
      'other': 'أخرى'
    };
    return crimeTypeMap[crimeType] || crimeType;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'جديدة';
      case 'in_progress':
        return 'قيد المعالجة';
      case 'resolved':
        return 'محلولة';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل التقارير...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/cybercrime')}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-arabic">تقارير الجرائم الإلكترونية</h1>
            <p className="text-sm text-muted-foreground">Cybercrime Reports - Hebron</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <Badge variant="destructive" className="text-xs">
            محافظة الخليل - سري
          </Badge>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-4">
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 font-arabic"
              placeholder="البحث في التقارير..."
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التقارير</SelectItem>
              <SelectItem value="new">جديدة</SelectItem>
              <SelectItem value="in_progress">قيد المعالجة</SelectItem>
              <SelectItem value="resolved">محلولة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-primary">
              {reports.filter(r => r.status === 'new').length}
            </div>
            <div className="text-xs text-muted-foreground">جديدة</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-warning">
              {reports.filter(r => r.status === 'in_progress').length}
            </div>
            <div className="text-xs text-muted-foreground">قيد المعالجة</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-success">
              {reports.filter(r => r.status === 'resolved').length}
            </div>
            <div className="text-xs text-muted-foreground">محلولة</div>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const StatusIcon = getStatusIcon(report.status);
            
            return (
              <Card key={report.id} className="glass-card p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Badge variant="outline" className="font-arabic">
                        {getCrimeTypeDisplayName(report.crime_type)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${
                          report.status === 'resolved' ? 'text-green-400' :
                          report.status === 'in_progress' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`} />
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusText(report.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-left">
                      {formatDate(report.created_at)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {report.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{report.platform}</span>
                      </div>
                      {report.evidence_files && report.evidence_files.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{report.evidence_files.length} ملف</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد تقارير مطابقة للتصفية</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CybercrimeReports;