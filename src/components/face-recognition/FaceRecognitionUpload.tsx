import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Search, Loader2, AlertCircle, X } from 'lucide-react';
import { useFaceApi, FaceMatch } from '@/hooks/useFaceApi';
import { toast } from 'sonner';

export const FaceRecognitionUpload: React.FC = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<FaceMatch[]>([]);

  const { isModelLoaded, isLoading, error, processAndSearchImage } = useFaceApi();

  // معالجة رفع الصورة
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة');
      return;
    }

    // قراءة الصورة
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setMatches([]);
    };
    reader.readAsDataURL(file);
  };

  // البحث عن الوجه
  const handleSearch = async () => {
    if (!imageRef.current || !imagePreview) {
      toast.error('يرجى رفع صورة أولاً');
      return;
    }

    setIsSearching(true);
    setMatches([]);

    try {
      const result = await processAndSearchImage(imageRef.current, 0.6, 5);

      if (result.success && result.matches) {
        if (result.matches.length > 0) {
          setMatches(result.matches);
          toast.success(`تم العثور على ${result.matches.length} تطابق`);
        } else {
          toast.info('لم يتم العثور على أي تطابق');
        }
      } else {
        toast.error(result.error || 'فشل البحث');
      }
    } catch (err) {
      console.error('خطأ في البحث:', err);
      toast.error('حدث خطأ أثناء البحث');
    } finally {
      setIsSearching(false);
    }
  };

  // مسح الصورة
  const handleClear = () => {
    setImagePreview(null);
    setMatches([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">جاري تحميل نماذج التعرف على الوجوه...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            التعرف على الوجوه من صورة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* منطقة رفع الصورة */}
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">اضغط لرفع صورة</p>
                <p className="text-sm text-muted-foreground mt-2">
                  يدعم JPG, PNG, WEBP
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  ref={imageRef}
                  src={imagePreview}
                  alt="صورة للبحث"
                  className="w-full rounded-lg"
                  crossOrigin="anonymous"
                />
                <Button
                  onClick={handleClear}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={!imagePreview || isSearching || !isModelLoaded}
              className="flex-1"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري البحث...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  بحث عن الوجه
                </>
              )}
            </Button>
          </div>

          {/* النتائج */}
          {matches.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">النتائج المطابقة:</h3>
              <div className="space-y-2">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    {match.photo_url && (
                      <img
                        src={match.photo_url}
                        alt={match.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{match.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {match.national_id}
                      </p>
                    </div>
                    <Badge
                      variant={match.similarity > 0.8 ? 'default' : 'secondary'}
                    >
                      {(match.similarity * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};