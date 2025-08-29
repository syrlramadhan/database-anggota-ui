'use client';

import { Home, Users, Settings, LogOut, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Sidebar({ isOpen, onClose, currentPath }) {
  const router = useRouter();

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, href: '/Dashboard', active: currentPath === '/Dashboard' },
    { name: 'Anggota', icon: Users, href: '/members', active: currentPath === '/members' },
    { name: 'Pengaturan', icon: Settings, href: '/settings', active: currentPath === '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 text-white shadow-2xl shadow-slate-900/50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full relative">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/8 via-transparent to-cyan-600/8 pointer-events-none"></div>
          {/* Header */}
          <div className="relative flex items-center justify-center p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-center group">
              <div className="relative p-2 rounded-xl transition-all duration-300 group-hover:bg-slate-700/30">
                <Image 
                  src="/logo-lanscape.png" 
                  alt="Database Anggota Logo" 
                  width={180}
                  height={45}
                  className="h-12 w-auto filter group-hover:brightness-110 transition-all duration-300"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute right-4 lg:hidden p-2 rounded-md hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                    item.active
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                      : 'text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:text-white hover:shadow-md hover:shadow-slate-900/20 border border-transparent hover:border-slate-600/50'
                  }`}
                  onClick={() => onClose()}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    item.active 
                      ? 'bg-white/20 shadow-inner' 
                      : 'group-hover:bg-white/10'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium relative z-10">{item.name}</span>
                  {item.active && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white/40 rounded-l-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-700/50 relative z-10">
            <button
              onClick={handleLogout}
              className="group flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden text-red-400 hover:text-white hover:bg-gradient-to-r hover:from-red-600/80 hover:to-red-500/80 hover:shadow-lg hover:shadow-red-600/20 border border-transparent hover:border-red-500/30"
            >
              <div className="p-2 rounded-lg transition-all duration-300 group-hover:bg-white/20">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium relative z-10">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
