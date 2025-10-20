import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BackButton } from '@/components/BackButton';
import { 
  Shield, 
  Upload, 
  Send, 
  Phone, 
  Mail,
  MapPin,
  Edit2,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SecurityAgency {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  headquarters_address: string | null;
  is_active: boolean;
}

export default function AgencyCommunications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAgency, setSelectedAgency] = useState<SecurityAgency | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messagePriority, setMessagePriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingAgency, setUploadingAgency] = useState<string | null>(null);

  // جلب الأجهزة الأمنية
  const { data: agencies, isLoading } = useQuery({
    queryKey: ['security-agencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_agencies')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as SecurityAgency[];
    }
  });

  // إرسال رسالة
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAgency) throw new Error('لم يتم اختيار جهاز');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('غير مصرح');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('لم يتم العثور على الملف الشخصي');

      const { error } = await supabase
        .from('agency_communications')
        .insert({
          agency_id: selectedAgency.id,
          sender_id: profile.id,
          subject: messageSubject,
          message: messageContent,
          priority: messagePriority
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: '✅ تم إرسال الرسالة',
        description: 'تم إرسال الرسالة بنجاح إلى ' + selectedAgency?.name
      });
      setMessageSubject('');
      setMessageContent('');
      setMessagePriority('normal');
      setSelectedAgency(null);
    },
    onError: (error: any) => {
      toast({
        title: '❌ خطأ',
        description: 'فشل إرسال الرسالة: ' + error.message,
        variant: 'destructive'
      });
    }
  });

  // رفع شعار
  const uploadLogoMutation = useMutation({
    mutationFn: async ({ agencyId, file }: { agencyId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${agencyId}-${Date.now()}.${fileExt}`;
      const filePath = `agency-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('security_agencies')
        .update({ logo_url: publicUrl })
        .eq('id', agencyId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast({
        title: '✅ تم رفع الشعار',
        description: 'تم تحديث شعار الجهاز بنجاح'
      });
      queryClient.invalidateQueries({ queryKey: ['security-agencies'] });
      setLogoUploadOpen(false);
      setSelectedFile(null);
      setUploadingAgency(null);
    },
    onError: (error: any) => {
      toast({
        title: '❌ خطأ',
        description: 'فشل رفع الشعار: ' + error.message,
        variant: 'destructive'
      });
    }
  });

  const handleLogoUpload = async (agencyId: string) => {
    if (!selectedFile) {
      toast({
        title: '⚠️ تنبيه',
        description: 'يرجى اختيار صورة أولاً',
        variant: 'destructive'
      });
      return;
    }

    uploadLogoMutation.mutate({ agencyId, file: selectedFile });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          <div className="text-center py-12">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                التواصل مع الأجهزة الأمنية
              </h1>
            </div>
            <p className="text-muted-foreground text-lg mr-14">
              إدارة التواصل والتنسيق مع جميع الأجهزة الأمنية الفلسطينية
            </p>
          </div>
        </div>

        {/* Agencies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies?.map((agency) => (
            <Card
              key={agency.id}
              className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {agency.logo_url ? (
                      <img
                        src={agency.logo_url}
                        alt={agency.name}
                        className="w-16 h-16 rounded-xl object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold">{agency.name}</h3>
                      <p className="text-sm text-muted-foreground">{agency.name_en}</p>
                    </div>
                  </div>
                  
                  <Dialog open={logoUploadOpen && uploadingAgency === agency.id} onOpenChange={(open) => {
                    setLogoUploadOpen(open);
                    if (!open) setUploadingAgency(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setUploadingAgency(agency.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>تغيير شعار {agency.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>اختر صورة الشعار</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          />
                        </div>
                        <Button
                          onClick={() => handleLogoUpload(agency.id)}
                          disabled={uploadLogoMutation.isPending || !selectedFile}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadLogoMutation.isPending ? 'جاري الرفع...' : 'رفع الشعار'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {agency.description && (
                  <p className="text-sm text-muted-foreground">{agency.description}</p>
                )}

                <div className="space-y-2 text-sm">
                  {agency.contact_phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{agency.contact_phone}</span>
                    </div>
                  )}
                  {agency.contact_email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{agency.contact_email}</span>
                    </div>
                  )}
                  {agency.headquarters_address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{agency.headquarters_address}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setSelectedAgency(agency)}
                  className="w-full"
                  variant="default"
                >
                  <Send className="h-4 w-4 mr-2" />
                  إرسال رسالة
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Send Message Dialog */}
        <Dialog open={!!selectedAgency} onOpenChange={(open) => !open && setSelectedAgency(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إرسال رسالة إلى {selectedAgency?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>الموضوع</Label>
                <Input
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="أدخل موضوع الرسالة"
                />
              </div>

              <div>
                <Label>الأولوية</Label>
                <Select value={messagePriority} onValueChange={(value: any) => setMessagePriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="normal">عادية</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الرسالة</Label>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="أدخل محتوى الرسالة"
                  rows={6}
                />
              </div>

              <Button
                onClick={() => sendMessageMutation.mutate()}
                disabled={sendMessageMutation.isPending || !messageSubject || !messageContent}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendMessageMutation.isPending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}