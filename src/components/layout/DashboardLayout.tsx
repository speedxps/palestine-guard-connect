import React, { useState } from 'react';
import ModernSidebar from './ModernSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-white overflow-hidden" dir="rtl">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 right-4 z-50 bg-white shadow-md hover:bg-gray-50"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar - Desktop: Fixed, Mobile: Overlay */}
      {isMobile ? (
        <ModernSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      ) : (
        /* Desktop Sidebar */
        <ModernSidebar open={true} onOpenChange={() => {}} />
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-auto bg-gray-50 h-screen ${
        isMobile ? 'w-full' : ''
      }`}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;