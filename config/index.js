// Environment configuration
const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dbanggota.syahrulramadhan.site',
    url: process.env.NEXT_PUBLIC_API_URL || 'https://dbanggota.syahrulramadhan.site/api',
    uploadsUrl: process.env.NEXT_PUBLIC_UPLOADS_URL || 'https://dbanggota.syahrulramadhan.site/uploads',
  },
  endpoints: {
    member: '/member',
    memberProfile: '/profile',
    uploads: (filename) => `${config.api.uploadsUrl}/${filename}`,
  }
};

export default config;
