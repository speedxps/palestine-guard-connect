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
    <header className={`bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Police Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow flex-shrink-0">
              <img 
                src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
                alt="Palestinian Police Logo" 
                className="h-4 w-4 sm:h-6 sm:w-6 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 font-arabic break-words">
                {title}
              </h1>
              {description && (
                <p className="text-xs sm:text-sm text-gray-600 font-arabic line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
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