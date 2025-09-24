import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';

interface FaceLoginButtonProps {
  onSuccess: () => void;
}

const FaceLoginButton: React.FC<FaceLoginButtonProps> = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { verifyFace, isLoading } = useFaceRecognition();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast.error('فشل في تشغيل الكاميرا');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsVerifying(true);
    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      context?.drawImage(videoRef.current, 0, 0);
      
      const imageBase64 = canvas.toDataURL('image/jpeg');
      const result = await verifyFace(imageBase64);
      
      if (result.success) {
        toast.success('تم التحقق بنجاح');
        stopCamera();
        setIsOpen(false);
        onSuccess();
      } else {
        toast.error('فشل في التحقق من الوجه');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء التحقق');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <Camera className="h-4 w-4 mr-2" />
        تسجيل الدخول بالوجه
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>التحقق من الوجه</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!stream ? (
              <Button onClick={startCamera}>تشغيل الكاميرا</Button>
            ) : (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={captureAndVerify} 
                    disabled={isVerifying || isLoading}
                    className="flex-1"
                  >
                    {isVerifying ? 'جاري التحقق...' : 'التحقق من الوجه'}
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FaceLoginButton;