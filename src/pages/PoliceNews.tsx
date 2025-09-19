import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink, Calendar, Eye, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsPost {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  imageUrl?: string;
  link?: string;
  author?: string;
  category?: string;
}

const PoliceNews = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternalNews();
  }, []);

  const fetchInternalNews = async () => {
    setLoading(true);
    try {
      // استخدام بيانات تجريبية مخزنة محلياً
      const storedNews = localStorage.getItem('policeNews');
      let localNews = [];

      if (storedNews) {
        localNews = JSON.parse(storedNews);
      }

      if (localNews && localNews.length > 0) {
        setNews(localNews);
      } else {
        // استخدام بيانات تجريبية إذا لم توجد أخبار محفوظة
        const mockNews: NewsPost[] = [
          {
            id: '1',
            title: 'تفعيل الخطة الأمنية الشاملة للعام الجديد',
            content: 'أعلنت قيادة الشرطة الفلسطينية عن تفعيل الخطة الأمنية الشاملة للعام الجديد، والتي تهدف إلى تعزيز الأمن والسلامة في جميع المحافظات. تتضمن الخطة نشر دوريات إضافية وتكثيف الحملات الأمنية في المناطق الحيوية.',
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            imageUrl: '/lovable-uploads/b1560465-346a-4180-a2b3-7f08124d1116.png',
            author: 'العقيد محمد أحمد',
            category: 'أمن عام'
          },
          {
            id: '2',
            title: 'إطلاق النظام الإلكتروني لتسجيل البلاغات',
            content: 'تم إطلاق النظام الإلكتروني الجديد لتسجيل البلاغات والشكاوى، والذي يتيح للمواطنين تقديم البلاغات بسهولة وسرعة عبر التطبيق الذكي. النظام متاح على مدار 24 ساعة ويوفر المتابعة الفورية للبلاغات.',
            publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            imageUrl: '/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png',
            author: 'النقيب سارة علي',
            category: 'تقنية'
          },
          {
            id: '3',
            title: 'حملة توعوية للسلامة المرورية في المدارس',
            content: 'انطلقت حملة توعوية شاملة للسلامة المرورية تستهدف طلاب المدارس في جميع المحافظات. الحملة تهدف إلى رفع مستوى الوعي المروري لدى النشء وتقليل حوادث المرور.',
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            author: 'الرائد خالد محمود',
            category: 'مرور'
          },
          {
            id: '4',
            title: 'تدشين مركز جديد لمكافحة الجرائم الإلكترونية',
            content: 'تم تدشين مركز متطور لمكافحة الجرائم الإلكترونية مزود بأحدث التقنيات والأجهزة. المركز سيعمل على حماية المواطنين من جرائم الاحتيال الإلكتروني والسرقة الرقمية.',
            publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            author: 'المقدم أحمد صالح',
            category: 'جرائم إلكترونية'
          }
        ];
        setNews(mockNews);
        // حفظ البيانات محلياً للاستخدام المستقبلي
        localStorage.setItem('policeNews', JSON.stringify(mockNews));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "خطأ في تحميل الأخبار",
        description: "حدث خطأ أثناء تحميل الأخبار",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'أمن عام':
        return 'bg-blue-100 text-blue-800';
      case 'تقنية':
        return 'bg-green-100 text-green-800';
      case 'مرور':
        return 'bg-yellow-100 text-yellow-800';
      case 'جرائم إلكترونية':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="mobile-container">
        <div className="page-header">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold font-arabic">أخبار الشرطة</h1>
              <p className="text-sm text-muted-foreground">Police News</p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
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
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold font-arabic">أخبار الشرطة</h1>
            <p className="text-sm text-muted-foreground">آخر الأخبار والتحديثات</p>
          </div>
          <Button
            size="icon"
            onClick={() => toast({ title: "قريباً", description: "ميزة إضافة الأخبار ستكون متاحة قريباً" })}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-32 space-y-4">
        {news.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold font-arabic mb-2">لا توجد أخبار</h3>
            <p className="text-muted-foreground font-arabic">لا توجد أخبار متاحة حالياً</p>
          </Card>
        ) : (
          news.map((article) => (
            <Card key={article.id} className="glass-card hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="font-arabic text-lg leading-relaxed text-right">
                      {article.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {article.category && (
                        <Badge className={getCategoryColor(article.category)}>
                          {article.category}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="font-arabic">{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Newspaper className="h-6 w-6 text-primary shrink-0" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Image */}
                {article.imageUrl && (
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src={article.imageUrl}
                      alt="صورة الخبر"
                      className="w-full h-48 sm:h-56 object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="space-y-3">
                  <p className="text-muted-foreground font-arabic leading-relaxed text-sm text-right">
                    {article.content}
                  </p>
                  
                  {/* Author */}
                  {article.author && (
                    <div className="text-sm text-muted-foreground font-arabic">
                      بقلم: {article.author}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-border/50">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 font-arabic text-xs"
                      >
                        <Eye className="h-3 w-3" />
                        قراءة المزيد
                      </Button>
                    </div>
                    
                    {article.link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(article.link, '_blank')}
                        className="flex items-center gap-2 font-arabic text-xs"
                      >
                        <ExternalLink className="h-3 w-3" />
                        رابط خارجي
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Footer Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1 pt-4">
          <p className="font-arabic">الشرطة الفلسطينية</p>
          <p>© 2024 جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};

export default PoliceNews;