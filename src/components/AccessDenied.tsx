import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';

interface AccessDeniedProps {
  message?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  message = "ليس لديك صلاحية للوصول إلى هذه الصفحة. يرجى التواصل مع المسؤول." 
}) => {
  const navigate = useNavigate();

  return (
    <div className="mobile-container">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="glass-card p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">الوصول مرفوض</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {message}
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للوحة الرئيسية
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AccessDenied;