-- Update RLS policies to allow admin access to all chat rooms

-- Drop existing policy and create new one for viewing chat rooms
DROP POLICY IF EXISTS "Users can view chat rooms in their department" ON chat_rooms;

CREATE POLICY "Users can view chat rooms in their department or admin can view all"
ON chat_rooms
FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = chat_rooms.department
  )
);

-- Update policy for chat room members
DROP POLICY IF EXISTS "Users can view members of rooms they can access" ON chat_room_members;

CREATE POLICY "Users can view members of rooms they can access or admin can view all"
ON chat_room_members
FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM chat_rooms cr
    WHERE cr.id = chat_room_members.room_id
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = cr.department
    )
  )
);

-- Update insert policy for chat room members to allow admin
DROP POLICY IF EXISTS "Room creators can add members" ON chat_room_members;

CREATE POLICY "Room creators and admins can add members"
ON chat_room_members
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM chat_rooms cr
    WHERE cr.id = chat_room_members.room_id
    AND (cr.created_by = get_user_profile(auth.uid()) OR is_admin(auth.uid()))
  )
);

-- Update delete policy for chat room members to allow admin
DROP POLICY IF EXISTS "Room creators and members themselves can remove members" ON chat_room_members;

CREATE POLICY "Room creators, admins, and members themselves can remove members"
ON chat_room_members
FOR DELETE
TO authenticated
USING (
  is_admin(auth.uid()) OR
  user_id = get_user_profile(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM chat_rooms cr
    WHERE cr.id = chat_room_members.room_id
    AND (cr.created_by = get_user_profile(auth.uid()) OR is_admin(auth.uid()))
  )
);

-- Update policy for creating chat rooms to allow admin in any department
DROP POLICY IF EXISTS "Users can create chat rooms in their department" ON chat_rooms;

CREATE POLICY "Users can create chat rooms in their department or admin can create in any"
ON chat_rooms
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) OR
  (
    created_by = get_user_profile(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = chat_rooms.department
    )
  )
);

-- Update policy for updating chat rooms
DROP POLICY IF EXISTS "Room creators and admins can update chat rooms" ON chat_rooms;

CREATE POLICY "Room creators and admins can update chat rooms"
ON chat_rooms
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid()) OR
  created_by = get_user_profile(auth.uid())
);

-- Update policy for deleting chat rooms
DROP POLICY IF EXISTS "Room creators and admins can delete chat rooms" ON chat_rooms;

CREATE POLICY "Room creators and admins can delete chat rooms"
ON chat_rooms
FOR DELETE
TO authenticated
USING (
  is_admin(auth.uid()) OR
  created_by = get_user_profile(auth.uid())
);