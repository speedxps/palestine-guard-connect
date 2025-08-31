-- Remove existing foreign key constraints that reference a non-existent users table
-- and update the tables to properly reference the profiles table

-- First, let's check and fix the post_likes table
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS fk_post_likes_user_id;
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;

-- Update the user_id column to reference profiles.id instead
ALTER TABLE post_likes 
ADD CONSTRAINT fk_post_likes_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Same for post_comments table
ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS fk_post_comments_user_id;
ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;

ALTER TABLE post_comments 
ADD CONSTRAINT fk_post_comments_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Also fix the posts table if needed
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_user_id;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

ALTER TABLE posts 
ADD CONSTRAINT fk_posts_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;