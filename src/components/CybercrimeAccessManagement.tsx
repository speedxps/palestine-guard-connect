import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, UserPlus, UserMinus, Search, Mail, User } from 'lucide-react';

interface CyberOfficer {
  id: string;
  user_id: string;
  granted_by: string;
  created_at: string;
  is_active: boolean;
  user_email?: string;
  user_name?: string;
}

export const CybercrimeAccessManagement = () => {
  const [officers, setOfficers] = useState<CyberOfficer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCyberOfficers();
  }, []);

  const fetchCyberOfficers = async () => {
    try {
      const { data, error } = await supabase
        .from('cybercrime_access')
        .select('*');

      if (error) throw error;

      // Get user emails and profile info
      const enrichedData: CyberOfficer[] = [];
      
      if (data && data.length > 0) {
        for (const item of data) {
          // Get profile info
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('user_id', item.user_id)
            .single();

          // Get user email (you might need admin privileges for this)
          let userEmail = 'Unknown';
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(item.user_id);
            userEmail = userData.user?.email || 'Unknown';
          } catch (emailError) {
            console.warn('Could not fetch user email:', emailError);
          }

          enrichedData.push({
            ...item,
            user_email: userEmail,
            user_name: profile?.full_name || profile?.username || 'Unknown'
          });
        }
      }
      
      setOfficers(enrichedData);
    } catch (error) {
      console.error('Error fetching cyber officers:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل قائمة ضباط الجرائم الإلكترونية",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const grantAccess = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال البريد الإلكتروني",
        variant: "destructive",
      });
      return;
    }

    setIsGranting(true);
    try {
      // Instead of using admin.listUsers, search for the user by email in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username')
        .eq('username', searchEmail.trim())
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (!profileData) {
        toast({
          title: "مستخدم غير موجود",
          description: "لم يتم العثور على مستخدم بهذا البريد الإلكتروني",
          variant: "destructive",
        });
        return;
      }

      const userId = profileData.user_id;

      // Check if access already exists
      const { data: existingAccess, error: checkError } = await supabase
        .from('cybercrime_access')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw checkError;
      }

      if (existingAccess) {
        if (existingAccess.is_active) {
          toast({
            title: "تحذير",
            description: "المستخدم يملك صلاحية وصول فعالة بالفعل",
            variant: "destructive",
          });
          return;
        } else {
          // Reactivate existing access
          const { error: updateError } = await supabase
            .from('cybercrime_access')
            .update({ is_active: true })
            .eq('user_id', userId);

          if (updateError) throw updateError;
        }
      } else {
        // Grant new access
        const { data: currentUser } = await supabase.auth.getUser();
        
        const { error: insertError } = await supabase
          .from('cybercrime_access')
          .insert({
            user_id: userId,
            granted_by: currentUser.user?.id || '',
            is_active: true
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "تم منح الصلاحية",
        description: `تم منح صلاحية الوصول لدائرة الجرائم الإلكترونية للمستخدم ${searchEmail}`,
      });

      setSearchEmail('');
      setShowGrantDialog(false);
      fetchCyberOfficers();
    } catch (error: any) {
      console.error('Error granting access:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في منح صلاحية الوصول",
        variant: "destructive",
      });
    } finally {
      setIsGranting(false);
    }
  };

  const revokeAccess = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase
        .from('cybercrime_access')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم إلغاء الصلاحية",
        description: `تم إلغاء صلاحية الوصول للمستخدم ${userEmail}`,
      });

      fetchCyberOfficers();
    } catch (error: any) {
      console.error('Error revoking access:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في إلغاء صلاحية الوصول",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold font-arabic">إدارة صلاحيات الجرائم الإلكترونية</h2>
        </div>
        
        <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              منح صلاحية
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>منح صلاحية الوصول لدائرة الجرائم الإلكترونية</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم المستخدم أو البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="pl-10"
                    placeholder="username أو user@example.com"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowGrantDialog(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={grantAccess}
                  disabled={isGranting}
                  className="flex-1"
                >
                  {isGranting ? 'جاري المنح...' : 'منح الصلاحية'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="text-center text-sm text-muted-foreground mb-4">
          إجمالي الضباط المعتمدين: {officers.filter(o => o.is_active).length}
        </div>
      </Card>

      <div className="grid gap-4">
        {officers.map((officer) => (
          <Card key={officer.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <User className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="font-semibold">{officer.user_name}</div>
                  <div className="text-sm text-muted-foreground">{officer.user_email}</div>
                  <div className="text-xs text-muted-foreground">
                    تم منح الصلاحية في: {formatDate(officer.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {officer.is_active ? (
                  <>
                    <Badge variant="default" className="bg-success text-success-foreground">
                      نشط
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => revokeAccess(officer.user_id, officer.user_email || '')}
                    >
                      <UserMinus className="h-4 w-4 mr-1" />
                      إلغاء
                    </Button>
                  </>
                ) : (
                  <Badge variant="secondary">
                    معطل
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {officers.length === 0 && (
          <Card className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد صلاحيات ممنوحة حالياً</p>
          </Card>
        )}
      </div>
    </div>
  );
};