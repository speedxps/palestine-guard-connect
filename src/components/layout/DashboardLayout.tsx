import React, { useState } from 'react';
import ModernSidebar from './ModernSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      {/* Toggle Button for Mobile/Hidden Sidebar */}
      {!isSidebarVisible && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarVisible(true)}
          className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border-primary/20"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}

      {/* Sidebar - Hidden by default */}
      {isSidebarVisible && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setIsSidebarVisible(false)}
          />
          {/* Sidebar */}
          <div className="fixed lg:relative z-50">
            <ModernSidebar onClose={() => setIsSidebarVisible(false)} />
          </div>
        </>
      )}

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;