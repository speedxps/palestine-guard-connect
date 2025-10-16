import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{ticket.description}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>بواسطة: {ticket.user_name}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(ticket.created_at), 'PPp', { locale: ar })}
                      </span>
                    </div>
                  </div>
                  <Badge className={getActionTypeColor(ticket.action_type)}>
                    {ticket.action_type}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
