import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import * as faceapi from 'face-api.js';

interface AdvancedFaceLoginSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type SetupStep = 'loading-models' | 'capture-front' | 'capture-left' | 'capture-right' | 'capture-up' | 'capture-down' | 'processing' | 'success' | 'error';

interface CheckpointDot {
  id: number;
  angle: number;
  completed: boolean;
}

const STEPS_CONFIG = {
  'capture-front': { title: 'انظر مباشرة للكاميرا', instruction: 'حافظ على وجهك في الإطار', angle: 0 },
  'capture-left': { title: 'أدر رأسك قليلاً لليسار', instruction: 'ببطء، أدر رأسك 30 درجة يساراً', angle: 60 },
  'capture-right': { title: 'أدر رأسك قليلاً لليمين', instruction: 'ببطء، أدر رأسك 30 درجة يميناً', angle: 120 },
  'capture-up': { title: 'ارفع رأسك قليلاً', instruction: 'انظر للأعلى قليلاً', angle: 180 },
  'capture-down': { title: 'اخفض رأسك قليلاً', instruction: 'انظر للأسفل قليلاً', angle: 240 }
};

export const AdvancedFaceLoginSetup = ({ isOpen, onClose, onSuccess }: AdvancedFaceLoginSetupProps) => {
  const [step, setStep] = useState<SetupStep>('loading-models');
  const [progress, setProgress] = useState(0);
  const [instruction, setInstruction] = useState('جاري التحضير...');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [checkpointDots, setCheckpointDots] = useState<CheckpointDot[]>([
    { id: 0, angle: 0, completed: false },
    { id: 1, angle: 60, completed: false },
    { id: 2, angle: 120, completed: false },
    { id: 3, angle: 180, completed: false },
    { id: 4, angle: 240, completed: false },
    { id: 5, angle: 300, completed: false }
  ]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load face-api models and start camera automatically
  useEffect(() => {
    const loadModels = async () => {
      try {
        setInstruction('جاري تحميل نماذج التعرف على الوجه...');
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        
        setModelsLoaded(true);
        setProgress(10);
        
        // Start camera immediately after models load
        setInstruction('📸 جاري فتح الكاميرا...');
        await startCamera();
      } catch (error) {
        console.error('Error loading face-api models:', error);
        toast.error('فشل تحميل نماذج التعرف على الوجه');
        setStep('error');
      }
    };

    if (isOpen) {
      loadModels();
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      stopCamera();
    };
  }, [isOpen]);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setStep('capture-front');
        setProgress(20);
        setInstruction(STEPS_CONFIG['capture-front'].instruction);
        
        // Start face detection
        startFaceDetection();
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('فشل في الوصول للكاميرا');
      setStep('error');
    }
  };

  // Face detection loop
  const startFaceDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && modelsLoaded && videoRef.current.readyState === 4) {
        try {
          const detection = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks();

          setFaceDetected(!!detection);

          // Draw detection on canvas
          if (canvasRef.current && detection) {
            const canvas = canvasRef.current;
            const displaySize = { 
              width: videoRef.current.videoWidth, 
              height: videoRef.current.videoHeight 
            };
            faceapi.matchDimensions(canvas, displaySize);
            const resizedDetection = faceapi.resizeResults(detection, displaySize);
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
            }
          }
        } catch (error) {
          console.error('Face detection error:', error);
        }
      }
    }, 100);
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    setIsCameraActive(false);
  };

  // Capture photo
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !faceDetected) {
      toast.error('لم يتم اكتشاف وجه. تأكد من وضوح وجهك في الإطار');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    
    const newImages = [...capturedImages, imageBase64];
    setCapturedImages(newImages);

    // Update checkpoint dots
    const currentStepIndex = getCurrentStepIndex();
    setCheckpointDots(prev => 
      prev.map((dot, idx) => 
        idx === currentStepIndex ? { ...dot, completed: true } : dot
      )
    );

    // Move to next step
    moveToNextStep(newImages.length);
  };

  const getCurrentStepIndex = (): number => {
    const stepMap: Record<string, number> = {
      'capture-front': 0,
      'capture-left': 1,
      'capture-right': 2,
      'capture-up': 3,
      'capture-down': 4
    };
    return stepMap[step] || 0;
  };

  const moveToNextStep = (imagesCount: number) => {
    const steps: SetupStep[] = ['capture-front', 'capture-left', 'capture-right', 'capture-up', 'capture-down'];
    const currentIndex = steps.indexOf(step as any);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setStep(nextStep);
      setInstruction(STEPS_CONFIG[nextStep].instruction);
      setProgress(20 + (imagesCount * 15));
      
      // Play success sound (optional)
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
      audio.volume = 0.3;
      audio.play().catch(() => {});
      
    } else {
      // All images captured
      setProgress(95);
      processFaceData(capturedImages);
    }
  };

  // Process face data
  const processFaceData = async (images: string[]) => {
    stopCamera();
    setStep('processing');
    setInstruction('جاري معالجة بيانات الوجه...');
    setProgress(95);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Send all 5 images to edge function
      const { data, error } = await supabase.functions.invoke('save-face-data', {
        body: { 
          userId: user.id,
          images: images // Send all 5 images
        }
      });

      if (error) throw error;

      setStep('success');
      setProgress(100);
      setInstruction('تم تسجيل وجهك بنجاح! 🎉');
      
      toast.success('تم تفعيل تسجيل الدخول بالوجه');
      
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error('Face data processing error:', error);
      toast.error('فشل في حفظ بيانات الوجه');
      setStep('error');
      setInstruction('حدث خطأ. حاول مرة أخرى');
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImages([]);
    setStep('loading-models');
    setProgress(0);
    setCheckpointDots(prev => prev.map(dot => ({ ...dot, completed: false })));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {step === 'success' ? '✅ تم التسجيل بنجاح' : '🎭 تسجيل الوجه'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {instruction}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          <Progress value={progress} className="w-full" />

          {/* Camera View with Checkpoint Dots */}
          {(step.startsWith('capture-') || step === 'processing') && (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />
              
              {/* Animated Circle Frame */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <svg width="300" height="300" viewBox="0 0 300 300" className="absolute">
                  {/* Main circle */}
                  <motion.circle
                    cx="150"
                    cy="150"
                    r="140"
                    fill="none"
                    stroke={faceDetected ? "#22c55e" : "#3b82f6"}
                    strokeWidth="3"
                    strokeDasharray="10 5"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Checkpoint dots */}
                  {checkpointDots.map((dot) => {
                    const angle = (dot.angle * Math.PI) / 180;
                    const x = 150 + 140 * Math.cos(angle - Math.PI / 2);
                    const y = 150 + 140 * Math.sin(angle - Math.PI / 2);
                    
                    return (
                      <motion.circle
                        key={dot.id}
                        cx={x}
                        cy={y}
                        r={dot.completed ? "10" : "6"}
                        fill={dot.completed ? "#22c55e" : "#60a5fa"}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: dot.id * 0.1 }}
                      />
                    );
                  })}
                </svg>
              </motion.div>

              {/* Face Detection Indicator */}
              <div className="absolute top-4 right-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ 
                    scale: faceDetected ? 1.2 : 0.8,
                    opacity: faceDetected ? 1 : 0.5
                  }}
                  transition={{ duration: 0.3 }}
                  className={`p-2 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-yellow-500'}`}
                >
                  {faceDetected ? <CheckCircle className="w-6 h-6 text-white" /> : <AlertCircle className="w-6 h-6 text-white" />}
                </motion.div>
              </div>
            </div>
          )}

          {/* Loading Models Step */}
          {step === 'loading-models' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Camera className="w-20 h-20 text-primary" />
              </motion.div>
              <p className="text-center text-muted-foreground">
                جاري التحضير... سيتم فتح الكاميرا تلقائياً
              </p>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Camera className="w-20 h-20 text-primary" />
              </motion.div>
              <p className="text-center text-muted-foreground">
                جاري معالجة صورك وإنشاء نموذج التعرف على الوجه...
              </p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <CheckCircle className="w-20 h-20 text-green-500" />
              <p className="text-center text-lg font-semibold">
                تم تسجيل وجهك بنجاح! يمكنك الآن استخدام تسجيل الدخول بالوجه
              </p>
            </motion.div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <XCircle className="w-20 h-20 text-destructive" />
              <p className="text-center text-muted-foreground">
                حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {step.startsWith('capture-') && (
              <>
                <Button 
                  onClick={capturePhoto} 
                  className="flex-1"
                  disabled={!faceDetected}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  التقاط الصورة
                </Button>
                <Button onClick={handleClose} variant="outline">
                  إلغاء
                </Button>
              </>
            )}

            {(step === 'error' || step === 'success') && (
              <Button onClick={handleClose} className="w-full">
                إغلاق
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};