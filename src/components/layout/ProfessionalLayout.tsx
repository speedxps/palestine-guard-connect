import React from 'react';
import PageHeader from '@/components/layout/PageHeader';

interface ProfessionalLayoutProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backTo?: string;
  showPrint?: boolean;
  printContent?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ProfessionalLayout: React.FC<ProfessionalLayoutProps> = ({
  title,
  description,
  showBackButton = true,
  backTo,
  showPrint = false,
  printContent,
  headerActions,
  children,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 w-full overflow-x-hidden ${className}`}>
      <PageHeader
        title={title}
        description={description}
        showBackButton={showBackButton}
        backTo={backTo}
        showPrint={showPrint}
        printContent={printContent}
      >
        {headerActions}
      </PageHeader>
      
      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-200px)] overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 w-full">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalLayout;