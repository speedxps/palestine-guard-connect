import React, { useState } from 'react';
import ModernSidebar from './ModernSidebar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background" dir="rtl">
      {/* Mobile/Hidden Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        transition-transform duration-300 ease-in-out 
        fixed lg:static lg:block z-50 h-full
        ${!sidebarOpen ? 'lg:w-0 lg:overflow-hidden' : 'lg:w-64'}
      `}>
        <ModernSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {/* Header with Menu Toggle */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
                alt="Palestinian Police Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="font-arabic font-semibold text-foreground">
                الشرطة الفلسطينية
              </span>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;