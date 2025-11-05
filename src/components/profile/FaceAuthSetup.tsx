import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import * as faceapi from 'face-api.js';
import { loadFaceApiModels } from '@/utils/faceApiLoader';

export const FaceAuthSetup = () => {
  const { user } = useAuth();
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasExistingFace, setHasExistingFace] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // تحميل النماذج عند التحميل
  useEffect(() => {
    loadFaceApiModels().then(loaded => setModelsLoaded(loaded));
  }, []);

  // التحقق من وجود سجل سابق
  useEffect(() => {
    checkExistingFaceData();
  }, [user]);

  const checkExistingFaceData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_face_data')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setHasExistingFace(!!data);
    } catch (error) {
      console.error('Error checking face data:', error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error('فشل في تشغيل الكاميرا');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const processFaceAndSave = async () => {
    if (!capturedImage || !user || !modelsLoaded) {
      toast.error('تأكد من التقاط صورة وتحميل النماذج');
      return;
    }

    setIsProcessing(true);

    try {
      // تحويل base64 إلى image element
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = capturedImage;
      });

      // استخراج face descriptor
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error('لم يتم العثور على وجه في الصورة. حاول مرة أخرى.');
        setCapturedImage(null);
        setIsProcessing(false);
        return;
      }

      const faceVector = Array.from(detection.descriptor);
      console.log('✅ Face descriptor extracted:', faceVector.length, 'dimensions');

      // حفظ في قاعدة البيانات
      const { error: upsertError } = await supabase
        .from('user_face_data')
        .upsert({
          user_id: user.id,
          face_vector: JSON.stringify(faceVector),
          face_image_url: capturedImage,
          is_active: true
        } as any);

      if (upsertError) throw upsertError;

      toast.success('تم حفظ بيانات الوجه بنجاح! 🎉');
      setCapturedImage(null);
      setHasExistingFace(true);
      
    } catch (error) {
      console.error('Error processing face:', error);
      toast.error('فشل في معالجة الصورة');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          إعداد التعرف على الوجه
        </CardTitle>
        <CardDescription>
          {hasExistingFace 
            ? 'لديك بالفعل بيانات وجه محفوظة. يمكنك تحديثها من هنا.'
            : 'قم بإعداد التعرف على الوجه لتسجيل الدخول السريع'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!modelsLoaded && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">جاري تحميل نماذج التعرف...</p>
          </div>
        )}

        {modelsLoaded && !isCapturing && !capturedImage && (
          <div className="space-y-3">
            <Button onClick={startCamera} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              التقاط صورة بالكاميرا
            </Button>
            
            <label htmlFor="face-upload" className="block">
              <Button type="button" variant="outline" className="w-full" onClick={() => document.getElementById('face-upload')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                رفع صورة من الجهاز
              </Button>
            </label>
            <input
              id="face-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        )}

        {isCapturing && (
          <div className="space-y-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border"
            />
            <div className="flex gap-2">
              <Button onClick={captureImage} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                التقاط
              </Button>
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-3">
            <img
              src={capturedImage}
              alt="Captured face"
              className="w-full rounded-lg border"
            />
            <div className="flex gap-2">
              <Button 
                onClick={processFaceAndSave} 
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>جاري المعالجة...</>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    حفظ
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setCapturedImage(null)} 
                variant="outline"
                disabled={isProcessing}
                className="flex-1"
              >
                <X className="w-4 w-4 mr-2" />
                إعادة
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
