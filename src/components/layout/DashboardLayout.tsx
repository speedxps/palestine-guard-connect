import React from 'react';
import ModernSidebar from './ModernSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-white" dir="rtl">
      {/* Integrated Sidebar */}
      <div className="flex-shrink-0">
        <ModernSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;