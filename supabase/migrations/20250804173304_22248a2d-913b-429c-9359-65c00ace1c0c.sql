-- Add missing foreign key constraint for patrol_tracking
ALTER TABLE public.patrol_tracking 
ADD CONSTRAINT fk_patrol_tracking_officer_id 
FOREIGN KEY (officer_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;