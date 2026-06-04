import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Initialize from localStorage, default to true if not set
    const stored = localStorage.getItem('sidebarOpen');
    return stored !== null ? JSON.parse(stored) : window.innerWidth >= 768;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from localStorage, default to false if not set
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored !== null ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist sidebarOpen to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Persist sidebarCollapsed to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const userRole = user?.role?.toLowerCase() || 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-40">
        <Header
          showMenuButton={true}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      <div className="flex flex-1 mt-16">
        {/* Sidebar - Fixed on left */}
        <div className={`hidden md:flex fixed left-0 top-16 bottom-0 z-30 mt-1 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <Sidebar
            isOpen={!sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((c: boolean) => !c)}
            userRole={userRole}
          />
        </div>

        {/* Mobile Sidebar - Only render when open */}
        {sidebarOpen && (
          <>
            <div className="md:hidden fixed top-16 left-0 right-0 bottom-0 z-40 backdrop-blur-sm bg-black/10" onClick={() => setSidebarOpen(false)} />
            <div className="md:hidden fixed right-0 top-16 bottom-0 z-50 mt-1 w-64 shadow-2xl">
              <Sidebar isOpen={true} onToggle={() => setSidebarOpen(false)} userRole={userRole} />
            </div>
          </>
        )}

        {/* Page Content - Scrollable with sidebar offset */}
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} p-4 md:p-6 overflow-auto`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
