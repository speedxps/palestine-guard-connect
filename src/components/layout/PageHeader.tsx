import React from 'react';
import { BackButton } from '@/components/BackButton';
import { PrintService } from '@/components/PrintService';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backTo?: string;
  showPrint?: boolean;
  printContent?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  showBackButton = true,
  backTo,
  showPrint = false,
  printContent,
  children,
  className = ''
}) => {
  return (
    <header className={`bg-white border-b border-gray-200 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Police Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow">
              <img 
                src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
                alt="Palestinian Police Logo" 
                className="h-6 w-6 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-arabic">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-gray-600 font-arabic">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {children}
          
          {showPrint && printContent && (
            <PrintService
              title={title}
              content={printContent}
              pageTitle={title}
            />
          )}
          
          {showBackButton && (
            <BackButton to={backTo} />
          )}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;