-- Fix foreign key constraint for posts table
-- The posts.user_id should reference auth.users.id directly since that's what we're using in the app

-- First, check if there's an existing foreign key constraint and drop it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_posts_user_id' 
        AND table_name = 'posts'
    ) THEN
        ALTER TABLE posts DROP CONSTRAINT fk_posts_user_id;
    END IF;
END $$;

-- Add the correct foreign key constraint to reference auth.users
ALTER TABLE posts 
ADD CONSTRAINT fk_posts_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Do the same for post_likes
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%post_likes_user_id%' 
        AND table_name = 'post_likes'
    ) THEN
        ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;
        ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS fk_post_likes_user_id;
    END IF;
END $$;

ALTER TABLE post_likes 
ADD CONSTRAINT fk_post_likes_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Do the same for post_comments
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%post_comments_user_id%' 
        AND table_name = 'post_comments'
    ) THEN
        ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;
        ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS fk_post_comments_user_id;
    END IF;
END $$;

ALTER TABLE post_comments 
ADD CONSTRAINT fk_post_comments_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;