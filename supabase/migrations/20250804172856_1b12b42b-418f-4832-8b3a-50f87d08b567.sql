-- Remove the sensitive case mentioned
DELETE FROM cybercrime_reports 
WHERE description LIKE '%ابتزاز جنسي%' AND description LIKE '%دورا%';

-- Create posts table for the news feed system
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  privacy_level TEXT NOT NULL DEFAULT 'public' CHECK (privacy_level IN ('public', 'admin_only', 'specific_groups')),
  target_groups TEXT[], -- for specific groups targeting
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_comments table
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_likes table
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create cybercrime_comments table for case discussions
CREATE TABLE public.cybercrime_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT CHECK (attachment_type IN ('image', 'voice', 'file')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cybercrime_followers table to track who's following cases
CREATE TABLE public.cybercrime_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(report_id, user_id)
);

-- Create duty_chat_messages table for group communication
CREATE TABLE public.duty_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  duty_id TEXT NOT NULL, -- reference to duty name/identifier
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT CHECK (attachment_type IN ('image', 'voice', 'file')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cybercrime_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cybercrime_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_chat_messages ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Users can view posts based on privacy" ON public.posts
FOR SELECT USING (
  CASE 
    WHEN privacy_level = 'public' THEN true
    WHEN privacy_level = 'admin_only' THEN is_admin(auth.uid())
    WHEN privacy_level = 'specific_groups' THEN (
      is_admin(auth.uid()) OR 
      get_current_user_role() = ANY(target_groups)
    )
    ELSE false
  END
);

CREATE POLICY "Users can create their own posts" ON public.posts
FOR INSERT WITH CHECK (user_id = get_user_profile(auth.uid()));

CREATE POLICY "Users can update their own posts" ON public.posts
FOR UPDATE USING (user_id = get_user_profile(auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own posts or admins can delete any" ON public.posts
FOR DELETE USING (user_id = get_user_profile(auth.uid()) OR is_admin(auth.uid()));

-- Post comments policies
CREATE POLICY "Users can view comments on visible posts" ON public.post_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_comments.post_id
    AND (
      CASE 
        WHEN posts.privacy_level = 'public' THEN true
        WHEN posts.privacy_level = 'admin_only' THEN is_admin(auth.uid())
        WHEN posts.privacy_level = 'specific_groups' THEN (
          is_admin(auth.uid()) OR 
          get_current_user_role() = ANY(posts.target_groups)
        )
        ELSE false
      END
    )
  )
);

CREATE POLICY "Users can create comments" ON public.post_comments
FOR INSERT WITH CHECK (user_id = get_user_profile(auth.uid()));

-- Post likes policies
CREATE POLICY "Users can view likes on visible posts" ON public.post_likes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_likes.post_id
    AND (
      CASE 
        WHEN posts.privacy_level = 'public' THEN true
        WHEN posts.privacy_level = 'admin_only' THEN is_admin(auth.uid())
        WHEN posts.privacy_level = 'specific_groups' THEN (
          is_admin(auth.uid()) OR 
          get_current_user_role() = ANY(posts.target_groups)
        )
        ELSE false
      END
    )
  )
);

CREATE POLICY "Users can like posts" ON public.post_likes
FOR INSERT WITH CHECK (user_id = get_user_profile(auth.uid()));

CREATE POLICY "Users can unlike posts" ON public.post_likes
FOR DELETE USING (user_id = get_user_profile(auth.uid()));

-- Cybercrime comments policies
CREATE POLICY "Users can view comments on cases they can access" ON public.cybercrime_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.cybercrime_reports 
    WHERE cybercrime_reports.id = cybercrime_comments.report_id
    AND (
      cybercrime_reports.reporter_id = get_user_profile(auth.uid()) OR 
      cybercrime_reports.assigned_to = get_user_profile(auth.uid()) OR 
      is_admin(auth.uid()) OR
      has_cybercrime_access(auth.uid())
    )
  )
);

CREATE POLICY "Users can create comments on cases they can access" ON public.cybercrime_comments
FOR INSERT WITH CHECK (
  user_id = get_user_profile(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.cybercrime_reports 
    WHERE cybercrime_reports.id = cybercrime_comments.report_id
    AND (
      cybercrime_reports.reporter_id = get_user_profile(auth.uid()) OR 
      cybercrime_reports.assigned_to = get_user_profile(auth.uid()) OR 
      is_admin(auth.uid()) OR
      has_cybercrime_access(auth.uid())
    )
  )
);

-- Cybercrime followers policies
CREATE POLICY "Users can view followers of cases they can access" ON public.cybercrime_followers
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.cybercrime_reports 
    WHERE cybercrime_reports.id = cybercrime_followers.report_id
    AND (
      cybercrime_reports.reporter_id = get_user_profile(auth.uid()) OR 
      cybercrime_reports.assigned_to = get_user_profile(auth.uid()) OR 
      is_admin(auth.uid()) OR
      has_cybercrime_access(auth.uid())
    )
  )
);

CREATE POLICY "Users can follow cases they can access" ON public.cybercrime_followers
FOR INSERT WITH CHECK (
  user_id = get_user_profile(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.cybercrime_reports 
    WHERE cybercrime_reports.id = cybercrime_followers.report_id
    AND (
      cybercrime_reports.reporter_id = get_user_profile(auth.uid()) OR 
      cybercrime_reports.assigned_to = get_user_profile(auth.uid()) OR 
      is_admin(auth.uid()) OR
      has_cybercrime_access(auth.uid())
    )
  )
);

-- Duty chat messages policies
CREATE POLICY "Users can view duty chat messages" ON public.duty_chat_messages
FOR SELECT USING (true); -- All authenticated users can see duty chats

CREATE POLICY "Users can send duty chat messages" ON public.duty_chat_messages
FOR INSERT WITH CHECK (user_id = get_user_profile(auth.uid()));

-- Add updated_at triggers
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraints
ALTER TABLE public.post_comments 
ADD CONSTRAINT fk_post_comments_post_id 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.post_likes 
ADD CONSTRAINT fk_post_likes_post_id 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.cybercrime_comments 
ADD CONSTRAINT fk_cybercrime_comments_report_id 
FOREIGN KEY (report_id) REFERENCES public.cybercrime_reports(id) ON DELETE CASCADE;

ALTER TABLE public.cybercrime_followers 
ADD CONSTRAINT fk_cybercrime_followers_report_id 
FOREIGN KEY (report_id) REFERENCES public.cybercrime_reports(id) ON DELETE CASCADE;