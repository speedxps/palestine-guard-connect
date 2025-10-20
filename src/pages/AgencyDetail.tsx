import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Send, 
  ArrowLeft,
  AlertCircle,
  FileText,
  Clock,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import genericLogo from '@/assets/generic-police-logo.png';

interface SecurityAgency {
  id: string;
  name: string;
  name_en: string;
  description: string | null;
  logo_url: string | null;
}

interface Communication {
  id: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
  sender_id: string;
  profiles: {
    full_name: string | null;
  } | null;
}

export default function AgencyDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [agency, setAgency] = useState<SecurityAgency | null>(null);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');

  useEffect(() => {
    if (slug) {
      fetchAgency();
      fetchCommunications();
    }
  }, [slug]);

  const fetchAgency = async () => {
    try {
      const { data, error } = await supabase
        .from('security_agencies')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setAgency(data);
    } catch (error) {
      console.error('Error fetching agency:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات الجهاز',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunications = async () => {
    try {
      const { data: agencyData } = await supabase
        .from('security_agencies')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!agencyData) return;

      const { data, error } = await supabase
        .from('agency_communications')
        .select(`
          *,
          profiles:sender_id (full_name)
        `)
        .eq('agency_id', agencyData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunications(data || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!agency || !subject.trim() || !message.trim()) {
      toast({
        title: 'تنبيه',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('agency_communications')
        .insert({
          agency_id: agency.id,
          sender_id: profile.id,
          subject,
          message,
          priority
        });

      if (error) throw error;

      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال الرسالة بنجاح'
      });

      setSubject('');
      setMessage('');
      setPriority('normal');
      fetchCommunications();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال الرسالة',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'عاجل جداً';
      case 'high': return 'عالية';
      case 'normal': return 'عادية';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">الجهاز غير موجود</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg overflow-hidden">
              {agency.logo_url ? (
                <img 
                  src={agency.logo_url} 
                  alt={agency.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={genericLogo} 
                  alt="شعار عام"
                  className="w-10 h-10 object-contain opacity-80"
                />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{agency.name}</h1>
              <p className="text-muted-foreground">{agency.name_en}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Message Form */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              إرسال رسالة جديدة
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">الموضوع</label>
                <Input
                  placeholder="موضوع الرسالة"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">الأولوية</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="normal">عادية</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجل جداً</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">الرسالة</label>
                <Textarea
                  placeholder="اكتب رسالتك هنا..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                />
              </div>

              <Button 
                onClick={handleSendMessage}
                disabled={sending}
                className="w-full"
              >
                {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </Button>
            </div>
          </Card>

          {/* Communications History */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              سجل المراسلات ({communications.length})
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {communications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد مراسلات سابقة
                </p>
              ) : (
                communications.map((comm) => (
                  <Card key={comm.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{comm.subject}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(comm.priority)}`}>
                        {getPriorityLabel(comm.priority)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {comm.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {comm.profiles?.full_name || 'مستخدم'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(comm.created_at).toLocaleDateString('ar-PS')}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
