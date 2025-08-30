'use client';

import { useState, useEffect } from 'react';
import { Menu, User, ChevronDown, UserIcon, Settings, Bell, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import ProfileModal from '../members/ProfileModal';
import config from '../../config';

export default function Header({ onToggleSidebar, isSidebarOpen }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, isLoading } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    acceptStatusChange, 
    rejectStatusChange, 
    markAsRead,
    fetchNotifications,
    fetchUnreadCount,
    loading
  } = useNotifications();

  // Debug logging
  useEffect(() => {
    console.log('Header - Notifications:', notifications);
    console.log('Header - Unread count:', unreadCount);
    console.log('Header - Loading:', loading);
  }, [notifications, unreadCount, loading]);

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

  const handleOpenProfile = () => {
    setShowProfileModal(true);
    setShowDropdown(false);
  };

  const handleAcceptStatusChange = async (requestId) => {
    try {
      await acceptStatusChange(requestId);
      // Refresh to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Failed to accept status change:', error);
    }
  };

  const handleRejectStatusChange = async (requestId) => {
    try {
      await rejectStatusChange(requestId);
    } catch (error) {
      console.error('Failed to reject status change:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      if (!event.target.closest('.user-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 shadow-sm lg:ml-0">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Hamburger button - hanya untuk mobile */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
              Sistem Manajemen Anggota
            </h1>
            <p className="text-sm text-gray-500 hidden sm:block">
              Kelola data anggota dengan mudah dan efisien
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative notification-dropdown">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <p className="text-sm text-gray-500">{unreadCount} notifikasi belum dibaca</p>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        await fetchNotifications();
                        await fetchUnreadCount();
                      }}
                      className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                      title="Refresh notifikasi"
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Tidak ada notifikasi</p>
                    {/* Debug info */}
                    <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
                      <p><strong>Debug Info:</strong></p>
                      <p>Notifications count: {notifications.length}</p>
                      <p>Current user: {user?.nama || 'Unknown'}</p>
                      <p>User ID: {user?.id || 'Unknown'}</p>
                      <p>Loading: {loading ? 'Yes' : 'No'}</p>
                      <p>Unread count: {unreadCount}</p>
                      <button 
                        onClick={() => {
                          console.log('Manual fetch triggered');
                          fetchNotifications();
                        }}
                        className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs mr-2"
                      >
                        Force Fetch
                      </button>
                      <button 
                        onClick={() => {
                          console.log('=== CURRENT STATE DEBUG ===');
                          console.log('Notifications array:', notifications);
                          console.log('Notifications length:', notifications.length);
                          console.log('Unread count:', unreadCount);
                          console.log('Loading:', loading);
                          console.log('User:', user);
                          console.log('=== END DEBUG ===');
                        }}
                        className="mt-2 px-2 py-1 bg-green-500 text-white rounded text-xs"
                      >
                        Log State
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id_notification}
                        className={`px-4 py-3 border-b border-gray-50 ${
                          !notification.read_at ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              {!notification.read_at && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Dari: {notification.from_member?.nama || 'System'} • {new Date(notification.created_at).toLocaleString('id-ID')}
                            </p>
                            
                            {notification.pending && (
                              <div className="flex items-center space-x-2 mt-3">
                                <button
                                  onClick={() => handleAcceptStatusChange(notification.metadata?.request_id)}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Terima
                                </button>
                                <button
                                  onClick={() => handleRejectStatusChange(notification.metadata?.request_id)}
                                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Tolak
                                </button>
                              </div>
                            )}
                            
                            {!notification.pending && notification.accepted !== undefined && (
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  notification.accepted
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {notification.accepted ? '✓ Diterima' : '✗ Ditolak'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {!notification.read_at && (
                            <button
                              onClick={() => markAsRead(notification.id_notification)}
                              className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                            >
                              Tandai sudah dibaca
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative user-dropdown">
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
                      const fallback = e.target.nextSibling;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.nextSibling;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
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
                  <button 
                    onClick={handleOpenProfile}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserIcon className="w-4 h-4 mr-3" />
                    Edit Profil Saya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
}
