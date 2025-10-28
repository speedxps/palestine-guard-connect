import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import * as faceapi from 'face-api.js';
import { useFaceLogin } from '@/hooks/useFaceLogin';

interface AdvancedFaceLoginVerifyProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type VerifyStep = 'loading-models' | 'camera-opening' | 'ready' | 'countdown' | 'capturing' | 'verifying' | 'success' | 'error';

export const AdvancedFaceLoginVerify = ({ isOpen, onClose, onSuccess }: AdvancedFaceLoginVerifyProps) => {
  const [step, setStep] = useState<VerifyStep>('loading-models');
  const [instruction, setInstruction] = useState('جاري التحضير...');
  const [countdown, setCountdown] = useState(3);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { verifyFaceAndLogin, isVerifying } = useFaceLogin();

  // Load models and start camera
  useEffect(() => {
    if (!isOpen) return;

    const loadAndStartCamera = async () => {
      try {
        setStep('loading-models');
        setInstruction('جاري تحميل نماذج التعرف على الوجه...');
        
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        
        setModelsLoaded(true);
        
        // Start camera
        setStep('camera-opening');
        setInstruction('جاري فتح الكاميرا...');
        await startCamera();
      } catch (error) {
        console.error('Error in setup:', error);
        if (error instanceof Error && error.name === 'NotAllowedError') {
          toast.error('تم رفض إذن الكاميرا');
        } else {
          toast.error('فشل في فتح الكاميرا');
        }
        setStep('error');
        setInstruction('فشل في الوصول للكاميرا');
      }
    };

    loadAndStartCamera();

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          }
        });
        
        setIsCameraActive(true);
        setStep('ready');
        setInstruction('ضع وجهك في الإطار');
        toast.success('انظر للكاميرا مباشرة 📸');
        
        startFaceDetection();
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('تم رفض إذن الكاميرا');
      } else if (error.name === 'NotFoundError') {
        toast.error('لم يتم العثور على كاميرا');
      } else {
        toast.error('فشل في الوصول للكاميرا');
      }
      
      setStep('error');
      setInstruction('فشل في فتح الكاميرا');
      throw error;
    }
  };

  const startFaceDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        const canvas = canvasRef.current;
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        };

        faceapi.matchDimensions(canvas, displaySize);

        if (detection) {
          const resizedDetection = faceapi.resizeResults(detection, displaySize);
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
          }

          if (!faceDetected && step === 'ready') {
            setFaceDetected(true);
            toast.success('تم اكتشاف الوجه! ✓');
            startCountdown();
          }
        } else {
          setFaceDetected(false);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }, 100);
  };

  const startCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    setStep('countdown');
    let count = 3;
    setCountdown(count);

    countdownIntervalRef.current = setInterval(() => {
      count--;
      setCountdown(count);

      if (count === 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        captureAndVerify();
      }
    }, 1000);
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setStep('capturing');
      setInstruction('جاري التقاط الصورة...');

      // Stop detection
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }

      // Capture image
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Failed to get canvas context');
      
      ctx.drawImage(videoRef.current, 0, 0);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];

      // Stop camera
      stopCamera();

      // Verify
      setStep('verifying');
      setInstruction('جاري التحقق من الوجه...');

      const result = await verifyFaceAndLogin(imageBase64);

      if (result.success) {
        setStep('success');
        setInstruction('تم التحقق بنجاح!');
        toast.success('مرحباً بك! 👋');
        
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setStep('error');
        setInstruction('فشل التحقق من الوجه');
        toast.error(result.error || 'لم يتم التعرف على الوجه');
      }
    } catch (error) {
      console.error('Capture and verify error:', error);
      setStep('error');
      setInstruction('حدث خطأ أثناء التحقق');
      toast.error('فشل في التحقق من الوجه');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleClose = () => {
    stopCamera();
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10">
          {/* Header */}
          <div className="p-6 border-b border-border/50">
            <h2 className="text-2xl font-bold text-center mb-2">
              التحقق من الوجه
            </h2>
            <p className="text-center text-muted-foreground text-sm">
              {instruction}
            </p>
          </div>

          {/* Camera View */}
          <div className="relative aspect-video bg-black">
            {step === 'loading-models' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Camera className="w-16 h-16 text-primary mb-4" />
                </motion.div>
                <p className="text-white text-lg">جاري التحضير...</p>
              </div>
            )}

            {step === 'camera-opening' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                <p className="text-white text-lg">جاري فتح الكاميرا...</p>
              </div>
            )}

            {(step === 'ready' || step === 'countdown') && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />

                {/* Animated Circle Frame */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className={`w-64 h-64 rounded-full border-4 ${
                      faceDetected ? 'border-green-500' : 'border-primary'
                    } relative`}
                    animate={faceDetected ? {
                      boxShadow: [
                        '0 0 20px rgba(34, 197, 94, 0.5)',
                        '0 0 40px rgba(34, 197, 94, 0.8)',
                        '0 0 20px rgba(34, 197, 94, 0.5)',
                      ]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {/* Corner markers */}
                    <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                    <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
                  </motion.div>
                </motion.div>

                {/* Countdown */}
                <AnimatePresence>
                  {step === 'countdown' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <motion.div
                        key={countdown}
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="text-9xl font-bold text-white drop-shadow-2xl"
                      >
                        {countdown}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {(step === 'capturing' || step === 'verifying') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                <p className="text-white text-lg">{instruction}</p>
              </div>
            )}

            {step === 'success' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  <CheckCircle2 className="w-24 h-24 text-green-500 mb-4" />
                </motion.div>
                <p className="text-white text-2xl font-bold">تم التحقق بنجاح!</p>
              </motion.div>
            )}

            {step === 'error' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/20"
              >
                <XCircle className="w-24 h-24 text-red-500 mb-4" />
                <p className="text-white text-xl font-bold mb-2">فشل التحقق</p>
                <p className="text-white/80 text-sm">{instruction}</p>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="mt-4"
                >
                  إغلاق
                </Button>
              </motion.div>
            )}
          </div>

          {/* Status indicator */}
          {(step === 'ready' || step === 'countdown') && (
            <div className="p-4 border-t border-border/50">
              <div className="flex items-center justify-center gap-2">
                {faceDetected ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 rounded-full bg-green-500"
                    />
                    <span className="text-sm text-green-500 font-medium">
                      تم اكتشاف الوجه ✓
                    </span>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      ضع وجهك في الإطار...
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
