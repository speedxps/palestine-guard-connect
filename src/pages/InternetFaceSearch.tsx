import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackButton } from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  Upload, 
  Camera, 
  Search, 
  ExternalLink, 
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  User,
  X
} from 'lucide-react';

interface SearchResult {
  url: string;
  score: number;
  thumbnail?: string;
  platform: string;
  title?: string;
}

type SearchType = 'image' | 'text';

const InternetFaceSearch = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [searchType, setSearchType] = useState<SearchType>('image');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textQuery, setTextQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStatus, setSearchStatus] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: '❌ خطأ',
          description: 'يرجى اختيار ملف صورة صالح',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResults([]);
        setHasSearched(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: '❌ خطأ',
        description: 'لا يمكن الوصول إلى الكاميرا',
        variant: 'destructive',
      });
    }
  };

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }, [cameraStream]);

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setSelectedImage(imageData);
        setResults([]);
        setHasSearched(false);
        stopCamera();
      }
    }
  };

  // Simulate search (placeholder for actual API integration)
  const performSearch = async () => {
    if (searchType === 'image' && !selectedImage) {
      toast({
        title: '❌ خطأ',
        description: 'يرجى رفع صورة أولاً',
        variant: 'destructive',
      });
      return;
    }

    if (searchType === 'text' && !textQuery.trim()) {
      toast({
        title: '❌ خطأ',
        description: 'يرجى إدخال اسم أو يوزر للبحث',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    setSearchProgress(0);
    setResults([]);
    setHasSearched(true);

    // Simulate search progress
    const stages = searchType === 'image' 
      ? [
          { progress: 10, status: 'جاري تحليل ملامح الوجه...' },
          { progress: 25, status: 'جاري البحث في Facebook...' },
          { progress: 40, status: 'جاري البحث في Instagram...' },
          { progress: 55, status: 'جاري البحث في LinkedIn...' },
          { progress: 70, status: 'جاري البحث في Twitter/X...' },
          { progress: 85, status: 'جاري تجميع النتائج...' },
          { progress: 100, status: 'اكتمل البحث!' },
        ]
      : [
          { progress: 15, status: `جاري البحث عن "${textQuery}"...` },
          { progress: 35, status: 'جاري البحث في Facebook...' },
          { progress: 55, status: 'جاري البحث في Instagram...' },
          { progress: 75, status: 'جاري البحث في LinkedIn...' },
          { progress: 90, status: 'جاري تجميع النتائج...' },
          { progress: 100, status: 'اكتمل البحث!' },
        ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setSearchProgress(stage.progress);
      setSearchStatus(stage.status);
    }

    // Simulate results based on search type
    const mockResults: SearchResult[] = searchType === 'image' 
      ? [
          {
            url: 'https://facebook.com/profile/example1',
            score: 94,
            platform: 'Facebook',
            title: 'حساب محتمل على فيسبوك',
          },
          {
            url: 'https://instagram.com/user123',
            score: 87,
            platform: 'Instagram',
            title: 'حساب محتمل على إنستغرام',
          },
          {
            url: 'https://linkedin.com/in/professional',
            score: 76,
            platform: 'LinkedIn',
            title: 'حساب مهني على لينكدإن',
          },
        ]
      : [
          {
            url: `https://facebook.com/search?q=${encodeURIComponent(textQuery)}`,
            score: 100,
            platform: 'Facebook',
            title: `نتائج البحث عن "${textQuery}" على فيسبوك`,
          },
          {
            url: `https://instagram.com/${textQuery.replace(/\s/g, '')}`,
            score: 85,
            platform: 'Instagram',
            title: `حساب محتمل @${textQuery.replace(/\s/g, '')}`,
          },
          {
            url: `https://twitter.com/${textQuery.replace(/\s/g, '')}`,
            score: 80,
            platform: 'Twitter',
            title: `حساب محتمل @${textQuery.replace(/\s/g, '')}`,
          },
          {
            url: `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(textQuery)}`,
            score: 75,
            platform: 'LinkedIn',
            title: `البحث عن "${textQuery}" على لينكدإن`,
          },
        ];

    setResults(mockResults);
    setIsSearching(false);
    
    toast({
      title: '✅ اكتمل البحث',
      description: `تم العثور على ${mockResults.length} نتائج محتملة`,
    });
  };

  // Get platform color
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return 'bg-blue-500';
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'linkedin': return 'bg-blue-700';
      case 'twitter': return 'bg-sky-500';
      default: return 'bg-gray-500';
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    return 'text-orange-500';
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedImage(null);
    setResults([]);
    setHasSearched(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <BackButton />
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex-shrink-0">
            <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">البحث عن الوجوه على الإنترنت</h1>
            <p className="text-sm sm:text-base text-muted-foreground">البحث في مواقع التواصل الاجتماعي والإنترنت</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              طريقة البحث
            </CardTitle>
            <CardDescription>
              اختر طريقة البحث: بالصورة أو بالاسم/اليوزر
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={searchType} onValueChange={(v) => setSearchType(v as SearchType)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  بالصورة
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  بالاسم/اليوزر
                </TabsTrigger>
              </TabsList>

              <TabsContent value="image" className="space-y-4 mt-4">
                {/* Image Preview */}
                {selectedImage ? (
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Selected" 
                      className="w-full max-h-64 object-contain rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={clearSelection}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : showCamera ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg border"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={capturePhoto} className="flex-1">
                        <Camera className="h-4 w-4 ml-2" />
                        التقاط
                      </Button>
                      <Button variant="outline" onClick={stopCamera}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">اضغط لرفع صورة</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG حتى 10MB</p>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* Action Buttons */}
                {!showCamera && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 ml-2" />
                      رفع صورة
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={startCamera}
                    >
                      <Camera className="h-4 w-4 ml-2" />
                      الكاميرا
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <Input
                    placeholder="أدخل الاسم الكامل أو اسم العائلة"
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    className="text-right"
                  />
                  <p className="text-xs text-muted-foreground">
                    يمكنك البحث بـ: الاسم الكامل، اسم العائلة، اليوزرنيم، أو أي معرف آخر
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Search Button */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={performSearch}
              disabled={(searchType === 'image' && !selectedImage) || (searchType === 'text' && !textQuery.trim()) || isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                  جاري البحث...
                </>
              ) : (
                <>
                  <Globe className="h-5 w-5 ml-2" />
                  ابدأ البحث على الإنترنت
                </>
              )}
            </Button>

            {/* Search Progress */}
            {isSearching && (
              <div className="space-y-2">
                <Progress value={searchProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">{searchStatus}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              نتائج البحث
            </CardTitle>
            <CardDescription>
              {hasSearched 
                ? `تم العثور على ${results.length} نتائج محتملة`
                : 'قم برفع صورة وابدأ البحث لعرض النتائج'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasSearched ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Globe className="h-16 w-16 mb-4 opacity-20" />
                <p>لم يتم البحث بعد</p>
              </div>
            ) : results.length === 0 && !isSearching ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <AlertCircle className="h-16 w-16 mb-4 opacity-20" />
                <p>لم يتم العثور على نتائج مطابقة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getPlatformColor(result.platform)} text-white`}>
                              {result.platform}
                            </Badge>
                            <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                              {result.score}%
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.url}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(result.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Note about API */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600">ملاحظة</p>
                  <p className="text-muted-foreground">
                    هذه الصفحة تعمل حالياً بنظام تجريبي. للحصول على نتائج حقيقية، يرجى تفعيل خدمة FaceCheck.id API.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InternetFaceSearch;
