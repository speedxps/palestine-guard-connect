import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PlayCircle, PauseCircle, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

interface Citizen {
  id: string;
  national_id: string;
  full_name: string;
  photo_url: string;
  face_embedding: string | null;
}

interface ProcessingResult {
  citizenId: string;
  name: string;
  success: boolean;
  error?: string;
}

export default function BatchFaceProcessing() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // جلب المواطنين الذين لا يملكون face_embedding
  const fetchCitizens = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('citizens')
        .select('id, national_id, full_name, photo_url, face_embedding')
        .not('photo_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCitizens(data || []);
      toast.success(`تم جلب ${data?.length || 0} مواطن`);
    } catch (error) {
      console.error('Error fetching citizens:', error);
      toast.error('فشل في جلب بيانات المواطنين');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  // معالجة مواطن واحد
  const processCitizen = async (citizen: Citizen): Promise<ProcessingResult> => {
    try {
      // تحميل الصورة وتحويلها إلى base64
      const response = await fetch(citizen.photo_url);
      const blob = await response.blob();
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // استدعاء edge function لتوليد embedding
      const { data, error } = await supabase.functions.invoke('generate-face-embedding', {
        body: {
          imageBase64: base64,
          citizenId: citizen.id
        }
      });

      if (error) throw error;

      if (data?.success) {
        return {
          citizenId: citizen.id,
          name: citizen.full_name,
          success: true
        };
      } else {
        throw new Error(data?.error || 'فشل في توليد embedding');
      }
    } catch (error) {
      console.error(`Error processing ${citizen.full_name}:`, error);
      return {
        citizenId: citizen.id,
        name: citizen.full_name,
        success: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      };
    }
  };

  // بدء المعالجة الدفعية
  const startBatchProcessing = async () => {
    setIsProcessing(true);
    setIsPaused(false);
    setResults([]);

    for (let i = currentIndex; i < citizens.length; i++) {
      if (isPaused) {
        setCurrentIndex(i);
        break;
      }

      setCurrentIndex(i);
      const citizen = citizens[i];

      // تخطي المواطنين الذين لديهم embedding بالفعل إذا كان المستخدم يريد معالجة الجميع
      const result = await processCitizen(citizen);
      setResults(prev => [...prev, result]);

      if (result.success) {
        toast.success(`✅ ${citizen.full_name}`);
      } else {
        toast.error(`❌ ${citizen.full_name}: ${result.error}`);
      }

      // تأخير قصير بين كل مواطن لتجنب rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setIsProcessing(false);
    setCurrentIndex(0);
    toast.success('اكتملت المعالجة الدفعية');
  };

  // إيقاف مؤقت
  const pauseProcessing = () => {
    setIsPaused(true);
    setIsProcessing(false);
  };

  // استئناف المعالجة
  const resumeProcessing = () => {
    startBatchProcessing();
  };

  // إعادة تعيين
  const resetProcessing = () => {
    setIsProcessing(false);
    setIsPaused(false);
    setCurrentIndex(0);
    setResults([]);
  };

  const totalCitizens = citizens.length;
  const processedCount = results.length;
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;
  const progress = totalCitizens > 0 ? (processedCount / totalCitizens) * 100 : 0;
  const citizensWithoutEmbedding = citizens.filter(c => !c.face_embedding).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">معالجة الصور الدفعية</h1>
            <p className="text-muted-foreground">توليد face embeddings لجميع المواطنين</p>
          </div>
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">إجمالي المواطنين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCitizens}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">بدون embedding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{citizensWithoutEmbedding}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">نجح</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{successCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">فشل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{failedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* التحكم في المعالجة */}
        <Card>
          <CardHeader>
            <CardTitle>التحكم في المعالجة</CardTitle>
            <CardDescription>
              معالجة جميع صور المواطنين لتوليد face embeddings باستخدام Google Gemini Vision
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* شريط التقدم */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>التقدم</span>
                <span>{processedCount} / {totalCitizens}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progress.toFixed(1)}% مكتمل
              </p>
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-3">
              {!isProcessing && !isPaused && (
                <Button
                  onClick={startBatchProcessing}
                  disabled={isLoading || totalCitizens === 0}
                  className="flex-1"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  بدء المعالجة
                </Button>
              )}

              {isProcessing && (
                <Button
                  onClick={pauseProcessing}
                  variant="secondary"
                  className="flex-1"
                >
                  <PauseCircle className="w-4 h-4 mr-2" />
                  إيقاف مؤقت
                </Button>
              )}

              {isPaused && (
                <Button
                  onClick={resumeProcessing}
                  className="flex-1"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  استئناف
                </Button>
              )}

              <Button
                onClick={resetProcessing}
                variant="outline"
                disabled={isProcessing}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                إعادة تعيين
              </Button>

              <Button
                onClick={fetchCitizens}
                variant="outline"
                disabled={isProcessing || isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                تحديث القائمة
              </Button>
            </div>

            {/* المواطن الحالي */}
            {isProcessing && currentIndex < citizens.length && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-background">
                    {citizens[currentIndex].photo_url && (
                      <img
                        src={citizens[currentIndex].photo_url}
                        alt={citizens[currentIndex].full_name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{citizens[currentIndex].full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {citizens[currentIndex].national_id}
                    </p>
                  </div>
                  <div className="animate-spin">⏳</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* النتائج */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>النتائج</CardTitle>
              <CardDescription>آخر {results.length} عملية معالجة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.slice().reverse().map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{result.name}</p>
                        {!result.success && result.error && (
                          <p className="text-xs text-red-500">{result.error}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'نجح' : 'فشل'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
