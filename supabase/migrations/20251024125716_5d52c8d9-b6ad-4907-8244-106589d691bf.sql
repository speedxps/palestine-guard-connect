-- Create storage bucket for news images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news_images',
  'news_images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Allow public access to view images
CREATE POLICY "News images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'news_images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload news images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'news_images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update news images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'news_images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete news images
CREATE POLICY "Users can delete news images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'news_images' 
  AND auth.role() = 'authenticated'
);