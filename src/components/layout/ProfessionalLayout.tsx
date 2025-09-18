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
    <div className={`min-h-screen bg-gray-50 ${className}`}>
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
      
      <main className="container mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[calc(100vh-200px)]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ProfessionalLayout;