import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, 
  MessageSquare, 
  Phone, 
  Mail,
  MapPin,
  Edit3
} from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import genericLogo from '@/assets/generic-police-logo.png';

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
  const [agencies, setAgencies] = useState<SecurityAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState<SecurityAgency | null>(null);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const { data, error } = await supabase
        .from('security_agencies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAgencies(data || []);
    } catch (error) {
      console.error('Error fetching agencies:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الأجهزة الأمنية',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !selectedAgency) return;

    const file = event.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedAgency.slug}-${Date.now()}.${fileExt}`;
      const filePath = `agency-logos/${fileName}`;

      // Use post-images bucket which is public
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('security_agencies')
        .update({ logo_url: publicUrl })
        .eq('id', selectedAgency.id);

      if (updateError) throw updateError;

      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث شعار الجهاز'
      });

      fetchAgencies();
      setLogoDialogOpen(false);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في رفع الشعار',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                التواصل مع الأجهزة الأمنية
              </h1>
            </div>
            <p className="text-muted-foreground text-lg mr-14">
              التنسيق والتواصل المباشر مع جميع الأجهزة الأمنية والعسكرية الفلسطينية
            </p>
          </div>
        </div>

        {/* Agencies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <Card
              key={agency.id}
              className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50"
            >
              <div className="p-6 space-y-4">
                {/* Logo Section */}
                <div className="flex items-start justify-between">
                  <div className="relative">
                    {agency.logo_url ? (
                      <div className="w-20 h-20 flex items-center justify-center">
                        <img 
                          src={agency.logo_url} 
                          alt={agency.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg overflow-hidden">
                        <img 
                          src={genericLogo} 
                          alt="شعار عام"
                          className="w-12 h-12 object-contain opacity-80"
                        />
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 shadow-lg"
                      onClick={() => {
                        setSelectedAgency(agency);
                        setLogoDialogOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Agency Info */}
                <div>
                  <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                    {agency.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {agency.name_en}
                  </p>
                  {agency.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {agency.description}
                    </p>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 pt-3 border-t">
                  {agency.contact_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{agency.contact_phone}</span>
                    </div>
                  )}
                  {agency.contact_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{agency.contact_email}</span>
                    </div>
                  )}
                  {agency.headquarters_address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{agency.headquarters_address}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/joint-ops/agency/${agency.slug}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    فتح التواصل
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Logo Upload Dialog */}
        <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>تغيير شعار الجهاز</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                {selectedAgency?.logo_url ? (
                  <img 
                    src={selectedAgency.logo_url} 
                    alt={selectedAgency.name}
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Shield className="h-16 w-16 text-white" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground">جاري الرفع...</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
