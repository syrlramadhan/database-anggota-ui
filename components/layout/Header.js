'use client';

import { Menu, Bell, User, ChevronDown, LogOut, Settings, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import config from '../../config';

export default function Header({ onToggleSidebar, isSidebarOpen }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isLoading, logout } = useAuth();

  const getStatusLabel = (status) => {
    const statusMap = {
      'anggota': 'Anggota',
      'bph': 'BPH',
      'alb': 'ALB',
      'dpo': 'DPO',
      'bp': 'BP'
    };
    return statusMap[status] || status;
  };

  const getUserInitials = (nama) => {
    if (!nama || nama === 'N/A') return 'U';
    return nama.split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getUserPhotoUrl = (foto) => {
    if (!foto || foto === 'N/A' || foto === 'Foto') return null;
    if (foto.startsWith('http')) return foto;
    if (foto.startsWith('/uploads/') || foto.includes('uploads/')) {
      const fileName = foto.replace('/uploads/', '').replace('uploads/', '');
      return config.endpoints.uploads(fileName);
    }
    return config.endpoints.uploads(foto);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <button
            onClick={onToggleSidebar}
            className="hidden lg:block p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Sistem Manajemen Anggota
            </h1>
            <p className="text-sm text-gray-500">
              Kelola data anggota dengan mudah dan efisien
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-md hover:bg-gray-100">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
            >
              {/* User Avatar/Photo */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                {isLoading ? (
                  <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                ) : getUserPhotoUrl(user?.foto) ? (
                  <img
                    src={getUserPhotoUrl(user?.foto)}
                    alt={`Foto ${user?.nama}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {getUserInitials(user?.nama)}
                    </span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-700">
                  {isLoading ? 'Memuat...' : (user?.nama || 'User')}
                </div>
                <div className="text-xs text-gray-500">
                  {isLoading ? '' : getStatusLabel(user?.status_keanggotaan)}
                </div>
              </div>
              
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                      {getUserPhotoUrl(user?.foto) ? (
                        <img
                          src={getUserPhotoUrl(user?.foto)}
                          alt={`Foto ${user?.nama}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {getUserInitials(user?.nama)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user?.nama || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.nra || 'N/A'} • {getStatusLabel(user?.status_keanggotaan)}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {user?.email || 'No email'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <UserIcon className="w-4 h-4 mr-3" />
                    Profil Saya
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings className="w-4 h-4 mr-3" />
                    Pengaturan
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
