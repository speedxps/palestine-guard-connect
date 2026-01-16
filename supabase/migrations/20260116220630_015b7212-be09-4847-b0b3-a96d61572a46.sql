-- Fix post_comments RLS policy to require authentication
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON public.post_comments;

CREATE POLICY "Authenticated users can view comments on visible posts" 
ON public.post_comments
FOR SELECT USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_comments.post_id
    AND (
      CASE 
        WHEN posts.privacy_level = 'public' THEN true
        WHEN posts.privacy_level = 'admin_only' THEN public.is_admin(auth.uid())
        WHEN posts.privacy_level = 'specific_groups' THEN (
          public.is_admin(auth.uid()) OR 
          public.get_current_user_role() = ANY(posts.target_groups)
        )
        ELSE false
      END
    )
  )
);