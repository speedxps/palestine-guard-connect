import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";

interface Ticket {
  id: string;
  section: string;
  action_type: string;
  description: string;
  user_name: string;
  created_at: string;
  metadata?: any;
}

export default function Tickets() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    
    fetchTickets();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTicket = async (ticketId: string) => {
    setConfirmingIds(prev => new Set(prev).add(ticketId));
    
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "تم التأكيد",
        description: "تم حذف السجل بنجاح",
      });
    } catch (error) {
      console.error('Error confirming ticket:', error);
      toast({
        title: "خطأ",
        description: "فشل حذف السجل",
        variant: "destructive",
      });
    } finally {
      setConfirmingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticketId);
        return newSet;
      });
    }
  };

  const getActionTypeColor = (actionType: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-500/10 text-green-500',
      update: 'bg-blue-500/10 text-blue-500',
      delete: 'bg-red-500/10 text-red-500',
      view: 'bg-gray-500/10 text-gray-500',
    };
    return colors[actionType] || 'bg-gray-500/10 text-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">السجل الحديث</h1>
          <p className="text-muted-foreground">آخر الإجراءات والتعديلات</p>
        </div>
      </div>

      <div className="grid gap-4">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">لا توجد سجلات حديثة</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{ticket.description}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>بواسطة: {ticket.user_name}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(ticket.created_at), 'PPp', { locale: ar })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getActionTypeColor(ticket.action_type)}>
                      {ticket.action_type}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleConfirmTicket(ticket.id)}
                      disabled={confirmingIds.has(ticket.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {confirmingIds.has(ticket.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 ml-1" />
                          تم التأكيد
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
