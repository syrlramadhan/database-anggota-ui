// Environment configuration
const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    uploadsUrl: process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:8080/uploads',
  },
  endpoints: {
    member: '/member',
    memberProfile: '/profile',
    memberUpdate: (id) => `/member/${id}`,
    notifications: '/notifications',
    notificationsUnreadCount: '/notifications/unread/count',
    statusChangeRequest: '/status-change/request',
    statusChangeAccept: (requestId) => `/status-change/${requestId}/accept`,
    statusChangeReject: (requestId) => `/status-change/${requestId}/reject`,
    notificationMarkRead: (notificationId) => `/notifications/${notificationId}/read`,
    uploads: (filename) => `${config.api.uploadsUrl}/${filename}`,
  }
};

export default config;