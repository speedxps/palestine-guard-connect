import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    requestedBy: '',
    reason: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('password_resets')
        .insert({
          email: formData.email,
          requested_by: formData.requestedBy,
          reason: formData.reason,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "تم إرسال الطلب",
        description: "تم إرسال طلب إعادة تعيين كلمة المرور للإدارة للمراجعة",
      });

      setFormData({ email: '', requestedBy: '', reason: '' });
      onClose();
    } catch (error: any) {
      console.error('Error submitting password reset request:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في إرسال الطلب",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">استرداد كلمة المرور</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              البريد الإلكتروني / Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary"
                placeholder="البريد الإلكتروني المسجل"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              اسم مقدم الطلب / Requested by
            </label>
            <Input
              type="text"
              value={formData.requestedBy}
              onChange={(e) => updateFormData('requestedBy', e.target.value)}
              className="h-12 bg-background/50 border-border/50 focus:border-primary"
              placeholder="الاسم الكامل"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              سبب الطلب / Reason
            </label>
            <Textarea
              value={formData.reason}
              onChange={(e) => updateFormData('reason', e.target.value)}
              className="min-h-[80px] bg-background/50 border-border/50 focus:border-primary"
              placeholder="اذكر سبب طلب إعادة تعيين كلمة المرور"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="police"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </Button>
          </div>
        </form>
        
        <div className="text-center text-xs text-muted-foreground mt-4">
          <p>سيتم مراجعة طلبك من قبل الإدارة خلال 24-48 ساعة</p>
          <p>Your request will be reviewed by admin within 24-48 hours</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;