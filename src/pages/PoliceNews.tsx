import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, Calendar, User, ExternalLink, Plus } from 'lucide-react';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';
import { NewsManagement } from '@/components/NewsManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

const PoliceNews = () => {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManagement, setShowManagement] = useState(false);

  useEffect(() => {
    fetchPublishedNews();
  }, []);

  const fetchPublishedNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
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

  const isAdmin = user?.role === 'admin';

  if (showManagement && isAdmin) {
    return (
      <ProfessionalLayout title="إدارة الأخبار">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setShowManagement(false)}>
              العودة للأخبار
            </Button>
          </div>
          <NewsManagement />
        </div>
      </ProfessionalLayout>
    );
  }

  return (
    <ProfessionalLayout title="أخبار الشرطة الداخلية">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Newspaper className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold font-arabic">أخبار الشرطة الداخلية</h1>
              <p className="text-muted-foreground font-arabic">آخر الأخبار والتحديثات الداخلية</p>
            </div>
          </div>
          
          {isAdmin && (
            <Button onClick={() => setShowManagement(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إدارة الأخبار
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* News Grid */}
            <div className="grid gap-6">
              {news.map((newsItem) => (
                <Card key={newsItem.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="font-arabic text-xl leading-relaxed mb-2">
                          {newsItem.title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-arabic">{formatDate(newsItem.created_at)}</span>
                          </div>
                        </div>
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
                    <p className="text-muted-foreground font-arabic leading-relaxed text-base">
                      {newsItem.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {news.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold font-arabic mb-2">لا توجد أخبار حالياً</h3>
                  <p className="text-muted-foreground font-arabic">
                    لم يتم نشر أي أخبار داخلية في الوقت الحالي
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </ProfessionalLayout>
  );
};

export default PoliceNews;