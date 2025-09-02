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
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    return headers;
  };

  // Helper function to resolve member names from UUIDs
  const resolveMemberNames = async (notifications) => {
    try {
      const memberIds = new Set();
      notifications.forEach(notification => {
        if (notification.from_member) memberIds.add(notification.from_member);
        if (notification.target_member) memberIds.add(notification.target_member);
      });

      const memberMap = new Map();
      
      // Fetch member details for each UUID
      for (const memberId of memberIds) {
        try {
          const response = await fetch(`${config.api.url}${config.endpoints.memberUpdate(memberId)}`, {
            headers: getAuthHeaders()
          });
          if (response.ok) {
            const memberData = await response.json();
            if (memberData.code === 200 && memberData.data) {
              memberMap.set(memberId, memberData.data.nama || 'Unknown');
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch member ${memberId}:`, error);
          memberMap.set(memberId, 'Unknown');
        }
      }

      // Enhance notifications with member names
      return notifications.map(notification => ({
        ...notification,
        from_member_name: memberMap.get(notification.from_member) || 'Unknown',
        target_member_name: memberMap.get(notification.target_member) || 'Unknown'
      }));
    } catch (error) {
      console.error('Failed to resolve member names:', error);
      return notifications;
    }
  };
  const fetchNotifications = async () => {
    console.log('🔄 fetchNotifications called');
    setLoading(true);
    try {
      // Get current user untuk menentukan member ID
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser.id;
      
      if (!userId) {
        console.log('❌ No user ID found, cannot fetch notifications');
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      // Gunakan endpoint berdasarkan member ID
      const url = `${config.api.url}${config.endpoints.notificationsForMember(userId)}`;
      console.log('📡 Fetching notifications from:', url);
      console.log('👤 Current User ID:', userId);
      
      const headers = getAuthHeaders();
      // Tambahkan X-Member-ID header sesuai dokumentasi API
      headers['X-Member-ID'] = userId;
      
      console.log('📝 Request headers:', headers);
      
      const response = await fetch(url, { headers });
      
      console.log('📨 Response status notif:', response.status);
      console.log('📨 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 API Response:', data);
      
      // Parse response sesuai dokumentasi API
      let notificationsArray = [];
      
      if (data && data.code === 200 && Array.isArray(data.data)) {
        console.log('✅ Valid API response with notifications array');
        notificationsArray = data.data;
      } else if (Array.isArray(data)) {
        console.log('✅ Direct array response');
        notificationsArray = data;
      } else {
        console.log('⚠️ Unexpected response format:', data);
        notificationsArray = [];
      }
      
      console.log('📋 Parsed notifications:', notificationsArray);
      console.log('📊 Notifications count:', notificationsArray.length);
      
      // Resolve member names for better display
      const enhancedNotifications = await resolveMemberNames(notificationsArray);
      console.log('🏷️ Enhanced notifications with names:', enhancedNotifications);
      
      setNotifications(enhancedNotifications);
      
      // Update unread count
      const unread = enhancedNotifications.filter(n => !n.read_at).length;
      setUnreadCount(unread);
      console.log('🔔 Unread count:', unread);
      
    } catch (error) {
      console.error('💥 Failed to fetch notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
      console.log('✅ fetchNotifications completed');
    }
  };

  // Fetch unread count - Simplified version
  const fetchUnreadCount = async () => {
    console.log('🔄 fetchUnreadCount called - using local calculation');
    try {
      // Hitung unread count dari notifications yang ada
      const unread = notifications.filter(n => !n.read_at).length;
      setUnreadCount(unread);
      console.log('✅ Unread count updated:', unread);
    } catch (error) {
      console.error('💥 Failed to calculate unread count:', error);
      setUnreadCount(0);
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

  // Send status change notification - Menggunakan API yang sama dengan parameter berbeda
  const sendStatusChangeNotification = async (targetMemberId, fromStatus, toStatus) => {
    try {
      // Get current user untuk sender ID
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const senderId = currentUser.id;
      
      if (!senderId) {
        throw new Error('Sender ID tidak ditemukan');
      }
      
      // Tentukan jenis notifikasi berdasarkan status tujuan
      const isConfirmationNeeded = needsConfirmation(toStatus);
      
      // Gunakan endpoint DPO yang sama untuk semua notifikasi
      const url = `${config.api.url}${config.endpoints.sendDpoNotification(targetMemberId)}`;
      
      const headers = getAuthHeaders();
      // Tambahkan X-Member-ID header dengan sender ID
      headers['X-Member-ID'] = senderId;
      
      console.log('🔄 Sending status change notification');
      console.log('📡 URL:', url);
      console.log('🎯 Target Member ID:', targetMemberId);
      console.log('👤 Sender ID:', senderId);
      console.log('📊 Status change:', `${fromStatus} → ${toStatus}`);
      console.log('🔍 Notification type:', isConfirmationNeeded ? 'DPO Confirmation Required' : 'Auto-Accept Information');
      console.log('📝 Headers:', headers);
      
      // Body dengan parameter untuk membedakan jenis notifikasi
      const requestBody = {
        from_status: fromStatus,
        to_status: toStatus,
        notification_type: isConfirmationNeeded ? 'confirmation' : 'information',
        auto_accept: !isConfirmationNeeded  // Parameter untuk langsung accept jika bukan DPO
      };
      
      console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });
      
      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('🔍 Parsed error:', errorData);
        } catch (parseError) {
          console.error('🔍 Could not parse error as JSON');
        }
        
        throw new Error(`Failed to send status change notification: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Status change notification sent successfully:', data);
      
      // Refresh notifications setelah mengirim
      await fetchNotifications();
      
      return data;
    } catch (error) {
      console.error('💥 Failed to send status change notification:', error);
      throw error;
    }
  };

  // Accept notification - Sesuai dokumentasi API
  const acceptStatusChange = async (notificationId) => {
    try {
      const url = `${config.api.url}${config.endpoints.notificationStatus(notificationId)}?accepted=true`;
      
      console.log('✅ Accepting notification:', notificationId);
      console.log('📡 URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      console.log('📨 Accept response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to accept notification:', errorText);
        throw new Error(`Failed to accept notification: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Notification accepted successfully:', data);
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notification => 
          notification.id_notification === notificationId 
            ? { ...notification, pending: 0, accepted: 1, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return data;
    } catch (error) {
      console.error('💥 Failed to accept notification:', error);
      throw error;
    }
  };

  // Reject notification - Sesuai dokumentasi API
  const rejectStatusChange = async (notificationId) => {
    try {
      const url = `${config.api.url}${config.endpoints.notificationStatus(notificationId)}?accepted=false`;
      
      console.log('❌ Rejecting notification:', notificationId);
      console.log('📡 URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      console.log('📨 Reject response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to reject notification:', errorText);
        throw new Error(`Failed to reject notification: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Notification rejected successfully:', data);
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notification => 
          notification.id_notification === notificationId 
            ? { ...notification, pending: 0, accepted: 0, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return data;
    } catch (error) {
      console.error('💥 Failed to reject notification:', error);
      throw error;
    }
  };

  // Check if status change needs notification
  const needsStatusChangeNotification = (currentUserStatus, targetCurrentStatus, targetNewStatus, isEditingSelf) => {
    // Tidak perlu notifikasi jika edit sendiri
    if (isEditingSelf) return false;

    // Semua perubahan status oleh admin memerlukan notifikasi
    // Bedanya: DPO perlu konfirmasi, yang lain hanya pemberitahuan
    const isAdmin = currentUserStatus === 'bph' || currentUserStatus === 'dpo';
    
    if (!isAdmin) return false;

    // Aturan yang memerlukan notifikasi:
    // 1. BPH mengganti status siapa saja
    if (currentUserStatus === 'bph') return true;
    
    // 2. DPO mengganti status siapa saja  
    if (currentUserStatus === 'dpo') return true;

    return false;
  };

  // Check if notification needs confirmation (only for DPO status)
  const needsConfirmation = (targetNewStatus) => {
    return targetNewStatus === 'dpo';
  };

  // Initialize notifications on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      console.log('🚀 Token and user found, fetching notifications...');
      // Add small delay to ensure components are mounted
      setTimeout(() => {
        fetchNotifications();
      }, 100);
    } else {
      console.log('⚠️ No token or user found, skipping notification fetch');
      console.log('Token exists:', !!token);
      console.log('User exists:', !!user);
    }
  }, []);

  // Also fetch when user changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        console.log('🔄 Storage changed, re-fetching notifications...');
        fetchNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    sendStatusChangeNotification,
    acceptStatusChange,
    rejectStatusChange,
    needsStatusChangeNotification,
    needsConfirmation
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
