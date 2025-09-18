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
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    return headers;
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url = `${config.api.url}${config.endpoints.notifications}`;
      
      const headers = getAuthHeaders();
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch notifications:', errorText);
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      
      let notificationsArray = [];
      
      // Try different response formats
      if (Array.isArray(data)) {
        notificationsArray = data;
      } else if (data && data.success && Array.isArray(data.data)) {
        notificationsArray = data.data;
      } else if (data && data.data && Array.isArray(data.data)) {
        notificationsArray = data.data;
      } else if (data && Array.isArray(data.notifications)) {
        notificationsArray = data.notifications;
      } else if (data && data.success && data.data === null) {
        notificationsArray = [];
      } else {
        // Last resort: try data property or empty array
        notificationsArray = Array.isArray(data.data) ? data.data : [];
      }
      
      setNotifications(notificationsArray);
      
      // Calculate and update unread count based on actual notifications
      const newUnreadCount = calculateUnreadCount(notificationsArray);
      setUnreadCount(newUnreadCount);
      
      // Force re-render by updating state
      setTimeout(() => {
        // State update completed
      }, 100);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate unread count
  const calculateUnreadCount = (notificationList) => {
    const count = notificationList.filter(notification => {
      // Count as unread if:
      // 1. Not read yet (!read_at)
      // 2. OR still pending (pending: true)
      return !notification.read_at || notification.pending;
    }).length;
    
    return count;
  };

  // Fetch unread count from API
  const fetchUnreadCount = async () => {
    try {
      const url = `${config.api.url}${config.endpoints.notificationsUnreadCount}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch unread count:', errorText);
        throw new Error('Failed to fetch unread count');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const count = data.data?.unread_count || 0;
        
        // But also check our local calculation for comparison
        const localCount = calculateUnreadCount(notifications);
        
        // Use the higher count (API might not include pending notifications)
        const finalCount = Math.max(count, localCount);
        setUnreadCount(finalCount);
      } else {
        const fallbackCount = calculateUnreadCount(notifications);
        setUnreadCount(fallbackCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      const fallbackCount = calculateUnreadCount(notifications);
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
      const updatedNotifications = notifications.map(notification => 
        notification.id_notification === notificationId 
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      );
      setNotifications(updatedNotifications);
      
      // Update unread count based on new notifications
      const newUnreadCount = calculateUnreadCount(updatedNotifications);
      setUnreadCount(newUnreadCount);
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
      const updatedNotifications = notifications.map(notification => 
        notification.metadata?.request_id === requestId 
          ? { ...notification, pending: false, accepted: true }
          : notification
      );
      setNotifications(updatedNotifications);
      
      // Update unread count based on new notifications
      const newUnreadCount = calculateUnreadCount(updatedNotifications);
      setUnreadCount(newUnreadCount);
      
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
      const updatedNotifications = notifications.map(notification => 
        notification.metadata?.request_id === requestId 
          ? { ...notification, pending: false, accepted: false }
          : notification
      );
      setNotifications(updatedNotifications);
      
      // Update unread count based on new notifications
      const newUnreadCount = calculateUnreadCount(updatedNotifications);
      setUnreadCount(newUnreadCount);
      
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
    console.log('🔔 Checking role change notification need:');
    console.log('🔔 Current user role:', currentUserRole);
    console.log('🔔 Target current role:', targetCurrentRole);
    console.log('🔔 Target new role:', targetNewRole);
    console.log('🔔 Is editing self:', isEditingSelf);
    
    // Tidak perlu notifikasi jika edit sendiri
    if (isEditingSelf) {
      console.log('🔔 Result: FALSE - editing self');
      return false;
    }

    // Aturan yang memerlukan notifikasi:
    // 1. BPH mengganti role sesama BPH
    if (currentUserRole === 'bph' && targetCurrentRole === 'bph') {
      console.log('🔔 Result: TRUE - BPH mengganti role sesama BPH');
      return true;
    }
    
    // 2. BPH mengganti role DPO
    if (currentUserRole === 'bph' && targetCurrentRole === 'dpo') {
      console.log('🔔 Result: TRUE - BPH mengganti role DPO');
      return true;
    }
    
    // 3. DPO mengganti role sesama DPO  
    if (currentUserRole === 'dpo' && targetCurrentRole === 'dpo') {
      console.log('🔔 Result: TRUE - DPO mengganti role sesama DPO');
      return true;
    }
    
    // 4. DPO mengganti role ALB
    if (currentUserRole === 'dpo' && targetCurrentRole === 'alb') {
      console.log('🔔 Result: TRUE - DPO mengganti role ALB');
      return true;
    }
    
    // 5. BPH mengganti role ALB
    if (currentUserRole === 'bph' && targetCurrentRole === 'alb') {
      console.log('🔔 Result: TRUE - BPH mengganti role ALB');
      return true;
    }

    // 6. DPO mengganti role BPH menjadi DPO (Added: 18 Sept 2025)
    // Ini memungkinkan DPO untuk "promote" BPH menjadi DPO dengan persetujuan
    if (currentUserRole === 'dpo' && targetCurrentRole === 'bph' && targetNewRole === 'dpo') {
      console.log('🔔 Result: TRUE - DPO mengganti role BPH menjadi DPO');
      return true;
    }

    // Yang TIDAK perlu notifikasi:
    // - DPO mengganti role BPH ke role lain selain DPO 
    // - DPO mengganti role anggota
    // - BPH mengganti role Anggota
    if (currentUserRole === 'dpo' && targetCurrentRole === 'bph' && targetNewRole !== 'dpo') {
      console.log('🔔 Result: FALSE - DPO mengganti role BPH ke role lain selain DPO');
      return false;
    }
    if (currentUserRole === 'dpo' && targetCurrentRole === 'anggota') {
      console.log('🔔 Result: FALSE - DPO mengganti role anggota');
      return false;
    }
    if (currentUserRole === 'bph' && targetCurrentRole === 'anggota') {
      console.log('🔔 Result: FALSE - BPH mengganti role anggota');
      return false;
    }

    console.log('🔔 Result: FALSE - default case');
    return false;
  };

  // Load initial data when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, []);

  // Recalculate unread count whenever notifications change
  useEffect(() => {
    // Recalculate unread count whenever notifications change
    if (notifications.length > 0) {
      const newUnreadCount = calculateUnreadCount(notifications);
      setUnreadCount(newUnreadCount);
    }
  }, [notifications]);

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