'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    console.log('🔐 Token check:', token ? 'Token exists' : 'No token found');
    console.log('🔐 Token length:', token ? token.length : 0);
    console.log('🔐 Token preview:', token ? `${token.substring(0, 50)}...` : 'N/A');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('🔑 Full Authorization header:', headers.Authorization);
    return headers;
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    console.log('🔄 fetchNotifications called');
    setLoading(true);
    try {
      const url = `${config.api.url}${config.endpoints.notifications}`;
      console.log('📡 Fetching from URL:', url);
      
      const headers = getAuthHeaders();
      console.log('🔑 Headers:', headers);
      
      const response = await fetch(url, { headers });
      
      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      console.log('📦 Response data type:', typeof data);
      console.log('📦 Response data.success:', data.success);
      console.log('📦 Response data.data:', data.data);
      console.log('📦 Response data.data type:', typeof data.data);
      console.log('📦 Response data.data isArray:', Array.isArray(data.data));
      
      let notificationsArray = [];
      
      // Try different response formats
      if (Array.isArray(data)) {
        console.log('✅ Direct array response');
        notificationsArray = data;
      } else if (data && data.success && Array.isArray(data.data)) {
        console.log('✅ Success response with data array');
        notificationsArray = data.data;
      } else if (data && data.data && Array.isArray(data.data)) {
        console.log('✅ Data object with array');
        notificationsArray = data.data;
      } else if (data && Array.isArray(data.notifications)) {
        console.log('✅ Notifications property array');
        notificationsArray = data.notifications;
      } else if (data && data.success && data.data === null) {
        console.log('✅ Success with null data (empty)');
        notificationsArray = [];
      } else {
        console.log('⚠️ Unexpected response format, trying data as array or empty');
        console.log('⚠️ Full response:', JSON.stringify(data, null, 2));
        // Last resort: try data property or empty array
        notificationsArray = Array.isArray(data.data) ? data.data : [];
      }
      
      console.log('📝 Final notifications array to set:', notificationsArray);
      console.log('📝 Array length:', notificationsArray.length);
      
      setNotifications(notificationsArray);
      
      // Force re-render by logging after state update (this will show in next render)
      setTimeout(() => {
        console.log('⏰ After setState - checking current state...');
      }, 100);
    } catch (error) {
      console.error('💥 Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
      console.log('✅ fetchNotifications completed');
    }
  };

  // Fetch unread count from API
  const fetchUnreadCount = async () => {
    console.log('🔄 fetchUnreadCount called');
    try {
      const url = `${config.api.url}${config.endpoints.notificationsUnreadCount}`;
      console.log('📡 Fetching unread count from URL:', url);
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      console.log('📨 Unread count response status:', response.status);
      console.log('📨 Unread count response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Unread count error response:', errorText);
        throw new Error('Failed to fetch unread count');
      }
      
      const data = await response.json();
      console.log('📦 Unread count response data:', data);
      
      if (data.success) {
        const count = data.data?.unread_count || 0;
        console.log('✅ Setting unread count:', count);
        setUnreadCount(count);
      } else {
        console.log('⚠️ Unread count API returned success=false, using notification count');
        setUnreadCount(notifications.filter(n => !n.read_at).length);
      }
    } catch (error) {
      console.error('💥 Failed to fetch unread count:', error);
      const fallbackCount = notifications.filter(n => !n.read_at).length;
      console.log('🔄 Using fallback unread count:', fallbackCount);
      setUnreadCount(fallbackCount);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${config.api.url}${config.endpoints.notificationMarkRead(notificationId)}`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id_notification === notificationId 
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Send role change notification
  const sendRoleChangeNotification = async (targetMemberId, fromRole, toRole) => {
    try {
      const response = await fetch(`${config.api.url}${config.endpoints.statusChangeRequest}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          target_member_id: targetMemberId,
          from_role: fromRole,
          to_role: toRole
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send role change notification');
      }
      
      const data = await response.json();
      
      // Refresh notifications after sending
      await fetchNotifications();
      await fetchUnreadCount();
      
      return data;
    } catch (error) {
      console.error('Failed to send role change notification:', error);
      throw error;
    }
  };

  // Accept role change
  const acceptRoleChange = async (requestId) => {
    try {
      const response = await fetch(`${config.api.url}${config.endpoints.statusChangeAccept(requestId)}`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept role change');
      }
      
      const data = await response.json();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.metadata?.request_id === requestId 
            ? { ...notification, pending: false, accepted: true }
            : notification
        )
      );
      
      // Refresh data from server
      await fetchNotifications();
      
      return data;
    } catch (error) {
      console.error('Failed to accept role change:', error);
      throw error;
    }
  };

  // Reject role change
  const rejectRoleChange = async (requestId) => {
    try {
      const response = await fetch(`${config.api.url}${config.endpoints.statusChangeReject(requestId)}`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject role change');
      }
      
      const data = await response.json();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.metadata?.request_id === requestId 
            ? { ...notification, pending: false, accepted: false }
            : notification
        )
      );
      
      // Refresh data from server
      await fetchNotifications();
      
      return data;
    } catch (error) {
      console.error('Failed to reject role change:', error);
      throw error;
    }
  };

    // Check if role change needs notification
  const needsRoleChangeNotification = (currentUserRole, targetCurrentRole, targetNewRole, isEditingSelf) => {
    // Tidak perlu notifikasi jika edit sendiri
    if (isEditingSelf) return false;

    // Aturan yang memerlukan notifikasi:
    // 1. BPH mengganti role sesama BPH
    if (currentUserRole === 'bph' && targetCurrentRole === 'bph') return true;
    
    // 2. BPH mengganti role DPO
    if (currentUserRole === 'bph' && targetCurrentRole === 'dpo') return true;
    
    // 3. DPO mengganti role sesama DPO  
    if (currentUserRole === 'dpo' && targetCurrentRole === 'dpo') return true;
    
    // 4. DPO mengganti role ALB
    if (currentUserRole === 'dpo' && targetCurrentRole === 'alb') return true;
    
    // 5. BPH mengganti role ALB
    if (currentUserRole === 'bph' && targetCurrentRole === 'alb') return true;

    // Yang TIDAK perlu notifikasi:
    // - DPO mengganti role BPH atau anggota
    // - BPH mengganti role Anggota
    if (currentUserRole === 'dpo' && (targetCurrentRole === 'bph' || targetCurrentRole === 'anggota')) return false;
    if (currentUserRole === 'bph' && targetCurrentRole === 'anggota') return false;

    return false;
  };

  // Load initial data when component mounts
  useEffect(() => {
    console.log('🚀 useNotifications useEffect triggered');
    const token = localStorage.getItem('token');
    if (token) {
      console.log('✅ Token found, loading notifications...');
      fetchNotifications();
      fetchUnreadCount();
    } else {
      console.log('❌ No token found, skipping notification load');
    }
  }, []);

  // Debug: Log notifications state changes
  useEffect(() => {
    console.log('🔄 Notifications state changed:', notifications);
    console.log('🔄 Notifications length:', notifications.length);
    console.log('🔄 Notifications content:', JSON.stringify(notifications, null, 2));
  }, [notifications]);

  // Debug: Log unread count changes
  useEffect(() => {
    console.log('🔢 Unread count changed:', unreadCount);
  }, [unreadCount]);

  // Refresh notifications periodically (every 30 seconds)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    sendRoleChangeNotification,
    acceptRoleChange,
    rejectRoleChange,
    needsRoleChangeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};