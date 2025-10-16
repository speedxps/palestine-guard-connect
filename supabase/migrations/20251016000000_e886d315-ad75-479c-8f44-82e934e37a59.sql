-- Create tickets table to track user actions across all sections
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
ON public.tickets
FOR SELECT
USING (is_admin(auth.uid()));

-- Users can view tickets from their section
CREATE POLICY "Users can view their section tickets"
ON public.tickets
FOR SELECT
USING (
  CASE section
    WHEN 'admin' THEN has_role(auth.uid(), 'admin')
    WHEN 'traffic' THEN has_role(auth.uid(), 'traffic_police') OR has_role(auth.uid(), 'admin')
    WHEN 'cid' THEN has_role(auth.uid(), 'cid') OR has_role(auth.uid(), 'admin')
    WHEN 'special_police' THEN has_role(auth.uid(), 'special_police') OR has_role(auth.uid(), 'admin')
    WHEN 'cybercrime' THEN has_role(auth.uid(), 'cybercrime') OR has_role(auth.uid(), 'admin') OR has_cybercrime_access(auth.uid())
    WHEN 'judicial_police' THEN has_role(auth.uid(), 'judicial_police') OR has_role(auth.uid(), 'admin')
    ELSE false
  END
);

-- System can insert tickets
CREATE POLICY "System can insert tickets"
ON public.tickets
FOR INSERT
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_tickets_section ON public.tickets(section);
CREATE INDEX idx_tickets_created_at ON public.tickets(created_at DESC);
CREATE INDEX idx_tickets_user_id ON public.tickets(user_id);