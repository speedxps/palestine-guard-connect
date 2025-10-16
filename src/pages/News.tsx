import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, User, Newspaper, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface News {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author_id: string;
  author_name: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const News = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedNews();
  }, []);

  useEffect(() => {
    if (id && news.length > 0) {
      const newsItem = news.find(n => n.id === id);
      setSelectedNews(newsItem || null);
      
      // Mark news as read
      if (newsItem && user) {
        supabase
          .from('news_reads')
          .insert({
            news_id: id,
            user_id: user.id
          })
          .then(({ error }) => {
            if (error) console.error('Error marking news as read:', error);
          });
      }
    }
  }, [id, news, user]);

  const fetchPublishedNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('internal_news')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
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

  const handleNewsClick = (newsItem: News) => {
    navigate(`/news/${newsItem.id}`);
    setSelectedNews(newsItem);
  };

  const handleBackClick = () => {
    if (selectedNews) {
      setSelectedNews(null);
      navigate('/news');
    } else {
      navigate(-1);
    }
  };

  if (selectedNews) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button 
            variant="ghost" 
            onClick={handleBackClick}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            رجوع
          </Button>
          
          <Card className="shadow-lg">
            <CardHeader className="space-y-4">
              <CardTitle className="text-3xl font-bold font-arabic">
                {selectedNews.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-arabic">{formatDate(selectedNews.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-arabic">{selectedNews.author_name}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedNews.image_url && (
                <img
                  src={selectedNews.image_url}
                  alt={selectedNews.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              )}
              <div className="prose prose-lg max-w-none font-arabic">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedNews.content}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-3 bg-card px-4 md:px-6 py-3 rounded-full shadow-lg border">
            <Newspaper className="h-6 md:h-8 w-6 md:w-8 text-primary" />
            <h1 className="text-xl md:text-3xl font-bold">الأخبار</h1>
          </div>
          <div />
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : news.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground font-arabic text-lg">لا توجد أخبار متاحة</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {news.map((newsItem) => (
              <Card
                key={newsItem.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => handleNewsClick(newsItem)}
              >
                {newsItem.image_url && (
                  <img
                    src={newsItem.image_url}
                    alt={newsItem.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle className="font-arabic text-xl line-clamp-2">
                    {newsItem.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-arabic">{formatDate(newsItem.created_at)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-arabic leading-relaxed line-clamp-3">
                    {newsItem.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
