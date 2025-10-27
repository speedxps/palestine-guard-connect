import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Search, Loader2, AlertCircle, X } from 'lucide-react';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import { toast } from 'sonner';

interface Match {
  id: string;
  national_id: string;
  name: string;
  photo_url: string;
  similarity: number;
}

export const FaceRecognitionUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);

  const { searchFaces } = useFaceRecognition();

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
    if (!imagePreview) {
      toast.error('يرجى رفع صورة أولاً');
      return;
    }

    setIsSearching(true);
    setMatches([]);

    try {
      const result = await searchFaces(imagePreview);

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
                  src={imagePreview}
                  alt="صورة للبحث"
                  className="w-full rounded-lg"
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
              disabled={!imagePreview || isSearching}
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
                        alt={match.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{match.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {match.national_id}
                      </p>
                    </div>
                    <Badge
                      variant={match.similarity > 0.5 ? 'default' : 'secondary'}
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