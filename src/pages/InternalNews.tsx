import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Image as ImageIcon, User, Calendar, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PrintService } from '@/components/PrintService';
import { BackButton } from '@/components/BackButton';

interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author_name: string;
  privacy_level: string;
  target_groups?: string[];
  created_at: string;
}

export default function InternalNews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    privacy_level: 'public',
    target_groups: [] as string[]
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('internal_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الأخبار",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async () => {
    try {
      if (!user) return;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase
        .from('internal_news')
        .insert([{
          ...formData,
          author_id: user.id,
          author_name: profile.full_name || user.email || 'مستخدم',
          target_groups: formData.privacy_level === 'specific_groups' ? formData.target_groups : null
        }]);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الخبر بنجاح",
      });

      setShowCreateDialog(false);
      setFormData({
        title: '',
        content: '',
        image_url: '',
        privacy_level: 'public',
        target_groups: []
      });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الخبر",
        variant: "destructive",
      });
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-3xl font-bold text-foreground">الأخبار الداخلية</h1>
        </div>
        {isAdmin && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusCircle className="h-4 w-4 ml-2" />
                خبر جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إنشاء خبر جديد</DialogTitle>
                <DialogDescription>
                  املأ البيانات التالية لإنشاء خبر جديد
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">العنوان</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="عنوان الخبر"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="content">المحتوى</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="محتوى الخبر"
                    rows={6}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="image">رابط الصورة (اختياري)</Label>
                  <Input
                    id="image"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>مستوى الخصوصية</Label>
                  <Select
                    value={formData.privacy_level}
                    onValueChange={(value) => setFormData({...formData, privacy_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">عام - جميع المستخدمين</SelectItem>
                      <SelectItem value="admin_only">المديرين فقط</SelectItem>
                      <SelectItem value="specific_groups">مجموعات محددة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.privacy_level === 'specific_groups' && (
                  <div className="grid gap-2">
                    <Label>المجموعات المستهدفة</Label>
                    <div className="flex flex-wrap gap-2">
                      {['admin', 'officer', 'detective'].map((role) => (
                        <Button
                          key={role}
                          type="button"
                          variant={formData.target_groups.includes(role) ? "default" : "outline"}
                          onClick={() => {
                            const groups = formData.target_groups.includes(role)
                              ? formData.target_groups.filter(g => g !== role)
                              : [...formData.target_groups, role];
                            setFormData({...formData, target_groups: groups});
                          }}
                        >
                          {role === 'admin' ? 'مدير' : role === 'officer' ? 'ضابط' : 'محقق'}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={createPost}
                  disabled={!formData.title || !formData.content}
                  className="bg-primary hover:bg-primary/90"
                >
                  نشر الخبر
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد أخبار</h3>
            <p className="text-muted-foreground">لم يتم نشر أي أخبار داخلية حتى الآن</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl text-foreground">{post.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                  </div>
                  <PrintService
                    title={`الخبر: ${post.title}`}
                    content={`
                      <div class="news-content">
                        <h2>${post.title}</h2>
                        <div class="meta-info">
                          <p><strong>الكاتب:</strong> ${post.author_name}</p>
                          <p><strong>التاريخ:</strong> ${new Date(post.created_at).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div class="content">
                          ${post.content.split('\n').map(p => `<p>${p}</p>`).join('')}
                        </div>
                        ${post.image_url ? `<div class="image"><img src="${post.image_url}" alt="صورة الخبر" style="max-width: 100%; height: auto;" /></div>` : ''}
                      </div>
                    `}
                    pageTitle="الأخبار الداخلية"
                    department="الشرطة الفلسطينية"
                    documentType="خبر داخلي"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {post.image_url && (
                  <div className="mb-4">
                    <img
                      src={post.image_url}
                      alt="صورة الخبر"
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="prose prose-sm max-w-none text-foreground">
                  {post.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}