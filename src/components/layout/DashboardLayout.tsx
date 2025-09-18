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
    <div className="flex h-screen bg-white" dir="rtl">
      {/* Menu button - Always visible */}
      <div className="fixed top-4 right-4 z-[60]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarVisible(true)}
          className={`p-3 hover:bg-primary/10 rounded-xl transition-colors bg-white/95 backdrop-blur-sm border border-primary/20 shadow-lg ${
            isSidebarVisible ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <Menu className="h-4 w-4 text-primary" />
        </Button>
      </div>

      {/* Sidebar Overlay and Container */}
      {isSidebarVisible && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40" 
            onClick={() => setIsSidebarVisible(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full z-50 animate-in slide-in-from-right duration-300">
            <ModernSidebar onClose={() => setIsSidebarVisible(false)} />
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;