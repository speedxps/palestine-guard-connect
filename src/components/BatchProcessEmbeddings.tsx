import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProcessingResult {
  citizen_id: string;
  name: string;
  status: 'success' | 'failed';
  error?: string;
}

interface BatchResult {
  success: boolean;
  message: string;
  summary: {
    total_citizens: number;
    processed: number;
    successful: number;
    failed: number;
  };
  results: ProcessingResult[];
}

const BatchProcessEmbeddings: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult | null>(null);

  const processBatch = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      const { data, error } = await supabase.functions.invoke('batch-generate-embeddings', {
        body: {}
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('Error processing batch:', error);
        toast.error('فشل في معالجة الدفعة');
        return;
      }

      setResults(data as BatchResult);
      if (data.summary.successful > 0) {
        toast.success(`تم معالجة ${data.summary.successful} مواطن بنجاح`);
      }
      if (data.summary.failed > 0) {
        toast.warning(`فشل في معالجة ${data.summary.failed} مواطن`);
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء المعالجة');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          معالجة صور المواطنين بالذكاء الاصطناعي
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          توليد Face Embeddings للصور الموجودة في قاعدة البيانات لتحسين دقة التعرف على الوجوه
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isProcessing && !results && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              سيتم معالجة الصور التي لا تحتوي على Face Embedding وتوليد الوصف الذكي لها
            </p>
            <Button onClick={processBatch} size="lg" className="w-full">
              <Brain className="h-4 w-4 ml-2" />
              بدء المعالجة
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>جاري معالجة الصور...</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              {progress}% مكتمل
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.summary.successful}
                </div>
                <div className="text-sm text-muted-foreground">نجح</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results.summary.failed}
                </div>
                <div className="text-sm text-muted-foreground">فشل</div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {results.results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status === 'success' ? 'نجح' : 'فشل'}
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                setResults(null);
                setProgress(0);
              }}
              variant="outline"
              className="w-full"
            >
              معالجة دفعة جديدة
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchProcessEmbeddings;