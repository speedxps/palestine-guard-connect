import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  title?: string;
  className?: string;
  showHomeButton?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  title = 'رجوع', 
  className = '',
  showHomeButton = true
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={handleBack}
        className={`flex items-center gap-2 font-arabic bg-white border-primary/20 hover:bg-primary/5 text-foreground ${className}`}
      >
        <ArrowRight className="h-4 w-4" />
        {title}
      </Button>
      
      {showHomeButton && (
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 font-arabic bg-white border-primary/20 hover:bg-primary/5 text-foreground"
          title="الصفحة الرئيسية"
        >
          <Home className="h-4 w-4" />
          الرئيسية
        </Button>
      )}
    </div>
  );
};

export default BackButton;