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
      {/* Left side - User Info with Police Logo */}
      {!isSidebarVisible && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-primary/20 rounded-xl p-3 shadow-lg">
          <div className="p-2 rounded-xl bg-primary">
            <img 
              src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
              alt="Palestinian Police Logo" 
              className="h-6 w-6 object-contain"
            />
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-foreground">مرحباً، نور الدين خلاف</div>
            <div className="text-xs text-muted-foreground">مدير النظام</div>
            <div className="text-xs text-muted-foreground">الشرطة الفلسطينية</div>
          </div>
        </div>
      )}

      {/* Right side - Menu Button with Police Logo */}
      {!isSidebarVisible && (
        <div className="fixed top-4 left-4 z-[60] flex items-center gap-3 bg-white/95 backdrop-blur-sm border border-primary/20 rounded-xl p-3 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarVisible(true)}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Menu className="h-4 w-4 text-primary" />
          </Button>
          <span className="text-sm font-semibold text-foreground">الشرطة الفلسطينية</span>
          <div className="p-2 rounded-xl bg-primary">
            <img 
              src="/lovable-uploads/5d8c7245-166d-4337-afbb-639857489274.png" 
              alt="Palestinian Police Logo" 
              className="h-6 w-6 object-contain"
            />
          </div>
        </div>
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

      <main className="flex-1 overflow-auto bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;