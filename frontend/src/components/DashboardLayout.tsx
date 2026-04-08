import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const userRole = user?.role?.toLowerCase() || 'admin';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Header 
          showMenuButton={true} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
      </div>
      
      <div className="flex flex-1 mt-16">
        {/* Sidebar - Fixed on left */}
        <div className="hidden md:block fixed left-0 top-16 bottom-0 z-30">
          <Sidebar isOpen={true} userRole={userRole} />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full">
              <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} userRole={userRole} />
            </div>
          </div>
        )}

        {/* Page Content - Scrollable with sidebar offset */}
        <main className="flex-1 md:ml-64 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
