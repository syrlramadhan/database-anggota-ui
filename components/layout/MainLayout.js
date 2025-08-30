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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Sidebar */}
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            currentPath={pathname}
          />
          
          {/* Main Content - with left margin for fixed sidebar on desktop */}
          <div className="lg:ml-64 flex flex-col min-h-screen">
            {/* Header */}
            <Header 
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
            />
            
            {/* Content */}
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
            
            {/* Footer */}
            <Footer />
          </div>
          
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      </NotificationProvider>
    </AuthGuard>
  );
}
