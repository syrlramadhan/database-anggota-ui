'use client';

import { useState, useEffect, useCallback } from 'react';
import { Menu, ChevronDown, Bell, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useRouter } from 'next/navigation';
import config from '../../config';

export default function Header({ onToggleSidebar, isSidebarOpen }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const { user, isLoading, refetch } = useAuth();
  const router = useRouter();
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

  // Force refresh user data
  const forceUserRefresh = useCallback(async () => {
    console.log('Force refreshing user data...');
    setForceRefresh(prev => prev + 1);
    if (refetch) {
      await refetch();
    }
  }, [refetch]);

  // Listen untuk semua jenis update data
  useEffect(() => {
    const handleDataUpdate = async (event) => {
      console.log('Data update detected in header:', event.detail || event.type);
      await forceUserRefresh();
    };

    const handleStorageChange = async (event) => {
      // Listen untuk berbagai jenis update dari localStorage
      const updateKeys = [
        'data_updated',
        'user_updated', 
        'member_updated',
        'profile_updated',
        'user_photo_updated',
        'notification_updated'
      ];

      if (updateKeys.includes(event.key)) {
        console.log('Storage change detected in header:', event.key);
        await forceUserRefresh();
      }
    };

    const handleVisibilityChange = async () => {
      // Refresh data ketika user kembali ke tab
      if (!document.hidden) {
        console.log('Tab became visible, refreshing data...');
        await forceUserRefresh();
        await fetchNotifications();
        await fetchUnreadCount();
      }
    };

    const handleFocus = async () => {
      // Refresh data ketika window focus
      console.log('Window focused, refreshing data...');
      await forceUserRefresh();
    };

    // Event listeners untuk berbagai jenis update
    const eventTypes = [
      'dataUpdated',
      'userUpdated', 
      'memberUpdated',
      'profileUpdated',
      'userPhotoUpdated',
      'notificationUpdated'
    ];

    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleDataUpdate);
    });

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleDataUpdate);
      });
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [forceUserRefresh, fetchNotifications, fetchUnreadCount]);

  // Auto refresh setiap 30 detik untuk memastikan data selalu fresh
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('Auto refreshing user data...');
      await forceUserRefresh();
      await fetchNotifications();
      await fetchUnreadCount();
    }, 30000); // 30 detik

    return () => clearInterval(interval);
  }, [forceUserRefresh, fetchNotifications, fetchUnreadCount]);

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
    // Selalu tambahkan timestamp dan forceRefresh untuk cache busting
    const timestamp = Date.now();
    const refreshParam = `t=${timestamp}&r=${forceRefresh}`;
    
    if (foto.startsWith('http')) return `${foto}?${refreshParam}`;
    if (foto.startsWith('/uploads/') || foto.includes('uploads/')) {
      const fileName = foto.replace('/uploads/', '').replace('uploads/', '');
      return `${config.endpoints.uploads(fileName)}?${refreshParam}`;
    }
    return `${config.endpoints.uploads(foto)}?${refreshParam}`;
  };

  const handleAcceptStatusChange = async (requestId) => {
    try {
      await acceptStatusChange(requestId);
      
      // Trigger immediate refresh
      await forceUserRefresh();
      await fetchNotifications();
      await fetchUnreadCount();
      
      // Dispatch update event
      const event = new CustomEvent('dataUpdated', { 
        detail: { type: 'status_accepted', requestId } 
      });
      window.dispatchEvent(event);
      
      // Save to localStorage
      localStorage.setItem('data_updated', JSON.stringify({
        type: 'status_accepted',
        requestId,
        timestamp: Date.now()
      }));
      
    } catch (error) {
      console.error('Failed to accept status change:', error);
    }
  };

  const handleRejectStatusChange = async (requestId) => {
    try {
      await rejectStatusChange(requestId);
      
      // Trigger immediate refresh
      await forceUserRefresh();
      await fetchNotifications();
      await fetchUnreadCount();
      
      // Dispatch update event
      const event = new CustomEvent('dataUpdated', { 
        detail: { type: 'status_rejected', requestId } 
      });
      window.dispatchEvent(event);
      
      // Save to localStorage
      localStorage.setItem('data_updated', JSON.stringify({
        type: 'status_rejected',
        requestId,
        timestamp: Date.now()
      }));
      
    } catch (error) {
      console.error('Failed to reject status change:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      
      // Refresh notifications
      await fetchNotifications();
      await fetchUnreadCount();
      
      // Dispatch update event
      const event = new CustomEvent('notificationUpdated', { 
        detail: { type: 'mark_read', notificationId } 
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Detect mobile and close dropdowns when clicking outside
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      if (!event.target.closest('.user-dropdown') && isMobile) {
        setShowDropdown(false);
      }
    };

    const handleResize = () => {
      checkMobile();
      if (!isMobile) {
        setShowDropdown(false);
      }
    };

    checkMobile();
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  const handleUserClick = () => {
    if (isMobile) {
      setShowDropdown(!showDropdown);
    }
  };

  const handleUserMouseEnter = () => {
    if (!isMobile) {
      setShowDropdown(true);
    }
  };

  const handleUserMouseLeave = () => {
    if (!isMobile) {
      setShowDropdown(false);
    }
  };

  // Function to handle image load error
  const handleImageError = async (e) => {
    e.target.style.display = 'none';
    const fallback = e.target.nextSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
    
    // Try to refresh user data jika gambar gagal load
    console.log('Image load error, refreshing user data...');
    setTimeout(async () => {
      await forceUserRefresh();
    }, 1000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left side */}
        <div className="flex items-center space-x-3">
          {/* Hamburger button - mobile only */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Title */}
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-gray-900">
              Dashboard
            </h1>
            <p className="text-xs text-gray-500 hidden md:block">
              Sistem Manajemen Anggota
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Manual Refresh Button */}
          <button
            onClick={async () => {
              await forceUserRefresh();
              await fetchNotifications();
              await fetchUnreadCount();
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>

          {/* Notification Bell */}
          <div className="relative notification-dropdown">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <p className="text-xs text-gray-500">{unreadCount} belum dibaca</p>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        await fetchNotifications();
                        await fetchUnreadCount();
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Refresh"
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id_notification}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                            !notification.read_at ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </h4>
                                {!notification.read_at && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400">
                                {notification.from_member?.nama || 'System'} • {new Date(notification.created_at).toLocaleDateString('id-ID')}
                              </p>
                              
                              {notification.pending && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <button
                                    onClick={() => handleAcceptStatusChange(notification.metadata?.request_id)}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Terima
                                  </button>
                                  <button
                                    onClick={() => handleRejectStatusChange(notification.metadata?.request_id)}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
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
                                onClick={() => handleMarkAsRead(notification.id_notification)}
                                className="ml-2 text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                              >
                                ✓
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div 
            className="relative user-dropdown"
            onMouseEnter={handleUserMouseEnter}
            onMouseLeave={handleUserMouseLeave}
          >
            <button
              onClick={handleUserClick}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
                {isLoading ? (
                  <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                ) : getUserPhotoUrl(user?.foto) ? (
                  <>
                    <img
                      src={getUserPhotoUrl(user?.foto)}
                      alt={`Foto ${user?.nama}`}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                      key={`avatar-${forceRefresh}`}
                    />
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center" style={{ display: 'none' }}>
                      <span className="text-white text-xs font-semibold">
                        {getUserInitials(user?.nama)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {getUserInitials(user?.nama)}
                    </span>
                  </div>
                )}
              </div>

              {/* User Info - Hidden on mobile */}
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {isLoading ? 'Memuat...' : (user?.nama || 'User')}
                </div>
                <div className="text-xs text-gray-500">
                  {isLoading ? '' : getStatusLabel(user?.status_keanggotaan)}
                </div>
              </div>
              
              <ChevronDown className={`w-4 h-4 text-gray-500 hidden sm:block transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* User Info Dropdown - Shows on hover (desktop) or click (mobile) */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                {/* User Profile Details */}
                <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                      {getUserPhotoUrl(user?.foto) ? (
                        <>
                          <img
                            src={getUserPhotoUrl(user?.foto)}
                            alt={`Foto ${user?.nama}`}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                            key={`dropdown-avatar-${forceRefresh}`}
                          />
                          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center" style={{ display: 'none' }}>
                            <span className="text-white text-sm font-semibold">
                              {getUserInitials(user?.nama)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {getUserInitials(user?.nama)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {user?.nama || 'Unknown User'}
                      </div>
                      <div className="text-xs text-blue-700 font-medium">
                        {user?.nra || 'N/A'} • {getStatusLabel(user?.status_keanggotaan)}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {user?.email || 'No email'}
                      </div>
                      {user?.jurusan && (
                        <div className="text-xs text-gray-600">
                          {user.jurusan}
                        </div>
                      )}
                      {user?.angkatan && (
                        <div className="text-xs text-gray-600">
                          Angkatan {user.angkatan}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}