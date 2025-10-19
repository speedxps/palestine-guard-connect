import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  title?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  title = 'رجوع', 
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      // Always go back one page in browser history
      navigate(-1);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleBack}
      className={`flex items-center gap-2 font-arabic bg-white border-primary/20 hover:bg-primary/5 text-foreground ${className}`}
    >
      <ArrowRight className="h-4 w-4" />
      {title}
    </Button>
  );
};

export default BackButton;