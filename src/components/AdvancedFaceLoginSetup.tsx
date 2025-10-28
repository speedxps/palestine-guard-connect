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
    if (!isOpen) return;

    const loadAndStartCamera = async () => {
      try {
        // Step 1: Load models from CDN
        setStep('loading-models');
        setInstruction('📦 جاري تحميل نماذج التعرف على الوجه...');
        setProgress(5);
        
        console.log('🔄 Starting to load face-api models...');
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        
        console.log('✅ Face-api models loaded successfully');
        setModelsLoaded(true);
        setProgress(15);
        
        // Step 2: Start camera immediately
        console.log('📸 Requesting camera access...');
        setInstruction('📸 جاري فتح الكاميرا الأمامية...');
        setProgress(20);
        
        // Add small delay to show the message
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await startCamera();
        
        console.log('✅ Camera started successfully');
      } catch (error) {
        console.error('❌ Error in setup:', error);
        if (error instanceof Error && error.name === 'NotAllowedError') {
          toast.error('⛔ تم رفض إذن الكاميرا. يرجى السماح بالوصول للكاميرا.');
          setInstruction('⛔ تم رفض إذن الكاميرا');
        } else if (error instanceof Error && error.name === 'NotFoundError') {
          toast.error('⚠️ لم يتم العثور على كاميرا');
          setInstruction('⚠️ لم يتم العثور على كاميرا');
        } else {
          toast.error('❌ فشل في فتح الكاميرا');
          setInstruction('❌ فشل في الوصول للكاميرا');
        }
        setStep('error');
      }
    };

    loadAndStartCamera();

    return () => {
      console.log('🧹 Cleaning up camera and detection...');
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      stopCamera();
    };
  }, [isOpen]);

  // Start camera
  const startCamera = async () => {
    try {
      console.log('📹 Requesting camera access with facingMode: user...');
      
      // Request front-facing camera (selfie camera)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',  // Front camera for selfie
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      });
      
      console.log('✅ Camera stream obtained:', stream.getVideoTracks()[0].getSettings());
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video metadata to load
        await new Promise<void>((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('✅ Video metadata loaded');
              console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
              resolve();
            };
            
            videoRef.current.onerror = (e) => {
              console.error('❌ Video element error:', e);
              reject(new Error('Video playback failed'));
            };
            
            // Timeout after 10 seconds
            setTimeout(() => reject(new Error('Video loading timeout')), 10000);
          }
        });
        
        // Ensure video is playing
        try {
          await videoRef.current.play();
          console.log('✅ Video playing');
        } catch (playError) {
          console.error('❌ Video play error:', playError);
        }
        
        setIsCameraActive(true);
        setStep('capture-front');
        setProgress(30);
        setInstruction(STEPS_CONFIG['capture-front'].instruction);
        toast.success('✅ تم فتح الكاميرا! ضع وجهك في الإطار', { duration: 3000 });
        
        // Start face detection after camera is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        startFaceDetection();
      }
    } catch (error: any) {
      console.error('❌ Camera error:', error);
      
      let errorMessage = '❌ فشل في الوصول للكاميرا';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = '⛔ تم رفض إذن الكاميرا. يرجى السماح بالوصول للكاميرا من إعدادات المتصفح.';
        toast.error(errorMessage, { duration: 5000 });
      } else if (error.name === 'NotFoundError') {
        errorMessage = '⚠️ لم يتم العثور على كاميرا متصلة بالجهاز';
        toast.error(errorMessage, { duration: 5000 });
      } else if (error.name === 'NotReadableError') {
        errorMessage = '⚠️ الكاميرا قيد الاستخدام من تطبيق آخر';
        toast.error(errorMessage, { duration: 5000 });
      } else if (error.message?.includes('timeout')) {
        errorMessage = '⏱️ انتهت مهلة تحميل الكاميرا. حاول مرة أخرى';
        toast.error(errorMessage, { duration: 5000 });
      } else {
        toast.error(errorMessage + ': ' + error.message, { duration: 5000 });
      }
      
      setStep('error');
      setInstruction(errorMessage);
      throw error;
    }
  };

  // Enhanced face detection loop with better accuracy
  const startFaceDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && modelsLoaded && videoRef.current.readyState === 4) {
        try {
          // Use better detection options for improved accuracy
          const detection = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 320,  // Higher resolution for better detection
              scoreThreshold: 0.4  // Lower threshold for easier detection
            })
          ).withFaceLandmarks();

          const wasPreviouslyDetected = faceDetected;
          const isNowDetected = !!detection;
          
          setFaceDetected(isNowDetected);

          // Provide feedback when face detection state changes
          if (!wasPreviouslyDetected && isNowDetected) {
            toast.success('✓ تم اكتشاف الوجه!', { duration: 1500 });
          } else if (wasPreviouslyDetected && !isNowDetected) {
            toast.error('⚠ لم يعد الوجه مرئياً', { duration: 1500 });
          }

          // Draw detection on canvas with enhanced visualization
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
              
              // Draw landmarks with custom styling
              const landmarks = resizedDetection.landmarks.positions;
              ctx.fillStyle = '#22c55e';
              ctx.strokeStyle = '#22c55e';
              ctx.lineWidth = 2;
              
              landmarks.forEach((point) => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                ctx.fill();
              });
              
              // Draw face box
              const box = resizedDetection.detection.box;
              ctx.strokeStyle = '#22c55e';
              ctx.lineWidth = 3;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
            }
          } else if (canvasRef.current) {
            // Clear canvas when no face detected
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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

  // Play capture sound
  const playCaptureSound = () => {
    try {
      // Create a pleasant camera shutter sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
      // Add a second tone for richness
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      oscillator2.frequency.value = 1200;
      oscillator2.type = 'sine';
      gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.08);
    } catch (error) {
      console.log('Could not play capture sound:', error);
    }
  };

  // Capture photo with enhanced feedback
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !faceDetected) {
      toast.error('⚠️ لم يتم اكتشاف وجه. تأكد من وضوح وجهك في الإطار');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw with mirror effect
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
    
    const newImages = [...capturedImages, imageBase64];
    setCapturedImages(newImages);

    // Play capture sound
    playCaptureSound();

    // Visual feedback with flash effect
    if (videoRef.current) {
      const flashOverlay = document.createElement('div');
      flashOverlay.style.position = 'absolute';
      flashOverlay.style.top = '0';
      flashOverlay.style.left = '0';
      flashOverlay.style.width = '100%';
      flashOverlay.style.height = '100%';
      flashOverlay.style.backgroundColor = 'white';
      flashOverlay.style.opacity = '0.8';
      flashOverlay.style.pointerEvents = 'none';
      flashOverlay.style.zIndex = '50';
      videoRef.current.parentElement?.appendChild(flashOverlay);
      setTimeout(() => flashOverlay.remove(), 150);
    }

    // Update checkpoint dots
    const currentStepIndex = getCurrentStepIndex();
    setCheckpointDots(prev => 
      prev.map((dot, idx) => 
        idx === currentStepIndex ? { ...dot, completed: true } : dot
      )
    );

    // Success toast
    toast.success(`✓ تم التقاط الصورة ${newImages.length} من 5`);

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
      
      // Enhanced instruction toast
      toast.info(`📸 ${STEPS_CONFIG[nextStep].title}`, {
        description: STEPS_CONFIG[nextStep].instruction,
        duration: 3000,
      });
      
    } else {
      // All images captured
      setProgress(95);
      toast.success('✅ تم التقاط جميع الصور! جاري المعالجة...');
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-arabic">
            {step === 'success' ? '✅ تم التسجيل بنجاح' : '📸 تسجيل الوجه للدخول السريع'}
          </DialogTitle>
          <DialogDescription className="text-center text-lg font-arabic">
            {instruction}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar with Percentage */}
          <div className="space-y-2">
            <Progress value={progress} className="w-full h-3" />
            <p className="text-center text-sm text-muted-foreground font-arabic">
              {Math.round(progress)}% مكتمل - {capturedImages.length} من 5 صور
            </p>
          </div>

          {/* Camera View with Checkpoint Dots - LARGER SIZE */}
          {(step.startsWith('capture-') || step === 'processing') && (
            <div className="relative w-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/30">
              <div className="relative aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ transform: 'scaleX(-1)' }}
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

              {/* Face Detection Indicator - Enhanced */}
              <div className="absolute top-6 right-6 z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ 
                    scale: faceDetected ? 1.2 : 0.8,
                    opacity: faceDetected ? 1 : 0.5
                  }}
                  transition={{ duration: 0.3 }}
                  className={`p-3 rounded-full shadow-lg backdrop-blur-sm ${
                    faceDetected 
                      ? 'bg-green-500/90 ring-4 ring-green-300/50' 
                      : 'bg-yellow-500/90 ring-4 ring-yellow-300/50'
                  }`}
                >
                  {faceDetected ? (
                    <CheckCircle className="w-7 h-7 text-white" />
                  ) : (
                    <AlertCircle className="w-7 h-7 text-white animate-pulse" />
                  )}
                </motion.div>
              </div>

              {/* Step Instruction Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="text-white text-xl font-bold font-arabic mb-2">
                    {step.startsWith('capture-') && STEPS_CONFIG[step as keyof typeof STEPS_CONFIG]?.title}
                  </p>
                  <p className="text-white/80 text-sm font-arabic">
                    {faceDetected ? '✓ تم اكتشاف الوجه - جاهز للالتقاط' : '⚠ ضع وجهك في الإطار'}
                  </p>
                </motion.div>
              </div>
              </div>
            </div>
          )}

          {/* Captured Images Preview */}
          {capturedImages.length > 0 && step.startsWith('capture-') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <p className="text-sm font-semibold text-center font-arabic">
                الصور الملتقطة ({capturedImages.length}/5)
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                {capturedImages.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-green-500 shadow-lg"
                  >
                    <img 
                      src={`data:image/jpeg;base64,${img}`} 
                      alt={`صورة ${idx + 1}`}
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading Models Step - Enhanced */}
          {step === 'loading-models' && (
            <div className="flex flex-col items-center gap-6 py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Camera className="w-24 h-24 text-primary" />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold font-arabic">
                  جاري التحضير...
                </p>
                <p className="text-muted-foreground font-arabic">
                  سيتم فتح الكاميرا الأمامية تلقائياً
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
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

          {/* Error Step - Enhanced */}
          {step === 'error' && (
            <div className="flex flex-col items-center gap-6 py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <XCircle className="w-24 h-24 text-destructive" />
              </motion.div>
              <div className="text-center space-y-3">
                <p className="text-lg font-semibold text-destructive font-arabic">
                  حدث خطأ أثناء التسجيل
                </p>
                <p className="text-muted-foreground font-arabic">
                  {instruction}
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mt-4">
                  <p className="text-sm font-arabic text-muted-foreground">
                    💡 تأكد من:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 text-right">
                    <li className="font-arabic">• السماح بإذن الكاميرا من المتصفح</li>
                    <li className="font-arabic">• عدم استخدام الكاميرا من تطبيق آخر</li>
                    <li className="font-arabic">• الاتصال بالإنترنت</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex gap-3 pt-2">
            {step.startsWith('capture-') && (
              <>
                <Button 
                  onClick={capturePhoto} 
                  className="flex-1 text-lg py-6 font-arabic shadow-lg"
                  disabled={!faceDetected}
                  size="lg"
                >
                  <Camera className="w-6 h-6 ml-2" />
                  {faceDetected ? '📸 التقاط الآن' : '⏳ في انتظار الوجه...'}
                </Button>
                <Button 
                  onClick={handleClose} 
                  variant="outline"
                  className="py-6 font-arabic"
                  size="lg"
                >
                  إلغاء
                </Button>
              </>
            )}

            {(step === 'error' || step === 'success') && (
              <Button 
                onClick={handleClose} 
                className="w-full py-6 font-arabic"
                size="lg"
              >
                {step === 'error' ? 'إغلاق وإعادة المحاولة' : 'إغلاق'}
              </Button>
            )}

            {step === 'loading-models' && (
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full py-6 font-arabic"
                size="lg"
              >
                إلغاء
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};