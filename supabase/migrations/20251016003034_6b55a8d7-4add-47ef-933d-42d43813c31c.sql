-- Create chat rooms table for department-specific chat groups
CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  department app_role NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

-- Create chat room members table
CREATE TABLE public.chat_room_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create department chat messages table
CREATE TABLE public.department_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view chat rooms in their department"
ON public.chat_rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = chat_rooms.department
  )
);

CREATE POLICY "Users can create chat rooms in their department"
ON public.chat_rooms FOR INSERT
WITH CHECK (
  created_by = get_user_profile(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = chat_rooms.department
  )
);

CREATE POLICY "Room creators and admins can update chat rooms"
ON public.chat_rooms FOR UPDATE
USING (
  created_by = get_user_profile(auth.uid())
  OR is_admin(auth.uid())
);

CREATE POLICY "Room creators and admins can delete chat rooms"
ON public.chat_rooms FOR DELETE
USING (
  created_by = get_user_profile(auth.uid())
  OR is_admin(auth.uid())
);

-- RLS Policies for chat_room_members
CREATE POLICY "Users can view members of rooms they can access"
ON public.chat_room_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    WHERE cr.id = chat_room_members.room_id
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = cr.department
    )
  )
);

CREATE POLICY "Room creators can add members"
ON public.chat_room_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    WHERE cr.id = chat_room_members.room_id
    AND (cr.created_by = get_user_profile(auth.uid()) OR is_admin(auth.uid()))
  )
);

CREATE POLICY "Room creators and members themselves can remove members"
ON public.chat_room_members FOR DELETE
USING (
  user_id = get_user_profile(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.chat_rooms cr
    WHERE cr.id = chat_room_members.room_id
    AND (cr.created_by = get_user_profile(auth.uid()) OR is_admin(auth.uid()))
  )
);

-- RLS Policies for department_chat_messages
CREATE POLICY "Users can view messages in rooms they are members of"
ON public.department_chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_room_members crm
    WHERE crm.room_id = department_chat_messages.room_id
    AND crm.user_id = get_user_profile(auth.uid())
  )
  OR is_admin(auth.uid())
);

CREATE POLICY "Room members can send messages"
ON public.department_chat_messages FOR INSERT
WITH CHECK (
  sender_id = get_user_profile(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.chat_room_members crm
    WHERE crm.room_id = department_chat_messages.room_id
    AND crm.user_id = get_user_profile(auth.uid())
  )
);

CREATE POLICY "Message senders can update their messages"
ON public.department_chat_messages FOR UPDATE
USING (sender_id = get_user_profile(auth.uid()));

CREATE POLICY "Message senders and admins can delete messages"
ON public.department_chat_messages FOR DELETE
USING (
  sender_id = get_user_profile(auth.uid())
  OR is_admin(auth.uid())
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.department_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_members;

-- Create indexes for performance
CREATE INDEX idx_chat_rooms_department ON public.chat_rooms(department);
CREATE INDEX idx_chat_room_members_room_id ON public.chat_room_members(room_id);
CREATE INDEX idx_chat_room_members_user_id ON public.chat_room_members(user_id);
CREATE INDEX idx_department_chat_messages_room_id ON public.department_chat_messages(room_id);
CREATE INDEX idx_department_chat_messages_created_at ON public.department_chat_messages(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_chat_rooms_updated_at
BEFORE UPDATE ON public.chat_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_department_chat_messages_updated_at
BEFORE UPDATE ON public.department_chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();