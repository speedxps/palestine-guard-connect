import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Check, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FaceUploadSetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const FaceUploadSetup = ({ onSuccess, onCancel }: FaceUploadSetupProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة فقط');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageBase64 = e.target?.result as string;
      
      // Compress image if needed
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const maxHeight = 600;
        
        let width = img.width;
        let height = img.height;
        
        // Scale down if needed
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          console.log('📸 Compressed image size:', compressedImage.length, 'chars');
          setSelectedImage(compressedImage);
        }
      };
      img.src = imageBase64;
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('المستخدم غير مسجل الدخول');

      console.log('🔄 إرسال الصورة لتسجيل الوجه...');
      
      const { data, error } = await supabase.functions.invoke('process-face-registration', {
        body: { userId: user.id, imageBase64: selectedImage }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'فشل في تسجيل الوجه');

      console.log('✅ تم تسجيل الوجه بنجاح!');
      toast.success('تم تسجيل الوجه بنجاح! 🎉');
      onSuccess?.();
      
    } catch (error) {
      console.error('❌ خطأ في تسجيل الوجه:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في تسجيل الوجه');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">رفع صورة الوجه</h3>
        <p className="text-sm text-muted-foreground">
          اختر صورة واضحة لوجهك من جهازك
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {!selectedImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <ImageIcon className="w-16 h-16 text-muted-foreground" />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              size="lg" 
              className="gap-2"
            >
              <Upload className="w-5 h-5" />
              اختيار صورة
            </Button>
            <p className="text-xs text-muted-foreground">
              JPG, PNG أو JPEG (حتى 5 ميجابايت)
            </p>
          </div>
        ) : (
          <img
            src={selectedImage}
            alt="Selected face"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex gap-2 justify-center">
        {selectedImage && !isProcessing && (
          <>
            <Button onClick={handleRegister} size="lg" className="gap-2">
              <Check className="w-5 h-5" />
              تأكيد وحفظ
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
              <X className="w-5 h-5" />
              اختيار صورة أخرى
            </Button>
          </>
        )}

        {isProcessing && (
          <Button disabled size="lg" className="gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري المعالجة...
          </Button>
        )}

        {!selectedImage && onCancel && (
          <Button onClick={onCancel} variant="outline" size="lg">
            إلغاء
          </Button>
        )}
      </div>
    </div>
  );
};
