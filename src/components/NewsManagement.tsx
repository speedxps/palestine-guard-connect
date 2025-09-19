import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Eye, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface News {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author_id: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const NewsManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    is_published: false
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "خطأ في جلب الأخبار",
        description: "حدث خطأ أثناء جلب الأخبار.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingNews) {
        const { error } = await supabase
          .from('news')
          .update(formData)
          .eq('id', editingNews.id);

        if (error) throw error;

        toast({
          title: "تم تحديث الخبر",
          description: "تم تحديث الخبر بنجاح.",
        });
      } else {
        const { error } = await supabase
          .from('news')
          .insert({
            ...formData,
            author_id: user.id
          });

        if (error) throw error;

        toast({
          title: "تم إضافة الخبر",
          description: "تم إضافة الخبر الجديد بنجاح.",
        });
      }

      setFormData({ title: '', content: '', image_url: '', is_published: false });
      setEditingNews(null);
      setIsDialogOpen(false);
      fetchNews();
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: "خطأ في حفظ الخبر",
        description: "حدث خطأ أثناء حفظ الخبر.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      image_url: newsItem.image_url || '',
      is_published: newsItem.is_published
    });
    setIsDialogOpen(true);
  };

  const handleNewNews = () => {
    setEditingNews(null);
    setFormData({ title: '', content: '', image_url: '', is_published: false });
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-PS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-arabic">إدارة الأخبار الداخلية</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewNews}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة خبر جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-arabic">
                {editingNews ? 'تعديل الخبر' : 'إضافة خبر جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-arabic">العنوان</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="عنوان الخبر"
                  required
                  className="font-arabic"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content" className="font-arabic">المحتوى</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="محتوى الخبر"
                  rows={6}
                  required
                  className="font-arabic"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url" className="font-arabic">رابط الصورة (اختياري)</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="font-arabic"
                />
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({...formData, is_published: checked})}
                />
                <Label htmlFor="is_published" className="font-arabic">نشر الخبر</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingNews ? 'تحديث' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {news.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground font-arabic">لا توجد أخبار متاحة</p>
              </CardContent>
            </Card>
          ) : (
            news.map((newsItem) => (
              <Card key={newsItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <CardTitle className="font-arabic text-lg mb-2">
                        {newsItem.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span className="font-arabic">{formatDate(newsItem.created_at)}</span>
                        </div>
                        <Badge variant={newsItem.is_published ? "default" : "secondary"}>
                          {newsItem.is_published ? "منشور" : "مسودة"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(newsItem)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {newsItem.image_url && (
                    <img 
                      src={newsItem.image_url} 
                      alt="صورة الخبر"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <p className="text-muted-foreground font-arabic leading-relaxed line-clamp-3">
                    {newsItem.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};