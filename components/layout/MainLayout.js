'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import AuthGuard from '../AuthGuard';
import { NotificationProvider } from '../../hooks/useNotifications';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <AuthGuard>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Sidebar */}
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            currentPath={pathname}
          />
          
          {/* Main Content - with left margin for fixed sidebar on desktop */}
          <div className="lg:ml-72 flex flex-col min-h-screen">
            {/* Header */}
            <Header 
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
            />
            
            {/* Content */}
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            
            {/* Footer */}
            <Footer />
          </div>
          
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 z-30 lg:hidden transition-all duration-300"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      </NotificationProvider>
    </AuthGuard>
  );
}
