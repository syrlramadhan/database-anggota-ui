'use client';

import { Home, Users, Settings, LogOut, X, ChevronDown, User, Database } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar({ isOpen, onClose, currentPath }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedSettings, setExpandedSettings] = useState(false);
  
  // Get current tab directly from searchParams
  const currentTab = currentPath?.startsWith('/settings') ? 
    (searchParams.get('tab') === 'backup' ? 'backup' : 'profile') : 
    'profile';
  
  // Auto-expand settings when on settings page
  useEffect(() => {
    if (currentPath?.startsWith('/settings')) {
      setExpandedSettings(true);
    }
  }, [currentPath]);

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, href: '/Dashboard', active: currentPath === '/Dashboard' },
    { name: 'Anggota', icon: Users, href: '/members', active: currentPath === '/members' },
    { 
      name: 'Pengaturan', 
      icon: Settings, 
      href: '/settings', 
      active: currentPath?.startsWith('/settings'),
      hasSubmenu: true,
      submenu: [
        { 
          name: 'Edit Profil', 
          icon: User, 
          href: '/settings', 
          // Active jika di settings DAN currentTab adalah 'profile'
          active: currentPath?.startsWith('/settings') && currentTab === 'profile'
        },
        { 
          name: 'Backup Data', 
          icon: Database, 
          href: '/settings?tab=backup', 
          // Active jika di settings DAN currentTab adalah 'backup'
          active: currentPath?.startsWith('/settings') && currentTab === 'backup'
        }
      ]
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-100 shadow-sm transform transition-all duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center p-6 border-b border-gray-100">
            <Image 
              src="/logo-lanscape.png" 
              alt="Database Anggota Logo" 
              width={180}
              height={45}
              className="h-10 w-auto"
              priority
            />
            <button
              onClick={onClose}
              className="absolute right-4 lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-6 space-y-2">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              
              if (item.hasSubmenu) {
                return (
                  <div key={item.name} className="space-y-1">
                    {/* Main menu item with submenu */}
                    <button
                      onClick={() => setExpandedSettings(!expandedSettings)}
                      className={`group flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                        item.active
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        item.active 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          item.active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                        }`} />
                      </div>
                      
                      <span className={`font-medium text-sm flex-1 text-left ${
                        item.active ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {item.name}
                      </span>
                      
                      <div className={`transition-transform duration-200 ${expandedSettings ? 'rotate-180' : ''}`}>
                        <ChevronDown className={`w-4 h-4 ${
                          item.active ? 'text-white/80' : 'text-gray-400'
                        }`} />
                      </div>
                    </button>
                    
                    {/* Submenu items */}
                    {expandedSettings && (
                      <div className="mt-2 ml-2 space-y-1 pl-4 border-l-2 border-gray-100">
                        {item.submenu.map((subItem, subIndex) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                subItem.active
                                  ? 'bg-blue-50 text-blue-700 border-l-3 border-blue-500 shadow-sm'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                              onClick={() => onClose()}
                            >
                              <div className={`p-1.5 rounded-md transition-all duration-200 ${
                                subItem.active 
                                  ? 'bg-blue-100 shadow-sm' 
                                  : 'bg-gray-100 group-hover:bg-gray-200'
                              }`}>
                                <SubIcon className={`w-4 h-4 ${
                                  subItem.active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                                }`} />
                              </div>
                              
                              <span className={`font-medium text-sm ${
                                subItem.active ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                              }`}>
                                {subItem.name}
                              </span>
                              
                              {/* Active indicator dot */}
                              {subItem.active && (
                                <div className="ml-auto">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              // Regular menu items without submenu
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    item.active
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => onClose()}
                >
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    item.active 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      item.active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                  </div>
                  
                  <span className={`font-medium text-sm ${
                    item.active ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="group flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 text-red-500 hover:text-white hover:bg-red-500"
            >
              <div className="p-2 rounded-lg bg-red-50 group-hover:bg-white/20 transition-all duration-200">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">Keluar</span>
            </button>
            
            {/* Footer info */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                © 2025 Database Anggota
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
