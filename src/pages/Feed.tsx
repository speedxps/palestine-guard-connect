import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Heart, MessageCircle, Share2, MoreHorizontal, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Feed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [newPostPrivacy, setNewPostPrivacy] = useState('public');
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // First get posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get profiles for each post
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, username, role')
            .eq('user_id', post.user_id)
            .single();

          const { data: likesData } = await supabase
            .from('post_likes')
            .select('id, user_id')
            .eq('post_id', post.id);

          const { data: commentsData } = await supabase
            .from('post_comments')
            .select('*')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });

          // Get profiles for comments
          const commentsWithProfiles = await Promise.all(
            (commentsData || []).map(async (comment) => {
              const { data: commentProfileData } = await supabase
                .from('profiles')
                .select('full_name, username')
                .eq('user_id', comment.user_id)
                .single();

              return {
                ...comment,
                profiles: commentProfileData || { full_name: 'مستخدم مجهول', username: 'unknown' }
              };
            })
          );

          return {
            ...post,
            profiles: profileData || { full_name: 'مستخدم مجهول', username: 'unknown', role: 'user' },
            post_likes: likesData || [],
            post_comments: commentsWithProfiles
          };
        })
      );

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المنشورات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content: newPost,
          privacy_level: newPostPrivacy,
          user_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم نشر المنشور",
      });

      setNewPost('');
      setNewPostPrivacy('public');
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "خطأ",
        description: "فشل في نشر المنشور",
        variant: "destructive",
      });
    }
  };

  const updatePost = async (postId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editContent })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تعديل المنشور",
      });

      setEditingPost(null);
      setEditContent('');
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "خطأ",
        description: "فشل في تعديل المنشور",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف المنشور",
      });

      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المنشور",
        variant: "destructive",
      });
    }
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user?.id
          });

        if (error) throw error;
      }

      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addComment = async (postId: string) => {
    const comment = newComment[postId];
    if (!comment?.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          content: comment,
          user_id: user?.id
        });

      if (error) throw error;

      setNewComment(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة التعليق",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-PS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPrivacyLabel = (privacy: string) => {
    switch (privacy) {
      case 'public': return 'عام';
      case 'admin_only': return 'المديرين فقط';
      case 'specific_groups': return 'مجموعات محددة';
      default: return 'عام';
    }
  };

  const canEditPost = (post: any) => {
    return user?.role === 'admin' || post.user_id === user?.id;
  };

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold font-arabic">آخر الأخبار</h1>
              <p className="text-sm text-muted-foreground">News Feed</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreatePost(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            منشور جديد
          </Button>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-4">
        {/* Create Post Dialog */}
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-arabic">إنشاء منشور جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="ما الذي تريد مشاركته؟"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px]"
              />
              <Select value={newPostPrivacy} onValueChange={setNewPostPrivacy}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مستوى الخصوصية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">عام</SelectItem>
                  <SelectItem value="admin_only">المديرين فقط</SelectItem>
                  <SelectItem value="specific_groups">مجموعات محددة</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                  إلغاء
                </Button>
                <Button onClick={createPost}>
                  نشر
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Posts */}
        {posts.map((post) => {
          const isLiked = post.post_likes.some((like: any) => like.user_id === user?.id);
          const likesCount = post.post_likes.length;
          const commentsCount = post.post_comments.length;

          return (
            <Card key={post.id} className="glass-card p-4 space-y-4">
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {post.profiles?.full_name?.charAt(0) || 'M'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {post.profiles?.full_name || 'مستخدم مجهول'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {post.profiles?.role || 'مستخدم'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getPrivacyLabel(post.privacy_level)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {canEditPost(post) && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingPost(post.id);
                        setEditContent(post.content);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Post Content */}
              {editingPost === post.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPost(null);
                        setEditContent('');
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button size="sm" onClick={() => updatePost(post.id)}>
                      حفظ
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-foreground whitespace-pre-wrap">
                  {post.content}
                </div>
              )}

              {post.image_url && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={post.image_url} 
                    alt="Post attachment" 
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id, isLiked)}
                    className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    {likesCount}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {commentsCount}
                  </Button>
                </div>
              </div>

              {/* Comments */}
              {post.post_comments.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                  {post.post_comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {comment.profiles?.full_name?.charAt(0) || 'M'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="font-semibold text-sm mb-1">
                            {comment.profiles?.full_name || 'مستخدم مجهول'}
                          </div>
                          <div className="text-sm">{comment.content}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(comment.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <Input
                  placeholder="اكتب تعليق..."
                  value={newComment[post.id] || ''}
                  onChange={(e) => 
                    setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addComment(post.id);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => addComment(post.id)}
                  disabled={!newComment[post.id]?.trim()}
                >
                  إرسال
                </Button>
              </div>
            </Card>
          );
        })}

        {posts.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد منشورات حتى الآن</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;