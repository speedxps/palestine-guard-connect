import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <ShieldAlert className="h-20 w-20 text-red-500 mx-auto" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4 font-arabic">
          الوصول محظور
        </h1>
        
        <p className="text-gray-600 mb-6 font-arabic text-lg">
          هذه الصفحة مخصصة للضباط المعتمدين في هذا القسم فقط
        </p>
        
        <div className="border-t border-gray-200 pt-6 mb-6">
          <p className="text-sm text-gray-500 mb-2">
            Access Restricted to Authorized Officers Only
          </p>
        </div>
        
        <Button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-primary hover:bg-primary/90 text-white font-arabic"
        >
          العودة للصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
