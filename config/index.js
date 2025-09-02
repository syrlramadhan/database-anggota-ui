// Environment configuration
const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    uploadsUrl: process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:8080/uploads',
  },
  endpoints: {
    // Member endpoints
    member: '/member',
    memberUpdate: (id) => `/member/${id}`,
    memberProfile: '/profile',
    
    // Notification endpoints - Sesuai dokumentasi API
    notifications: '/notification/me',
    notificationsForMember: (memberId) => `/notification/member/${memberId}`,
    notificationsUnreadCount: '/notification/unread/count',
    
    // DPO notification - Endpoint untuk mengirim notifikasi (DPO perlu konfirmasi, lainnya auto-accept)
    sendDpoNotification: (targetId) => `/notification/dpo/${targetId}`,
    
    // Notification status management
    notificationStatus: (notificationId) => `/notification/${notificationId}/status`,
    notificationMarkRead: (notificationId) => `/notification/${notificationId}/read`,
    
    // File uploads
    uploads: (filename) => `${config.api.uploadsUrl}/${filename}`,
  }
};

export default config;  