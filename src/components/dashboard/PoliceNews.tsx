import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink, Calendar, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NewsPost {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  imageUrl?: string;
  link?: string;
}

const PoliceNews = () => {
  const [latestPost, setLatestPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPost = async () => {
      setLoading(true);
      
      try {
        // استدعاء Edge Function لجلب أحدث الأخبار من الموقع الرسمي
        const { data, error } = await supabase.functions.invoke('fetch-facebook-posts');
        
        if (error) {
          console.error('Error calling function:', error);
          throw error;
        }

        if (data?.data && data.data.length > 0) {
          const fbPost = data.data[0];
          const post: NewsPost = {
            id: fbPost.id,
            title: 'آخر أخبار الشرطة الفلسطينية',
            content: fbPost.message || fbPost.story || 'منشور جديد من الشرطة الفلسطينية',
            publishedAt: fbPost.created_time,
            imageUrl: fbPost.full_picture || '/lovable-uploads/b1560465-346a-4180-a2b3-7f08124d1116.png',
            link: fbPost.permalink_url || 'https://www.palpolice.ps/'
          };
          
          setLatestPost(post);
        }
      } catch (error) {
        console.error('Error fetching police website news:', error);
        // استخدام بيانات احتياطية في حالة الخطأ
        const mockPost: NewsPost = {
          id: 'fallback',
          title: 'إعلان هام من الشرطة الفلسطينية',
          content: 'تعلن قيادة الشرطة الفلسطينية عن تفعيل الخطة الأمنية الشاملة خلال الأيام القادمة، وذلك لضمان الأمن والسلامة العامة. نرجو من المواطنين التعاون مع رجال الأمن والإبلاغ عن أي أمور مشبوهة.',
          publishedAt: new Date().toISOString(),
          imageUrl: '/lovable-uploads/b1560465-346a-4180-a2b3-7f08124d1116.png',
          link: 'https://www.palpolice.ps/'
        };
        setLatestPost(mockPost);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPost();
    
    // تحديث كل 10 ثواني للحصول على أحدث الأخبار
    const interval = setInterval(fetchLatestPost, 10 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-muted rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestPost) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-arabic">
            <Newspaper className="h-5 w-5" />
            آخر الأخبار
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8 font-arabic">
            لا توجد أخبار متاحة حالياً
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-PS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-arabic">
            <Newspaper className="h-5 w-5 text-primary" />
            آخر الأخبار الرسمية
          </CardTitle>
          <Badge variant="secondary" className="font-arabic">
            جديد
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Post Image */}
        {latestPost.imageUrl && (
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={latestPost.imageUrl}
              alt="صورة الخبر"
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(latestPost.publishedAt)}
              </Badge>
            </div>
          </div>
        )}

        {/* Post Content */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg text-foreground font-arabic leading-relaxed">
            {latestPost.title}
          </h3>
          
          <p className="text-muted-foreground font-arabic leading-relaxed text-sm">
            {latestPost.content}
          </p>
          
          {/* Post Meta */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-arabic">{formatDate(latestPost.publishedAt)}</span>
            </div>
            
            <div className="flex flex-col gap-2">
              {latestPost.link && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(latestPost.link, '_blank')}
                  className="flex items-center gap-2 font-arabic text-xs w-full"
                >
                  <ExternalLink className="h-3 w-3" />
                  قراءة المقال كاملاً
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://www.palpolice.ps/', '_blank')}
                className="flex items-center gap-2 font-arabic text-xs w-full"
              >
                <ExternalLink className="h-3 w-3" />
                الموقع الرسمي
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoliceNews;