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
    uploads: (filename) => `${config.api.uploadsUrl}/${filename}`,
  }
};

export default config;
